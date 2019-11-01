import { App } from "@multicloud/sls-core";
import { AzureModule, StorageQueueMiddleware } from "@multicloud/sls-azure";
import { RepositoryService, SourceControlProviderFactory, QueueService } from "@paddleboard/core";
import { PaddleboardCloudContext, PaddleboardEvent, RepositoryEvent, PullRequestEvent } from "@paddleboard/contracts";

const middlewares = [StorageQueueMiddleware()];
const app = new App(new AzureModule());
app.registerMiddleware(...middlewares);

export const ingestRepository = app.use(async (context: PaddleboardCloudContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 500);
  }

  const repoService = new RepositoryService();
  const pullRequestQueue = new QueueService({
    account: process.env.QUEUE_ACCOUNT_NAME,
    key: process.env.QUEUE_ACCOUNT_KEY,
    queueName: "pullrequests"
  });

  await context.event.records.forEachAsync(async (event: PaddleboardEvent<RepositoryEvent>) => {
    const existing = await repoService.findSingle({ owner: event.body.repository.owner, name: event.body.repository.name });
    if (!existing) {
      await repoService.save(event.body.repository);
    }

    const sourceControlProvider = SourceControlProviderFactory.create(event.body.repository.providerType);
    const pullRequests = await sourceControlProvider.getPullRequests(existing);

    await pullRequests.mapAsync(async (pullRequest) => {
      const pullevent: PullRequestEvent = {
        account: event.body.account,
        pullRequest: pullRequest
      }

      await pullRequestQueue.enqueue(pullevent);
    });
  });

  context.send(null, 204);
});
