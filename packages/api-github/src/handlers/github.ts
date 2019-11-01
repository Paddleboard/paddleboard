import { app, GitHubApiContext } from "../app";
import { DeveloperAccount, DeveloperAccountType } from "@paddleboard/contracts";
import { QueueService } from "@paddleboard/core";
import { GitHubInstallationEvent } from "@paddleboard/github";

/**
 * Called when the Github app is installed an authorized on an account
 */
export const authorize = app.use(async (context: GitHubApiContext) => {
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

  const userAccessToken = await context.github.getUserAccessToken(code);
  const githubAccount = await context.github.getUserAccount(userAccessToken);
  const devAccount: DeveloperAccount = {
    providerType: DeveloperAccountType.GitHub,
    providerId: githubAccount.id.toString(),
    metadata: githubAccount
  };

  const installPayload: GitHubInstallationEvent = {
    account: devAccount,
    installationId: installationId
  };

  await queueService.enqueue(installPayload);

  context.res.headers.set("location", "https://paddleboard.breza.io");
  context.send(null, 302);
});

/**
 * Called when a github event fires (ex. pull request created / updated)
 */
export const hook = app.use((context: GitHubApiContext) => {
  context.send("OK", 200);
});
