// interfaces/repository/category/ICategoryRepository.ts
import { ICategory, ICategoryCreate, ICategoryUpdate } from "../../admin/ICategoryManagement";
import { FilterQuery, Types } from "mongoose";

export interface ICategoryRepository {
  create(categoryData: ICategoryCreate): Promise<ICategory>;
  findById(categoryId: string | Types.ObjectId): Promise<ICategory | null>;
  findBySlug(slug: string): Promise<ICategory | null>;
  findByName(name: string): Promise<ICategory | null>;
  findAll(filter?: FilterQuery<ICategory>, skip?: number, limit?: number): Promise<ICategory[]>;
  update(categoryId: string | Types.ObjectId, updateData: ICategoryUpdate): Promise<ICategory | null>;
  delete(categoryId: string | Types.ObjectId): Promise<boolean>;
  count(filter?: FilterQuery<ICategory>): Promise<number>;
  search(query: string, limit?: number): Promise<ICategory[]>;
}