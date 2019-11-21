import fs from "fs";
import { PaddleboardCloudContext } from "@paddleboard/contracts";
import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { GitHubService } from "@paddleboard/github";
import { configApi, configWorkflow } from "./config";

if (!process.env.GITHUB_SIGNING_KEY) {
  process.env.GITHUB_SIGNING_KEY = fs.readFileSync(`${process.cwd()}/github.pem`).toString("utf8");
}

export interface GitHubApiContext extends PaddleboardCloudContext {
  github: GitHubService;
}

export const createApiApp = () => {
  const middlewares = configApi();
  const app = new App(new AzureModule);
  app.registerMiddleware(...middlewares);

  return app;
}

export const createWorkflowApp = () => {
  const middlewares = configWorkflow();
  const app = new App(new AzureModule);
  app.registerMiddleware(...middlewares);

  return app;
}
