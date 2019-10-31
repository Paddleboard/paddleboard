import { DataServiceOptions, DataServiceBase } from "./dataService";
import { Entity } from "@paddleboard/contracts";
import shortid from "shortid";

export class ChildDataService<P extends Entity, C extends Entity> {
  protected readonly parentService: DataServiceBase<P>;

  public constructor(protected options: DataServiceOptions, private collectionName: string) {
    this.parentService = new DataServiceBase<P>(options);
  }

  public async get(id: string, parentId?: string): Promise<C> {
    const parent = await this.parentService.get(parentId);
    if (!parent) {
      throw new Error(`No parent entity found with ID: ${parentId}`)
    }

    const collection: C[] = parent[this.collectionName] || [];

    return collection.find((item) => item.id === id);
  }

  public async list(parentId: string): Promise<C[]> {
    const parent = await this.parentService.get(parentId);
    if (!parent) {
      throw new Error(`No parent entity found with ID: ${parentId}`)
    }

    return parent[this.collectionName] || [];
  }

  public async save(item: C, parentId: string) {
    const parent = await this.parentService.get(parentId);
    if (!parent) {
      throw new Error(`No parent entity found with ID: ${parentId}`)
    }

    if (!item.id) {
      item.id = shortid.generate();
      item.audit = {
        created: new Date(),
        updated: new Date(),
      };
    }

    item.audit.updated = new Date();

    const collection: C[] = parent[this.collectionName] || [];
    const children = [
      ...collection.filter((child) => child.id !== item.id),
      item
    ];

    parent[this.collectionName] = children;

    await this.parentService.save(parent);

    return item;
  }

  public async delete(item: C, parentId: string): Promise<void> {
    const parent = await this.parentService.get(parentId);
    if (!parent) {
      throw new Error(`No parent entity found with ID: ${parentId}`)
    }

    const collection: C[] = parent[this.collectionName] || [];
    const children = collection.filter((child) => child.id !== item.id);

    parent[this.collectionName] = children;

    await this.parentService.save(parent);
  }
}
