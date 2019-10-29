import { StorageQueueMiddleware } from "@multicloud/sls-azure";
import { app, GitHubApiContext } from "../app";
import { config } from "../config"
import { DeveloperAccountService, QueueService, Repository, DeveloperAccountType } from "@paddleboard/core";
import { GitHubMiddleware } from "../middleware/githubMiddleware";

const middlewares = [...config(), GitHubMiddleware()];

/**
 * Called when the Github app is installed an authorized on an account
 */
export const authorize = app.use(middlewares, async (context: GitHubApiContext) => {
  const code = context.req.query.get("code");
  if (!code) {
    return context.send("Invalid request", 400);
  }

  const installationId = context.req.query.get("installation_id");

  const queueService = new QueueService({
    account: process.env.QUEUE_ACCOUNT_NAME,
    key: process.env.QUEUE_ACCOUNT_KEY,
    queueName: "github-installations"
  });

  const accountService = new DeveloperAccountService();
  const userAccessToken = await context.github.getUserAccessToken(code);
  const githubAccount = await context.github.getUserAccount(userAccessToken);

  const installPayload = {
    account: githubAccount,
    installationId: installationId
  };

  await queueService.enqueue(installPayload);

  context.res.headers.set("location", "https://paddleboard.breza.io");
  context.send(null, 302);
});

/**
 * Called when a github event fires (ex. pull request created / updated)
 */
export const hook = app.use(middlewares, (context: GitHubApiContext) => {
  context.send("OK", 200);
});

/**
 * Called when github app installations are created
 */
export const install = app.use([GitHubMiddleware(), StorageQueueMiddleware()], async (context: GitHubApiContext) => {
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
    const account: Account = event.body.account;
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
