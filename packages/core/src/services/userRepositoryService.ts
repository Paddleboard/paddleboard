import { Repository, UserProfile } from "@paddleboard/contracts";
import { ChildDataService } from "./childDataService";
import { Guard } from "@multicloud/sls-core";

/**
 * Manages repositories for a paddleboard user profile
 */
export class UserRepositoryService extends ChildDataService<UserProfile, Repository> {
  public constructor() {
    super({
      collectionName: "UserProfile",
      databaseName: "Paddleboard",
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    }, "repositories");
  }

  /**
   * Gets a list of repositories by the specified user profile
   * @param userId The user to filter by
   */
  public async getByUser(userId: string): Promise<Repository[]> {
    Guard.empty(userId, "userId");

    return await this.list(userId);
  }

  /**
   * Gets a list of repositories by the specified user category
   * @param userId The user to filter by
   * @param categoryId The category to filter by
   */
  public async getByCategory(userId: string, categoryId: string): Promise<Repository[]> {
    Guard.empty(userId, "userId");
    Guard.empty(categoryId, "categoryId");

    const repositories = await this.list(userId);
    return repositories.filter((repo) => repo.categoryId === categoryId);
  }
}
