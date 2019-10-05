import dotenv from "dotenv";
import { CosmosMiddleware, registerMixins } from "@paddleboard/core";
import {
  LoggingServiceMiddleware,
  HTTPBindingMiddleware,
  PerformanceMiddleware,
  ExceptionMiddleware,
  ConsoleLogger,
  LogLevel,
} from "@multicloud/sls-core";

dotenv.config();
registerMixins();
const defaultLogger = new ConsoleLogger(LogLevel.VERBOSE);

export const config = () => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: defaultLogger.log as any }),
    HTTPBindingMiddleware(),
    CosmosMiddleware(),
  ];
};
