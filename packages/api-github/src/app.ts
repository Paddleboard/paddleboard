import { PaddleboardCloudContext } from "@paddleboard/contracts";
import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { GitHubService } from "@paddleboard/github";
import { config } from "./config";

export interface GitHubApiContext extends PaddleboardCloudContext {
  github: GitHubService;
}

const middlewares = config();
export const app = new App(new AzureModule);
app.registerMiddleware(...middlewares);
