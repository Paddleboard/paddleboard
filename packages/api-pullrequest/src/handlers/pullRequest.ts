import { app, PullRequestApiContext } from "../app";
import { PullRequestService, PullRequestValidationMiddleware, RepositoryValidationMiddleware } from "@paddleboard/core";

const repoValidation = RepositoryValidationMiddleware();
const pullValidation = PullRequestValidationMiddleware();

export const getPullRequestListByUser = app.use(async (context: PullRequestApiContext) => {
  const pullRequestService = new PullRequestService();
  const pulls = await pullRequestService.getByUser(context.user.id);

  context.send({ value: pulls }, 200);
});

export const getPullRequestListByRepo = app.use([repoValidation], async (context: PullRequestApiContext) => {
  const pullRequestService = new PullRequestService();
  const pulls = await pullRequestService.getByRepository(context.repository.id);

  context.send({ value: pulls }, 200);
});

export const getPullRequest = app.use([pullValidation], (context: PullRequestApiContext) => {
  context.send({ value: context.pullRequest }, 200);
});
