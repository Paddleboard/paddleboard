import { CosmosMiddleware, JwtMiddleware, CurrentUserMiddleware, UserProfileValidationMiddleware, registerMixins } from "@paddleboard/core";
import {
  LoggingServiceMiddleware,
  HTTPBindingMiddleware,
  PerformanceMiddleware,
  ExceptionMiddleware,
  ConsoleLogger,
  LogLevel,
} from "@multicloud/sls-core";
import { StorageQueueMiddleware } from "@multicloud/sls-azure";

registerMixins();
const defaultLogger = new ConsoleLogger(LogLevel.VERBOSE);

export const configApi = () => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: console.error as any }),
    HTTPBindingMiddleware(),
    JwtMiddleware(),
    CurrentUserMiddleware(),
    UserProfileValidationMiddleware(),
    CosmosMiddleware(),
  ];
};

export const configWorkflow = () => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: console.error as any }),
    StorageQueueMiddleware()
  ];
}
