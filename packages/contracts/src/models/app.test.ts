import shortid from "shortid"
import { Category, Repository, UserProfile, DeveloperAccount, DeveloperAccountType, PullRequest, PullRequestState, CodeReview, CodeReviewState } from "./app";

describe("App Models", (): void => {
  const githubAccount: DeveloperAccount = {
    id: shortid.generate(),
    providerType: DeveloperAccountType.GitHub,
    providerId: "wbreza"
  };

  const user: UserProfile = {
    id: shortid.generate(),
    email: "wallace@breza.me",
    firstName: "Wallace",
    lastName: "Breza",
    identity: {
      type: "github.com",
      externalId: "wbreza"
    }
  };

  const category: Category = {
    id: shortid.generate(),
    name: "Personal"
  };

  const repo: Repository = {
    id: shortid.generate(),
    providerType: DeveloperAccountType.GitHub,
    name: "paddleboard",
    portalUrl: "https://github.com/paddleboard/paddleboard"
  }

  const pullRequest: PullRequest = {
    id: shortid.generate(),
    name: "Fixed the bug!",
    repositoryId: repo.id,
    description: "Fixes the bug that breaks the build",
    portalUrl: "https://github.com/paddleboard/paddleboard/pulls/1",
    state: PullRequestState.Active
  };

  const codeReview: CodeReview = {
    id: shortid.generate(),
    pullRequestId: pullRequest.id,
    userId: user.id,
    state: CodeReviewState.Pending
  };

  it("exists without typescript error", (): void => {
    expect(repo).not.toBeNull();
    expect(repo.id).not.toBeNull();
    expect(category.id).not.toBeNull();
    expect(user.id).not.toBeNull();
    expect(githubAccount.id).not.toBeNull();
    expect(pullRequest).not.toBeNull();
    expect(codeReview).not.toBeNull();
  });
});
