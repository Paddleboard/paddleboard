import { app, RepositoryApiContext } from "../app";
import { config } from "../config"
import { UserRepositoryService, RepositoryService, UserProfileValidationMiddleware, RepositoryValidationMiddleware, CategoryValidationMiddleware, Repository } from "@paddleboard/core";
import { CloudContext } from "@multicloud/sls-core";
import { StorageQueueMiddleware } from "@multicloud/sls-azure";

const middlewares = config();
const userProfileValidation = UserProfileValidationMiddleware();
const categoryValidation = CategoryValidationMiddleware();
const repoValidation = RepositoryValidationMiddleware();

export const getRepositoryListByUser = app.use([...middlewares, userProfileValidation], async (context: RepositoryApiContext) => {
  const repoService = new UserRepositoryService();
  const repos = await repoService.getByUser(context.user.id);

  context.send({ value: repos }, 200);
});

export const getRepositoryListByUserAndCategory = app.use([...middlewares, categoryValidation], async (context: RepositoryApiContext) => {
  const repoService = new UserRepositoryService();
  const repos = await repoService.getByCategory(context.user.id, context.category.id);

  context.send({ value: repos }, 200);
});

export const getRepository = app.use([...middlewares, repoValidation], (context: RepositoryApiContext) => {
  context.send({ value: context.repository }, 200);
});

export const postRepository = app.use([...middlewares, userProfileValidation], async (context: RepositoryApiContext) => {
  if (!context.req.body) {
    return context.send({ message: "repository is required" }, 400);
  }

  const repoToSave: Repository = {
    ...context.req.body,
    userId: context.user.id
  };

  const repoService = new RepositoryService();
  const repo = await repoService.save(repoToSave);
  const newUri = `/users/${context.user.id}/repositories/${repo.id}`;

  context.res.headers.set("location", newUri);
  context.send({ value: repo }, 201);
});

export const putRepository = app.use([...middlewares, repoValidation], async (context: RepositoryApiContext) => {
  const repoToSave = {
    ...context.req.body,
    id: context.repository.id,
    userId: context.user.id
  };

  const repoService = new RepositoryService();
  await repoService.save(repoToSave);

  context.send(null, 204);
});

export const patchRepository = app.use([...middlewares, repoValidation], async (context: RepositoryApiContext) => {
  const repoToSave = {
    ...context.user,
    ...context.req.body,
    id: context.repository.id,
    userId: context.user.id
  };

  const repoServcie = new RepositoryService();
  await repoServcie.save(repoToSave);

  context.send(null, 204);
});

export const deleteRepository = app.use([...middlewares, repoValidation], async (context: RepositoryApiContext) => {
  const userService = new RepositoryService();
  await userService.delete(context.repository.id, context.user.id);

  context.send(null, 204);
});

export const ingestRepository = app.use([StorageQueueMiddleware()], async (context: CloudContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 500);
  }

  const repoService = new RepositoryService();
  const events: [] = context.event.records;

  await events.forEachAsync(async (event: any) => {
    const existing = await repoService.findSingle({ accountId: event.body.account.id, name: event.body.repository.name });
    if (!existing) {
      await repoService.save(event.body.repository);
    }
  });

  context.send(null, 204);
});
