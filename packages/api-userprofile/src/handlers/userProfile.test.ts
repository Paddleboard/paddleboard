import shortid from "shortid";
import { CloudContextBuilder } from "@multicloud/sls-core";
import { getUserProfileList } from "./userProfile";
import { UserProfileService } from "@paddleboard/core";
import { UserProfile } from "@paddleboard/contracts";

describe("User Profile Handlers", () => {
  let users: UserProfile[];

  beforeAll(() => {
    users = [{
      id: shortid.generate(),
      firstName: "Wallace",
      lastName: "Breza",
      email: "wallace@breza.me",
      identity: {
        externalId: "wbreza",
        type: "github.com"
      }
    }];

    UserProfileService.prototype.list = jest.fn(() => Promise.resolve(users));
  });

  describe("Get user profile list returns list of user profiles", () => {
    it("get a list of user profiles", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder
        .asHttpRequest()
        .withRequestMethod("GET")
        .invokeHandler(getUserProfileList);

      expect(context.res.body).toEqual({ value: users });
      expect(context.res.status).toEqual(200);
    });
  });
});
