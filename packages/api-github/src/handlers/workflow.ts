import { App } from "@multicloud/sls-core";
import { AzureModule, StorageQueueMiddleware } from "@multicloud/sls-azure";
import { GitHubMiddleware } from "../middleware/githubMiddleware";
import { GitHubApiContext } from "../app";
import { QueueService } from "@paddleboard/core";
import { DeveloperAccount, Repository, DeveloperAccountType } from "@paddleboard/contracts";

const middlewares = [StorageQueueMiddleware(), GitHubMiddleware()];
const app = new App(new AzureModule());
app.registerMiddleware(...middlewares);

/**
 * Called when github app installations are created
 */
export const install = app.use(async (context: GitHubApiContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 500);
  }

  const queueService = new QueueService({
    account: process.env.QUEUE_ACCOUNT_NAME,
    key: process.env.QUEUE_ACCOUNT_KEY,
    queueName: "repositories"
  });

  const events: [] = context.event.records;

  await events.forEachAsync(async (event: any) => {
    const account: DeveloperAccount = event.body.account;
    const repositories = await context.github.getRepositories(event.body.installationId);

    // Queue repo tasks for each mapped repository
    await repositories.mapAsync(async (githubRepo) => {
      const repo: Repository = {
        providerType: DeveloperAccountType.GitHub,
        name: githubRepo.name,
        description: githubRepo.description,
        portalUrl: githubRepo.html_url,
      };

      const payload = {
        account: account,
        repository: repo
      };

      await queueService.enqueue(payload);
    });
  });

  context.send(null, 204);
});
