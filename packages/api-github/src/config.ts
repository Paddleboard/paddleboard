import { CosmosMiddleware, registerMixins } from "@paddleboard/core";
import { GitHubMiddleware } from "./middleware/githubMiddleware";
import {
  LoggingServiceMiddleware,
  HTTPBindingMiddleware,
  PerformanceMiddleware,
  ExceptionMiddleware,
  ConsoleLogger,
  LogLevel,
  Middleware,
} from "@multicloud/sls-core";
import { StorageQueueMiddleware } from "@multicloud/sls-azure";

registerMixins();
const defaultLogger = new ConsoleLogger(LogLevel.VERBOSE);

export const configApi = (): Middleware[] => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: defaultLogger.log as any }),
    HTTPBindingMiddleware(),
    CosmosMiddleware(),
    GitHubMiddleware(),
  ];
};

export const configWorkflow = (): Middleware[] => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: defaultLogger.log as any }),
    StorageQueueMiddleware(),
    GitHubMiddleware()
  ];
}
