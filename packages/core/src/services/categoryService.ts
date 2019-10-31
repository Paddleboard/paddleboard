import { Category, UserProfile } from "@paddleboard/contracts";
import { ChildDataService } from "./childDataService";
import Guard from "../guard";

/**
 * Manages categories for user accounts
 */
export class CategoryService extends ChildDataService<UserProfile, Category> {
  public constructor() {
    super({
      collectionName: "UserProfile",
      databaseName: "Paddleboard",
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    }, "categories");
  }

  /**
   * Get a list of categories for the specified user
   * @param userId userId to filter
   */
  public async getByUser(userId: string): Promise<Category[]> {
    Guard.empty(userId, "userId");

    return await this.list(userId);
  }
}
