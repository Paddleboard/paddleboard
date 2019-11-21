import { CloudContextBuilder, TestContext } from "@multicloud/sls-core";
import { ingestRepository } from "./workflow";
import { QueueService, RepositoryService, SourceControlProviderFactory } from "@paddleboard/core";
import { RepositoryEvent, DeveloperAccount, DeveloperAccountType, Repository, PaddleboardEventCollection, PaddleboardEvent, SourceControlProvider, PullRequest, PullRequestState } from "@paddleboard/contracts";
import shortid from "shortid";

describe("Repository Workflows", () => {
  describe("Ingestion", () => {
    let repository: Repository, pullRequests: PullRequest[], account: DeveloperAccount;

    beforeAll(() => {
      jest.spyOn(TestContext.prototype, "send");

      repository = {
        id: shortid.generate(),
        name: "paddleboard",
        owner: "paddleboard",
        description: "description of repo",
        portalUrl: "https://github.com/paddleboard/paddleboard",
        providerType: DeveloperAccountType.GitHub,
        metadata: {},
      };

      pullRequests = [
        {
          repositoryId: repository.id,
          name: "Fixes the bug",
          description: "description of pull request",
          portalUrl: "https://github.com/paddleboard/paddleboard/pulls/1",
          state: PullRequestState.Active,
        }
      ];

      account = {
        providerId: "ABC123",
        providerType: DeveloperAccountType.GitHub,
        metadata: {},
      };
    });

    it("fails when even is missing", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder
        .withEvent({})
        .invokeHandler(ingestRepository);

      expect(context.send).toBeCalledWith({ message: "event is required" }, 400);
    });

    it("saves new repository if doesn't already exist", async () => {
      QueueService.prototype.enqueue = jest.fn(() => Promise.resolve()) as any;
      RepositoryService.prototype.findSingle = jest.fn(() => Promise.resolve(null));
      RepositoryService.prototype.save = jest.fn((repo) => Promise.resolve(repo));

      const sourceControlProvider: SourceControlProvider = {
        getCodeReviews: jest.fn(() => Promise.resolve([])),
        getPullRequests: jest.fn(() => Promise.resolve(pullRequests)),
        getRepositories: jest.fn(() => Promise.resolve([])),
      };

      SourceControlProviderFactory.create = jest.fn(() => sourceControlProvider);

      const repoEvent: PaddleboardEvent<RepositoryEvent> = {
        id: "ABC123",
        eventSource: "Paddleboard.RepositoryEvent",
        timestamp: new Date(),
        body: { account, repository }
      };

      const cloudMessage: PaddleboardEventCollection = {
        records: [repoEvent]
      }

      const builder = new CloudContextBuilder();
      const context = await builder
        .withEvent(cloudMessage)
        .invokeHandler(ingestRepository);

      expect(context.send).toBeCalledWith(null, 204);
      expect(RepositoryService.prototype.save).toBeCalled();
      expect(QueueService.prototype.enqueue).toBeCalledTimes(pullRequests.length);
    });

    it("does not call save when repository already exists", async () => {
      QueueService.prototype.enqueue = jest.fn(() => Promise.resolve()) as any;
      RepositoryService.prototype.findSingle = jest.fn(() => Promise.resolve(repository));
      RepositoryService.prototype.save = jest.fn((repo) => Promise.resolve(repo));

      const sourceControlProvider: SourceControlProvider = {
        getCodeReviews: jest.fn(() => Promise.resolve([])),
        getPullRequests: jest.fn(() => Promise.resolve(pullRequests)),
        getRepositories: jest.fn(() => Promise.resolve([])),
      };

      SourceControlProviderFactory.create = jest.fn(() => sourceControlProvider);

      const repoEvent: PaddleboardEvent<RepositoryEvent> = {
        id: "ABC123",
        eventSource: "Paddleboard.RepositoryEvent",
        timestamp: new Date(),
        body: { account, repository }
      };

      const cloudMessage: PaddleboardEventCollection = {
        records: [repoEvent]
      }

      const builder = new CloudContextBuilder();
      const context = await builder
        .withEvent(cloudMessage)
        .invokeHandler(ingestRepository);

      expect(context.send).toBeCalledWith(null, 204);
      expect(RepositoryService.prototype.save).not.toBeCalled();
      expect(QueueService.prototype.enqueue).toBeCalledTimes(pullRequests.length);
    });
  });
});
