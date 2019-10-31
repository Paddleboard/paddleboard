import { DataServiceBase, DataListOptions } from "./dataService";
import { PullRequest, Repository } from "@paddleboard/contracts";
import { UserRepositoryService } from "./userRepositoryService";
import { SqlQuerySpec } from "@azure/cosmos";
import Guard from "../guard";

/**
 * Manages pull requests in paddleboard
 */
export class PullRequestService extends DataServiceBase<PullRequest> {
  public constructor() {
    super({
      collectionName: "PullRequest",
      databaseName: "Paddleboard",
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
      collectionOptions: {
        partitionKey: {
          paths: ["/repositoryId"]
        }
      }
    });
  }

  /**
   * Gets a list of pull requests filtered by the specified repository
   * @param repositoryId The repository to filter by
   * @param options A list of filtering and paging options for the query
   */
  public async getByRepository(repositoryId: string, options?: DataListOptions): Promise<PullRequest[]> {
    Guard.empty(repositoryId, "repositoryId");

    return await this.find({ repositoryId }, options);
  }

  /**
   * Gets a list of pull requests filtered by the specified user
   * @param userId The user to filter by
   * @param options A list of filtering and paging options for the query
   */
  public async getByUser(userId: string, options?: DataListOptions): Promise<PullRequest[]> {
    Guard.empty(userId, "userId");

    const userRepositoryService = new UserRepositoryService();
    const userRepos = await userRepositoryService.getByUser(userId);

    return await this.getByRepositoryList(userRepos, options);
  }

  /**
   * Gets a list of pull requests filtered by the specified user category
   * @param userId The user to filter by
   * @param categoryId The category bo filter by
   * @param options A list of filtering and paging options for the query
   */
  public async getByCategory(userId: string, categoryId: string, options?: DataListOptions): Promise<PullRequest[]> {
    Guard.empty(userId, "userId");
    Guard.empty(categoryId, "categoryId");

    const userRepositoryService = new UserRepositoryService();
    const categoryRepos = await userRepositoryService.getByCategory(userId, categoryId);

    return await this.getByRepositoryList(categoryRepos, options);
  }

  /**
   * Gets a list of pull requests filtered by a list of repositories
   * @param repositories List of repositories to filter by
   * @param options A list of filtering and paging options for the query
   */
  private async getByRepositoryList(repositories: Repository[], options?: DataListOptions): Promise<PullRequest[]> {
    Guard.null(repositories, "repositories");

    const values = repositories.map((repo) => `"${repo.id}"`).join(",");
    const query: SqlQuerySpec = {
      query: `SELECT * FROM PullRequest pr WHERE pr.repositoryId IN(${values})`,
      parameters: []
    };

    return this.query(query, options);
  }
}
