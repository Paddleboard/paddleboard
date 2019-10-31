import { GitHubService } from "@paddleboard/github";
import { GitHubApiContext } from "../app";

export const GitHubMiddleware = () => async (context: GitHubApiContext, next: () => Promise<void>) => {
  const githubService = new GitHubService({
    appId: process.env.GITHUB_APP_ID,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.GITHUB_REDIRECT_URI,
    signingKey: process.env.GITHUB_SIGNING_KEY
  });

  context.github = githubService;

  return await next();
};
