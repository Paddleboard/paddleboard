import { PullRequestService } from "../services/pullRequestService";
import { RepositoryValidationMiddleware } from "./repositoryValidationMiddleware";
import { PaddleboardCloudContext } from "@paddleboard/contracts";
import { Middleware } from "@multicloud/sls-core";

const repositoryValidation = RepositoryValidationMiddleware();

export const PullRequestValidationMiddleware = (): Middleware => async (context: PaddleboardCloudContext, next: () => Promise<void>) => {
  await repositoryValidation(context, () => Promise.resolve());

  if (!context.repository) {
    return;
  }

  if (!context.req.pathParams.has("pullRequestId")) {
    return context.send({ message: "pullRequestId is required" }, 400);
  }

  const pullRequestId = context.req.pathParams.get("pullRequestId");
  const pullRequestService = new PullRequestService();
  const pullRequest = await pullRequestService.get(pullRequestId, context.repository.id);

  if (!pullRequest) {
    return context.send({ message: "pull request not found" }, 404);
  }

  context.pullRequest = pullRequest;

  await next();
};
