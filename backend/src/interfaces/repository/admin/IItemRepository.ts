import { IItem, IItemCreate, IItemUpdate } from "../../admin/IItemManagement";
import { FilterQuery, Types } from "mongoose";

export interface IItemRepository {
  create(itemData: IItemCreate): Promise<IItem>;
  findById(itemId: string | Types.ObjectId): Promise<IItem | null>;
  findBySku(sku: string): Promise<IItem | null>;
  findByName(name: string): Promise<IItem | null>;
  findByServiceId(serviceId: string | Types.ObjectId): Promise<IItem[]>;
  findAll(
    filter?: FilterQuery<IItem>,
    skip?: number,
    limit?: number
  ): Promise<IItem[]>;
  update(
    itemId: string | Types.ObjectId,
    updateData: IItemUpdate
  ): Promise<IItem | null>;
  delete(itemId: string | Types.ObjectId): Promise<boolean>;
  count(filter?: FilterQuery<IItem>): Promise<number>;
  search(query: string, limit?: number): Promise<IItem[]>;
  searchByService(
    serviceId: string | Types.ObjectId,
    query: string,
    limit?: number
  ): Promise<IItem[]>;
}
