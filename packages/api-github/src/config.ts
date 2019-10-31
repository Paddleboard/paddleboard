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

registerMixins();
const defaultLogger = new ConsoleLogger(LogLevel.VERBOSE);

export const config = (): Middleware[] => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: defaultLogger.log as any }),
    HTTPBindingMiddleware(),
    CosmosMiddleware(),
    GitHubMiddleware(),
  ];
};
