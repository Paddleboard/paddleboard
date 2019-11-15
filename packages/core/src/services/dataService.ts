
import { CosmosClient, Database, Container, CosmosClientOptions, SqlQuerySpec, ContainerDefinition, DatabaseDefinition } from "@azure/cosmos";
import shortid from "shortid";
import { Entity } from "@paddleboard/contracts";

export interface DataService<T extends Entity> {
  get: (id: string, partitionKey?: string) => Promise<T>;
  list: (options?: DataListOptions) => Promise<T[]>;
  save: (item: T) => Promise<T>;
  delete: (id: string, partitionKey?: string) => Promise<void>;
};

export interface DataServiceOptions {
  endpoint: string;
  key: string;
  databaseName: string;
  collectionName: string;
  selector?: string[];
  databaseOptions?: DatabaseDefinition;
  collectionOptions?: ContainerDefinition;
}

export interface DataListOptions {
  skip: number;
  take: number;
}

export interface SimpleMap {
  [key: string]: any;
}

const clientCache: { [key: string]: CosmosClient } = {}

/**
 * Gets or creates a cosmos client connection
 * @param options The cosmos connection options
 */
function getCosmosClient(options: CosmosClientOptions) {
  let client = clientCache[options.endpoint];
  if (!client) {
    client = new CosmosClient(options);
    clientCache[options.endpoint] = client;
  }

  return client;
}

export class DataServiceBase<T extends Entity> implements DataService<T> {
  private database: Database;
  private collection: Container;
  private readonly selector: string = "*";
  protected readonly client: CosmosClient;

  public constructor(protected options: DataServiceOptions) {
    const cosmosOptions: CosmosClientOptions = {
      endpoint: this.options.endpoint,
      key: this.options.key,
    };

    this.client = getCosmosClient(cosmosOptions);
    this.database = this.client.database(this.options.databaseName);
    this.collection = this.database.container(this.options.collectionName);

    if (this.options.selector) {
      this.selector = this.options.selector.map((field) => `c.${field}`).join(",");
    }
  }

  public async init(): Promise<void> {
    const { database } = await this.client.databases.createIfNotExists({
      id: this.options.databaseName,
      ...this.options.databaseOptions
    });
    this.database = database;

    const { container } = await this.database.containers.createIfNotExists({
      id: this.options.collectionName,
      ...this.options.collectionOptions
    });
    this.collection = container;
  }

  public async list(options?: DataListOptions): Promise<T[]> {
    options = {
      skip: 0,
      take: 20,
      ...options
    };

    const querySpec: SqlQuerySpec = {
      query: `SELECT ${this.selector} FROM ${this.options.collectionName} c`,
      parameters: []
    };

    return await this.query(querySpec, options);
  }

  public async get(id: string, partitionKey?: string): Promise<T> {
    const result = await this.collection.item(id, partitionKey).read();
    return result.resource as T;
  }

  public async save(item: T): Promise<T> {
    if (!item.id) {
      item.id = shortid.generate();
      item.audit = {
        created: new Date(),
        updated: new Date(),
      };
    }

    item.audit.updated = new Date();

    const result = await this.collection.items.upsert<T>(item);
    return result.resource;
  }

  public async delete(id: string, partitionKey?: string): Promise<void> {
    await this.collection.item(id, partitionKey).delete();
  }

  public async find(map: SimpleMap, options?: DataListOptions): Promise<T[]> {
    const query = [`SELECT ${this.selector} FROM ${this.options.collectionName} c WHERE`];
    const parameters = [];
    const queryParams = Object.keys(map).map((key) => {
      parameters.push({ name: `@${key}`, value: map[key] });
      return `c.${key} = @${key}`;
    });

    query.push(queryParams.join(" AND "));

    const querySpec: SqlQuerySpec = {
      query: query.join(" "),
      parameters: parameters
    };

    return await this.query(querySpec, options);
  }

  public async findSingle(map: SimpleMap): Promise<T> {
    const results = await this.find(map, { skip: 0, take: 1 });
    return results[0];
  }

  protected async single(querySpec: SqlQuerySpec): Promise<T> {
    const result = await this.query(querySpec, { skip: 0, take: 1 });
    return result[0];
  }

  protected async query(querySpec: SqlQuerySpec, options?: DataListOptions): Promise<T[]> {
    options = {
      skip: 0,
      take: 20,
      ...options
    };

    querySpec.query += " OFFSET @skip LIMIT @take";
    querySpec.parameters.push({ name: "@skip", value: options.skip });
    querySpec.parameters.push({ name: "@take", value: options.take });

    const result = await this.collection.items.query<T>(querySpec, null).fetchNext();
    return result.resources || [];
  }
}
