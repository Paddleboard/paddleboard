import shortid from "shortid";
import { CloudContextBuilder } from "@multicloud/sls-core";
import { getCategoryListByUser } from "./category";
import { UserProfileService, CategoryService, Category, UserProfile } from "@paddleboard/core";

describe("User Profile Handlers", () => {
  let userProfile: UserProfile;
  let categories: Category[];

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

    categories = [{
      id: shortid.generate(),
      name: "Category 1",
      description: "I am category 1"
    }];

    UserProfileService.prototype.get = jest.fn(() => Promise.resolve(userProfile));
    CategoryService.prototype.getByUser = jest.fn(() => Promise.resolve(categories));
  });

  describe("Get Category list by user returns expected list of categories", () => {
    it("get a list of user profiles", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder
        .asHttpRequest()
        .withRequestMethod("GET")
        .withRequestPathParams({
          userId: "abc123"
        })
        .invokeHandler(getCategoryListByUser);

      expect(context.res.body).toEqual({ value: categories });
      expect(context.res.status).toEqual(200);
    });
  });
});
