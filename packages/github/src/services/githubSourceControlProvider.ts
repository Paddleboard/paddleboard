import { SourceControlProvider, DeveloperAccount, Repository, DeveloperAccountType, PullRequest, PullRequestState, CodeReview } from "@paddleboard/contracts";
import { GitHubService, GitHubServiceOptions } from "./github";

export class GitHubSourceControlProvider implements SourceControlProvider {
  private service: GitHubService;

  public constructor(options: GitHubServiceOptions) {
    this.service = new GitHubService(options);
  }

  public async getRepositories(account: DeveloperAccount): Promise<Repository[]> {
    const installationId = account.metadata.installationId;
    const repositories = await this.service.getRepositories(installationId);

    return repositories.map((repo) => {
      return {
        name: repo.name,
        description: repo.description,
        portalUrl: repo.url,
        providerType: DeveloperAccountType.GitHub,
        metadata: {
          installationId: installationId
        }
      };
    });
  }

  public async getPullRequests(repo: Repository): Promise<PullRequest[]> {
    const installationId = repo.metadata.installationId;
    const pullRequests = await this.service.getPullRequests(installationId, repo.owner, repo.name);

    return pullRequests.map((pullRequest) => {
      return {
        repositoryId: repo.id,
        name: pullRequest.title,
        description: pullRequest.body,
        portalUrl: pullRequest.url,
        state: PullRequestState.Active
      };
    });
  }

  public getCodeReviews(pullRequest: PullRequest): Promise<CodeReview[]> {
    return Promise.resolve([]);
  }
}
