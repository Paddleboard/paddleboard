import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { PaddleboardCloudContext, Repository, Category } from "@paddleboard/contracts";
import { config } from "./config";

export interface RepositoryApiContext extends PaddleboardCloudContext {
  category?: Category;
  repository: Repository;
}

const middlewares = config();
export const app = new App(new AzureModule);
app.registerMiddleware(...middlewares);
