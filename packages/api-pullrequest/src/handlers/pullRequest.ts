import { app, PullRequestApiContext } from "../app";
import { PullRequestService, PullRequestValidationMiddleware, RepositoryValidationMiddleware, CategoryValidationMiddleware } from "@paddleboard/core";

const categoryValidation = CategoryValidationMiddleware();
const repoValidation = RepositoryValidationMiddleware();
const pullValidation = PullRequestValidationMiddleware();

export const getPullRequestListByUser = app.use(async (context: PullRequestApiContext) => {
  const pullRequestService = new PullRequestService();
  const pulls = await pullRequestService.getByUser(context.user.id);

  return { value: pulls };
});

export const getPullRequestListByRepo = app.use([repoValidation], async (context: PullRequestApiContext) => {
  const pullRequestService = new PullRequestService();
  const pulls = await pullRequestService.getByRepository(context.repository.id);

  return { value: pulls };
});

export const getPullRequestListByCategory = app.use([categoryValidation], async (context: PullRequestApiContext) => {
  const pullRequestService = new PullRequestService();
  const pulls = await pullRequestService.getByCategory(context.user.id, context.category.id);

  return { value: pulls };
});

export const getPullRequest = app.use([pullValidation], (context: PullRequestApiContext) => {
  return { value: context.pullRequest };
});
