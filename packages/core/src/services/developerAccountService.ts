import { DeveloperAccount, UserProfile } from "@paddleboard/contracts";
import { ChildDataService } from "./childDataService";

/**
 * Manages developer accounts of Paddleboard
 */
export class DeveloperAccountService extends ChildDataService<UserProfile, DeveloperAccount> {
  public constructor() {
    super({
      collectionName: "UserProfile",
      databaseName: "Paddleboard",
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY
    }, "accounts");
  }

  /**
   * Gets a list of developer accounts for the specified user
   * @param userId The userId to filter results by
   */
  public async getByUser(userId: string): Promise<DeveloperAccount[]> {
    return await this.list(userId);
  }

  /**
   * Gets a list of developer accounts for the specified email address
   * @param email The email address to filter results by
   */
  public async getByEmail(email: string): Promise<DeveloperAccount[]> {
    const user = await this.parentService.findSingle({ email });
    return user ? user.accounts : [];
  }
}
