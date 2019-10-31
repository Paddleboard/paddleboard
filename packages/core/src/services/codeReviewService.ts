import { DataServiceBase, DataListOptions } from "./dataService";
import { CodeReview } from "@paddleboard/contracts";
import Guard from "../guard";

/**
 * Manages code reviews
 */
export class CodeReviewService extends DataServiceBase<CodeReview> {
  public constructor() {
    super({
      collectionName: "CodeReview",
      databaseName: "Paddleboard",
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
      collectionOptions: {
        partitionKey: {
          paths: ["/pullRequestId"]
        }
      }
    });
  }

  /**
   * Gets a list of code reviews by the specified user account
   * @param userId The userId to filter code reviews by
   * @param options Set of options to filter & page query
   */
  public async getByUser(userId: string, options?: DataListOptions): Promise<CodeReview[]> {
    Guard.empty(userId, "userId");

    return await this.find({ userId }, options);
  }

  /**
   * Gets a list of code reviews by the specified pull request
   * @param pullRequestId The pull request to filter code reviews by
   * @param options Set of options to filter & page query
   */
  public async getByPullRequest(pullRequestId: string, options?: DataListOptions): Promise<CodeReview[]> {
    Guard.empty(pullRequestId, "pullRequestId");

    return await this.find({ pullRequestId }, options);
  }
}
