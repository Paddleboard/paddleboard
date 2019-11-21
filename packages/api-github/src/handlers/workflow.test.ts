import { install } from "./workflow";
import { CloudContextBuilder, TestContext } from "@multicloud/sls-core";
import { GitHubInstallationEvent, GitHubService } from "@paddleboard/github";
import { PaddleboardEventCollection, PaddleboardEvent, DeveloperAccountType, DeveloperAccount } from "@paddleboard/contracts";
import { QueueService } from "@paddleboard/core";

describe("Github workflows", () => {
  describe("Install", () => {
    beforeAll(() => {
      jest.spyOn(TestContext.prototype, "send");
    });

    it("throws error if event is not defined", async () => {

      const builder = new CloudContextBuilder();
      const context = await builder
        .withEvent({})
        .invokeHandler(install);

      expect(context.send).toBeCalledWith({ message: "event is required" }, 400);
    });

    it("queues repo for each associated repository", async () => {
      const repositories = [
        {
          name: "paddleboard",
          description: "description for repo",
          html_url: "https://github.com/paddleboard/paddleboard", // eslint-disable-line @typescript-eslint/camelcase
        }
      ];

      QueueService.prototype.enqueue = jest.fn(() => Promise.resolve()) as any;
      GitHubService.prototype.getRepositories = jest.fn(() => Promise.resolve(repositories)) as any;

      const installationId = 12345;
      const githubAccount = {
        id: "ABC123"
      };

      const account: DeveloperAccount = {
        providerId: githubAccount.id,
        providerType: DeveloperAccountType.GitHub,
        metadata: githubAccount
      }

      const githubInstallEvent: PaddleboardEvent<GitHubInstallationEvent> = {
        id: "ABC123",
        eventSource: "Paddleboard.GithubInstallation",
        timestamp: new Date(),
        body: { account, installationId }
      };

      const cloudMessage: PaddleboardEventCollection = {
        records: [githubInstallEvent]
      }

      const builder = new CloudContextBuilder();
      const context = await builder
        .withEvent(cloudMessage)
        .invokeHandler(install);

      expect(GitHubService.prototype.getRepositories).toBeCalledWith(installationId);
      expect(QueueService.prototype.enqueue).toBeCalledTimes(repositories.length);
      expect(context.send).toBeCalledWith(null, 204);
    });
  });
});
