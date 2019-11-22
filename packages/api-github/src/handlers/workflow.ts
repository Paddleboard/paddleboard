import { GitHubApiContext, createWorkflowApp } from "../app";
import { QueueService } from "@paddleboard/core";
import { Repository, DeveloperAccountType, PaddleboardEvent, RepositoryEvent } from "@paddleboard/contracts";
import { GitHubInstallationEvent } from "@paddleboard/github";

const app = createWorkflowApp();

/**
 * Called when github app installations are created
 */
export const install = app.use(async (context: GitHubApiContext) => {
  if (!(context.event && context.event.records)) {
    return context.send({ message: "event is required" }, 400);
  }

  const repoQueue = new QueueService({
    account: process.env.QUEUE_ACCOUNT_NAME,
    key: process.env.QUEUE_ACCOUNT_KEY,
    queueName: "repositories"
  });

  await context.event.records.forEachAsync(async (event: PaddleboardEvent<GitHubInstallationEvent>) => {
    const repositories = await context.github.getRepositories(event.body.installationId);
    context.logger.info(`Found ${repositories.length} repositories for installation id '${event.body.installationId}'`)

    // Queue repo tasks for each mapped repository
    await repositories.mapAsync(async (githubRepo) => {
      const repo: Repository = {
        providerType: DeveloperAccountType.GitHub,
        name: githubRepo.name,
        owner: githubRepo.owner.login,
        description: githubRepo.description,
        portalUrl: githubRepo.html_url,
        metadata: {
          installationId: event.body.installationId
        }
      };

      const repoEvent: RepositoryEvent = {
        account: event.body.account,
        repository: repo
      };

      await repoQueue.enqueue(repoEvent);
      context.logger.info(`Enqueued new repo event for '${repo.name}'`);
    });
  });

  context.send(null, 204);
});
