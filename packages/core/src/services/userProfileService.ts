import { DataServiceBase } from "./dataService";
import { UserProfile } from "../models/app";
import Guard from "../guard";

/**
 * Manages all user profiles within paddleboard
 */
export class UserProfileService extends DataServiceBase<UserProfile> {
  public constructor() {
    super({
      collectionName: "UserProfile",
      databaseName: "Paddleboard",
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
      collectionOptions: {
        uniqueKeyPolicy: {
          uniqueKeys: [
            { paths: ["/email"] }
          ]
        }
      }
    });
  }

  /**
   * Get a user profile by the specified email address
   * @param email The email address to find
   */
  public async getByEmail(email: string): Promise<UserProfile> {
    Guard.empty(email, "email");

    return await this.findSingle({ email });
  }
}
