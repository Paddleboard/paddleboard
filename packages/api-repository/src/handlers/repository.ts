import { app, RepositoryApiContext } from "../app";
import { UserRepositoryService, RepositoryService, RepositoryValidationMiddleware, CategoryValidationMiddleware } from "@paddleboard/core";
import { Repository } from "@paddleboard/contracts";

const categoryValidation = CategoryValidationMiddleware();
const repoValidation = RepositoryValidationMiddleware();

export const getRepositoryListByUser = app.use(async (context: RepositoryApiContext) => {
  const repoService = new UserRepositoryService();
  const repos = await repoService.getByUser(context.user.id);

  context.send({ value: repos }, 200);
});

export const getRepositoryListByUserAndCategory = app.use([categoryValidation], async (context: RepositoryApiContext) => {
  const repoService = new UserRepositoryService();
  const repos = await repoService.getByCategory(context.user.id, context.category.id);

  context.send({ value: repos }, 200);
});

export const getRepository = app.use([repoValidation], (context: RepositoryApiContext) => {
  context.send({ value: context.repository }, 200);
});

export const postRepository = app.use(async (context: RepositoryApiContext) => {
  if (!context.req.body) {
    return context.send({ message: "repository is required" }, 400);
  }

  const repoToSave: Repository = {
    ...context.req.body,
    userId: context.user.id
  };

  const repoService = new RepositoryService();
  const repo = await repoService.save(repoToSave);
  const newUri = `/users/${context.user.id}/repos/${repo.id}`;

  context.res.headers.set("location", newUri);
  context.send({ value: repo }, 201);
});

export const putRepository = app.use([repoValidation], async (context: RepositoryApiContext) => {
  const repoToSave = {
    ...context.req.body,
    id: context.repository.id,
    userId: context.user.id
  };

  const repoService = new RepositoryService();
  await repoService.save(repoToSave);

  context.send(null, 204);
});

export const patchRepository = app.use([repoValidation], async (context: RepositoryApiContext) => {
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

export const deleteRepository = app.use([repoValidation], async (context: RepositoryApiContext) => {
  const userService = new RepositoryService();
  await userService.delete(context.repository.id, context.user.id);

  context.send(null, 204);
});
