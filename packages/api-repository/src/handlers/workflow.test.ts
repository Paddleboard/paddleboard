import { CloudContextBuilder, TestContext } from "@multicloud/sls-core";
import { ingestRepository } from "./workflow";
import { QueueService, RepositoryService, SourceControlProviderFactory } from "@paddleboard/core";
import { RepositoryEvent, DeveloperAccount, DeveloperAccountType, Repository, PaddleboardEventCollection, PaddleboardEvent, SourceControlProvider } from "@paddleboard/contracts";

describe("Repository Workflows", () => {
  describe("Ingestion", () => {
    beforeAll(() => {
      jest.spyOn(TestContext.prototype, "send");
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

      const sourceControlProvider: SourceControlProvider = {
        getCodeReviews: jest.fn(() => Promise.resolve([])),
        getPullRequests: jest.fn(() => Promise.resolve([])),
        getRepositories: jest.fn(() => Promise.resolve([])),
      }

      SourceControlProviderFactory.create = jest.fn(() => sourceControlProvider);

      const account: DeveloperAccount = {
        providerId: "ABC123",
        providerType: DeveloperAccountType.GitHub,
        metadata: {},
      };

      const repository: Repository = {
        name: "paddleboard",
        owner: "paddleboard",
        description: "description of repo",
        portalUrl: "https://github.com/paddleboard/paddleboard",
        providerType: DeveloperAccountType.GitHub,
        metadata: {},
      }

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
    });
  });
});
