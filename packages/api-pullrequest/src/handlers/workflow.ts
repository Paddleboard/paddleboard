import { App } from "@multicloud/sls-core";
import { AzureModule, StorageQueueMiddleware } from "@multicloud/sls-azure";
import { PullRequestService } from "@paddleboard/core";
import { PaddleboardCloudContext, PaddleboardEvent, PullRequestEvent } from "@paddleboard/contracts";

const middlewares = [StorageQueueMiddleware()];
const app = new App(new AzureModule());
app.registerMiddleware(...middlewares);

export const ingestPullRequest = app.use(async (context: PaddleboardCloudContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 500);
  }

  const pullRequestService = new PullRequestService();

  await context.event.records.forEachAsync(async (event: PaddleboardEvent<PullRequestEvent>) => {
    const existing = await pullRequestService.findSingle({ repositoryId: event.body.pullRequest.repositoryId, name: event.body.pullRequest.name });
    if (!existing) {
      await pullRequestService.save(event.body.pullRequest);
    }
  });

  context.send(null, 204);
});
