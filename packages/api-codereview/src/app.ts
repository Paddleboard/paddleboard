import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { PaddleboardCloudContext, PullRequest, Repository, Category } from "@paddleboard/core";
import { config } from "./config";

export interface CodeReviewApiContext extends PaddleboardCloudContext {
  repository?: Repository;
  pullRequest?: PullRequest;
}

const middlewares = config();
export const app = new App(new AzureModule);
app.registerMiddleware(...middlewares);
