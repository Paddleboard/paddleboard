import { DeveloperAccount, Repository, PullRequest, CodeReview } from "../models/app";

export interface SourceControlProvider {
  getRepositories(account: DeveloperAccount): Promise<Repository[]>;
  getPullRequests(repo: Repository): Promise<PullRequest[]>;
  getCodeReviews(pullRequest: PullRequest): Promise<CodeReview[]>;
}
