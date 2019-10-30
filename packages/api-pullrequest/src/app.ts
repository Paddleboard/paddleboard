import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { PaddleboardCloudContext, PullRequest, Repository } from "@paddleboard/core";
import { config } from "./config";

export interface PullRequestApiContext extends PaddleboardCloudContext {
  pullRequest: PullRequest;
  repository?: Repository;
}

const middlewares = config();
export const app = new App(new AzureModule);
app.registerMiddleware(...middlewares);
