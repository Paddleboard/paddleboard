import fs from "fs";
import { PaddleboardCloudContext } from "@paddleboard/contracts";
import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { GitHubService } from "@paddleboard/github";
import { config } from "./config";

if (!process.env.GITHUB_SIGNING_KEY) {
  process.env.GITHUB_SIGNING_KEY = fs.readFileSync(`${process.cwd()}/github.pem`).toString("utf8");
}

export interface GitHubApiContext extends PaddleboardCloudContext {
  github: GitHubService;
}

const middlewares = config();
export const app = new App(new AzureModule);
app.registerMiddleware(...middlewares);
