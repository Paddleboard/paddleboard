import { DeveloperAccount, Repository, PullRequest } from "./app";

export interface RepositoryEvent {
  account: DeveloperAccount;
  repository: Repository;
}

export interface PullRequestEvent {
  account: DeveloperAccount;
  pullRequest: PullRequest;
}
