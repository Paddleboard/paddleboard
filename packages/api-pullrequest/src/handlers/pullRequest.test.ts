import shortid from "shortid";
import { CloudContextBuilder } from "@multicloud/sls-core";
import { getPullRequestListByUser } from "./pullRequest";
import { UserProfileService, PullRequestService } from "@paddleboard/core";
import { PullRequest, UserProfile, PullRequestState } from "@paddleboard/contracts";

describe("Pull Request Handlers", () => {
  let userProfile: UserProfile;
  let pulls: PullRequest[];

  beforeAll(() => {
    userProfile = {
      id: shortid.generate(),
      firstName: "Wallace",
      lastName: "Breza",
      email: "wallace@breza.me",
      identity: {
        type: "github.com",
        externalId: "wbreza",
        metadata: {}
      }
    };

    pulls = [{
      id: shortid.generate(),
      name: "PullRequest 1",
      description: "I am pullRequest 1",
      portalUrl: "https://github.com/paddleboard/paddleboard/pull/123",
      repositoryId: "ABC123",
      state: PullRequestState.Active
    }];

    UserProfileService.prototype.get = jest.fn(() => Promise.resolve(userProfile));
    PullRequestService.prototype.getByUser = jest.fn(() => Promise.resolve(pulls));
  });

  describe("Get PullRequest list by user returns expected list of pulls", () => {
    it("get a list of user profiles", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder
        .asHttpRequest()
        .withRequestMethod("GET")
        .withRequestPathParams({
          userId: "abc123"
        })
        .invokeHandler(getPullRequestListByUser);

      expect(context.res.body).toEqual({ value: pulls });
      expect(context.res.status).toEqual(200);
    });
  });
});
