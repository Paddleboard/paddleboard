import { DataServiceBase } from "./dataService";
import { Repository } from "../models/app";

export class RepositoryService extends DataServiceBase<Repository> {
  public constructor() {
    super({
      collectionName: "Repository",
      databaseName: "Paddleboard",
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    });
  }
}
