import { authorize } from "./github";
import { CloudContextBuilder } from "@multicloud/sls-core";
import { GitHubService } from "@paddleboard/github";
import { QueueService } from "@paddleboard/core";
import { DeveloperAccountType } from "@paddleboard/contracts";

describe("Github Handler", () => {
  describe("authorize", () => {
    it("returns 400 status when code is not available", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder.asHttpRequest()
        .withRequestMethod("GET")
        .invokeHandler(authorize);

      expect(context.res.status).toEqual(400);
    });

    it("queues an install payload", async () => {
      const code = 12345;
      const installationId = 67890;
      const accessToken = "ACCESS_TOKEN";
      const githubAccount = {
        id: "ABC123"
      };

      GitHubService.prototype.getUserAccessToken = jest.fn(() => Promise.resolve(accessToken));
      GitHubService.prototype.getUserAccount = jest.fn(() => Promise.resolve(githubAccount)) as any;
      QueueService.prototype.enqueue = jest.fn();

      const builder = new CloudContextBuilder();
      const context = await builder.asHttpRequest()
        .withRequestMethod("GET")
        .withRequestQuery({ code, installation_id: installationId }) // eslint-disable-line @typescript-eslint/camelcase
        .invokeHandler(authorize);

      expect(GitHubService.prototype.getUserAccessToken).toBeCalledWith(code);
      expect(GitHubService.prototype.getUserAccount).toBeCalledWith(accessToken);
      expect(QueueService.prototype.enqueue).toBeCalledWith({
        account: expect.objectContaining({
          providerType: DeveloperAccountType.GitHub,
          providerId: githubAccount.id,
          metadata: githubAccount
        }),
        installationId
      });
      expect(context.res.status).toEqual(302);
    });
  });
});
