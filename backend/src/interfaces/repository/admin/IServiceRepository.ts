import {
  IService,
  IServiceCreate,
  IServiceUpdate,
} from "../../admin/IServiceManagement";
import { FilterQuery, Types } from "mongoose";

export interface IServiceRepository {
  create(serviceData: IServiceCreate): Promise<IService>;
  findById(serviceId: string | Types.ObjectId): Promise<IService | null>;
  findBySlug(slug: string): Promise<IService | null>;
  findByName(name: string): Promise<IService | null>;
  findByCategoryId(categoryId: string | Types.ObjectId): Promise<IService[]>;
  findAll(
    filter?: FilterQuery<IService>,
    skip?: number,
    limit?: number,
    sort?: any
  ): Promise<IService[]>;
  update(
    serviceId: string | Types.ObjectId,
    updateData: IServiceUpdate
  ): Promise<IService | null>;
  delete(serviceId: string | Types.ObjectId): Promise<boolean>;
  count(filter?: FilterQuery<IService>): Promise<number>;
  search(query: string, limit?: number, sort?: any): Promise<IService[]>;
  searchByCategory(
    categoryId: string | Types.ObjectId,
    query: string,
    limit?: number
  ): Promise<IService[]>;
}
