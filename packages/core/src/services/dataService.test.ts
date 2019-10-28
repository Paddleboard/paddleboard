import { UserProfileService } from "./userProfileService";
import { RepositoryService } from "./repositoryService";
import { AccountService } from "./accountService";
import { CategoryService } from "./categoryService";
import { PullRequestService } from "./pullRequestService";
import { CodeReviewService } from "./codeReviewService";
import { UserProfile, Category, Repository, DeveloperAccount, DeveloperAccountType, CodeReview, PullRequest, PullRequestState, CodeReviewState } from "../models/app";
import { UserRepositoryService } from "./userRepositoryService";

describe("Repository Data Service", (): void => {
  let
    userProfileService: UserProfileService,
    accountService: AccountService,
    categoryService: CategoryService,
    pullRequestService: PullRequestService,
    codeReviewService: CodeReviewService,
    repositoryService: RepositoryService,
    userRepositoryService: UserRepositoryService;

  beforeAll(async () => {
    userProfileService = new UserProfileService();
    accountService = new AccountService();
    categoryService = new CategoryService();
    pullRequestService = new PullRequestService();
    codeReviewService = new CodeReviewService();
    repositoryService = new RepositoryService();
    userRepositoryService = new UserRepositoryService();

    await Promise.all([
      userProfileService.init(),
      repositoryService.init(),
      pullRequestService.init(),
      codeReviewService.init()
    ]);
  });

  function randomString() {
    return Math.random().toString(36).substring(7);
  }

  it("Creates the domain graph", async () => {
    const random = randomString();

    let userProfile: UserProfile = {
      firstName: `First ${random}`,
      lastName: `Last ${random}`,
      email: `${random}@contoso.com`,
      identity: {
        externalId: random,
        type: "test"
      }
    }

    userProfile = await userProfileService.save(userProfile);

    let category: Category = {
      name: "Personal",
      description: "Description of my category",
    };

    category = await categoryService.save(category, userProfile.id);

    let account: DeveloperAccount = {
      providerId: random,
      providerType: DeveloperAccountType.GitHub
    };

    account = await accountService.save(account, userProfile.id);

    let repo: Repository = {
      name: "Paddleboard",
      providerType: account.providerType,
      portalUrl: "https://github.com/wbreza/paddleboard"
    };

    repo = await repositoryService.save(repo);
    await userRepositoryService.save({ ...repo, categoryId: category.id }, userProfile.id);

    let pullRequest: PullRequest = {
      name: "fix: Fixed the bug!",
      description: "Fixed the bug by using my brain",
      repositoryId: repo.id,
      state: PullRequestState.Active,
      portalUrl: `https://github.com/wbreza/paddleboard/pulls/${random}`
    };

    pullRequest = await pullRequestService.save(pullRequest);

    let codeReview: CodeReview = {
      pullRequestId: pullRequest.id,
      userId: userProfile.id,
      state: CodeReviewState.Pending
    };

    codeReview = await codeReviewService.save(codeReview);

    const categoryRepos = await userRepositoryService.getByCategory(userProfile.id, category.id);
    expect(categoryRepos).toHaveLength(1);

    // Clean up
    codeReviewService.delete(codeReview.id, repo.id);
    pullRequestService.delete(pullRequest.id, repo.id);
    repositoryService.delete(repo.id);
    userProfileService.delete(userProfile.id);
  });
});
