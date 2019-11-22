import { App } from "@multicloud/sls-core";
import { AzureModule } from "@multicloud/sls-azure";
import { PaddleboardCloudContext, Repository, Category } from "@paddleboard/contracts";
import { configApi, configWorkflow } from "./config";

export interface RepositoryApiContext extends PaddleboardCloudContext {
  category?: Category;
  repository: Repository;
}

export const createApiApp = () => {
  const middlewares = configApi();
  const app = new App(new AzureModule);
  app.registerMiddleware(...middlewares);

  return app;
};

export const createWorkflowApp = () => {
  const middlewares = configWorkflow();
  const app = new App(new AzureModule);
  app.registerMiddleware(...middlewares);

  return app;
};
