import { PullRequestService } from "@paddleboard/core";
import { PaddleboardCloudContext, PaddleboardEvent, PullRequestEvent } from "@paddleboard/contracts";
import { createWorkflowApp } from "../app";

const app = createWorkflowApp();

export const ingestPullRequest = app.use(async (context: PaddleboardCloudContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 500);
  }

  const pullRequestService = new PullRequestService();

  context.logger.info(`Processing ${context.event.records.length} pull request events...`);

  await context.event.records.forEachAsync(async (event: PaddleboardEvent<PullRequestEvent>) => {
    let pullRequest = await pullRequestService.findSingle({
      repositoryId: event.body.pullRequest.repositoryId,
      name: event.body.pullRequest.name
    });

    if (!pullRequest) {
      pullRequest = await pullRequestService.save(event.body.pullRequest);
      context.logger.info(`Created new pull request '${pullRequest.name}'`);
    }
  });

  context.send(null, 204);
});
