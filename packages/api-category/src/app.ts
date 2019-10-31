import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { PaddleboardCloudContext, Category } from "@paddleboard/contracts";
import { config } from "./config";

export interface CategoryApiContext extends PaddleboardCloudContext {
  category: Category;
}

const middlewares = config();
export const app = new App(new AzureModule);
app.registerMiddleware(...middlewares);
