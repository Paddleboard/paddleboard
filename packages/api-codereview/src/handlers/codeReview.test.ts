import shortid from "shortid";
import { CloudContextBuilder } from "@multicloud/sls-core";
import { getCodeReviewListByUser } from "./codeReview";
import { UserProfileService, CodeReviewService } from "@paddleboard/core";
import { CodeReview, UserProfile, CodeReviewState } from "@paddleboard/contracts";

describe("Pull Request Handlers", () => {
  let userProfile: UserProfile;
  let reviews: CodeReview[];

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

    reviews = [{
      id: shortid.generate(),
      pullRequestId: "xyz123",
      userId: userProfile.id,
      state: CodeReviewState.Pending
    }];

    UserProfileService.prototype.get = jest.fn(() => Promise.resolve(userProfile));
    CodeReviewService.prototype.getByUser = jest.fn(() => Promise.resolve(reviews));
  });

  describe("Code Review API", () => {
    it("gets CodeReview list by user returns expected list of reviews", async () => {
      const builder = new CloudContextBuilder();
      const context = await builder
        .asHttpRequest()
        .withRequestMethod("GET")
        .withRequestPathParams({
          userId: "abc123"
        })
        .invokeHandler(getCodeReviewListByUser);

      expect(context.res.body).toEqual({ value: reviews });
      expect(context.res.status).toEqual(200);
    });
  });
});
