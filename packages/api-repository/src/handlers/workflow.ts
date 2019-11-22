import { RepositoryService, SourceControlProviderFactory, QueueService } from "@paddleboard/core";
import { PaddleboardCloudContext, PaddleboardEvent, RepositoryEvent, PullRequestEvent } from "@paddleboard/contracts";
import { createWorkflowApp } from "../app";

const app = createWorkflowApp();

export const ingestRepository = app.use(async (context: PaddleboardCloudContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 400);
  }

  const repoService = new RepositoryService();
  const pullRequestQueue = new QueueService({
    account: process.env.QUEUE_ACCOUNT_NAME,
    key: process.env.QUEUE_ACCOUNT_KEY,
    queueName: "pullrequests"
  });

  context.logger.info(`Processing ${context.event.records.length} repo events...`);

  await context.event.records.forEachAsync(async (event: PaddleboardEvent<RepositoryEvent>) => {
    console.log(1);
    let repo = await repoService.findSingle({
      owner: event.body.repository.owner,
      name: event.body.repository.name
    });
    console.log(2);

    if (!repo) {
      repo = await repoService.save(event.body.repository);
      context.logger.info(`Created new repo '${repo.name}'`);
    }
    console.log(3);

    const sourceControlProvider = SourceControlProviderFactory.create(event.body.repository.providerType);
    console.log(4);

    const pullRequests = await sourceControlProvider.getPullRequests(repo);
    console.log(5);

    context.logger.info(`Found ${pullRequests.length} pull requests for repo ${repo.name}`);

    await pullRequests.mapAsync(async (pullRequest) => {
      const pullevent: PullRequestEvent = {
        account: event.body.account,
        pullRequest: pullRequest
      }

      await pullRequestQueue.enqueue(pullevent);
      console.log(6);
      context.logger.info(`Enqueued new pull request event for '${pullRequest.name}'`);
    });
  });

  console.log(7);

  context.send(null, 204);
});
