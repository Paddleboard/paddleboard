import { UserProfileService } from "./userProfileService";
import { RepositoryService } from "./repositoryService";
import { DeveloperAccountService } from "./developerAccountService";
import { CategoryService } from "./categoryService";
import { PullRequestService } from "./pullRequestService";
import { CodeReviewService } from "./codeReviewService";
import { UserProfile, Category, Repository, DeveloperAccount, DeveloperAccountType, CodeReview, PullRequest, PullRequestState, CodeReviewState } from "@paddleboard/contracts";
import { UserRepositoryService } from "./userRepositoryService";

jest.setTimeout(10000);

describe("Repository Data Service", (): void => {
  let
    userProfileService: UserProfileService,
    accountService: DeveloperAccountService,
    categoryService: CategoryService,
    pullRequestService: PullRequestService,
    codeReviewService: CodeReviewService,
    repositoryService: RepositoryService,
    userRepositoryService: UserRepositoryService;

  beforeAll(async () => {
    userProfileService = new UserProfileService();
    accountService = new DeveloperAccountService();
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

  it("supports paging correctly", async () => {
    let skip = 0;
    const take = 5;
    const allUsers: any = {};

    while (true) {
      const users = await userProfileService.list({ skip, take });
      expect(users.length).toBeLessThanOrEqual(take);

      users.forEach((user) => {
        const existing = allUsers[user.id];
        if (existing) {
          fail("Duplicate entry detected");
        }

        allUsers[user.id] = user;
      });

      if (users.length < take) {
        break;
      }

      skip += take;
    }
  });

  it("Creates and validates the domain graph", async () => {
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
      portalUrl: "https://github.com/wbreza/paddleboard",
      metadata: {},
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

    const accounts = await accountService.getByUser(userProfile.id);
    expect(accounts).toHaveLength(1);

    const accountsByEmail = await accountService.getByEmail(userProfile.email);
    expect(accountsByEmail).toHaveLength(1);

    const categories = await categoryService.getByUser(userProfile.id);
    expect(categories).toHaveLength(1);

    const categoryRepos = await userRepositoryService.getByCategory(userProfile.id, category.id);
    expect(categoryRepos).toHaveLength(1);

    const categoryPullRequests = await pullRequestService.getByCategory(userProfile.id, category.id);
    expect(categoryPullRequests).toHaveLength(1);

    const userPullRequests = await pullRequestService.getByUser(userProfile.id);
    expect(userPullRequests).toHaveLength(1);

    const userCodeReviews = await codeReviewService.getByUser(userProfile.id);
    expect(userCodeReviews).toHaveLength(1);

    const pullRequestCodeReviews = await codeReviewService.getByPullRequest(pullRequest.id);
    expect(pullRequestCodeReviews).toHaveLength(1);

    // Clean up
    codeReviewService.delete(codeReview.id, repo.id);
    pullRequestService.delete(pullRequest.id, repo.id);
    repositoryService.delete(repo.id);
    userProfileService.delete(userProfile.id);
  });
});
