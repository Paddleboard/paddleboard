import { CosmosMiddleware, UserProfileValidationMiddleware, registerMixins, JwtMiddleware, CurrentUserMiddleware, SourceControlProviderFactory } from "@paddleboard/core";
import {
  LoggingServiceMiddleware,
  HTTPBindingMiddleware,
  PerformanceMiddleware,
  ExceptionMiddleware,
  ConsoleLogger,
  LogLevel,
} from "@multicloud/sls-core";
import { DeveloperAccountType } from "@paddleboard/contracts";
import { GitHubServiceOptions, GitHubSourceControlProvider } from "@paddleboard/github";
import { StorageQueueMiddleware } from "@multicloud/sls-azure";

registerMixins();
const defaultLogger = new ConsoleLogger(LogLevel.VERBOSE);

const githubOptions: GitHubServiceOptions = {
  appId: process.env.GITHUB_APP_ID,
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: process.env.GITHUB_REDIRECT_URI,
  signingKey: process.env.GITHUB_SIGNING_KEY
};

SourceControlProviderFactory.register({
  type: DeveloperAccountType.GitHub,
  factory: () => new GitHubSourceControlProvider(githubOptions)
})

export const configApi = () => {
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

export const configWorkflow = () => {
  return [
    LoggingServiceMiddleware(defaultLogger),
    PerformanceMiddleware(),
    ExceptionMiddleware({ log: defaultLogger.log as any }),
    StorageQueueMiddleware()
  ];
};
