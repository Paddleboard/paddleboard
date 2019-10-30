import { CosmosMiddleware, JwtMiddleware, CurrentUserMiddleware, UserProfileValidationMiddleware } from "@paddleboard/core";
import {
  LoggingServiceMiddleware,
  HTTPBindingMiddleware,
  PerformanceMiddleware,
  ExceptionMiddleware,
  ConsoleLogger,
  LogLevel,
} from "@multicloud/sls-core";

const defaultLogger = new ConsoleLogger(LogLevel.VERBOSE);

export const config = () => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: defaultLogger.log as any }),
    HTTPBindingMiddleware(),
    JwtMiddleware(),
    CurrentUserMiddleware(),
    UserProfileValidationMiddleware(),
    CosmosMiddleware(),
  ];
};
