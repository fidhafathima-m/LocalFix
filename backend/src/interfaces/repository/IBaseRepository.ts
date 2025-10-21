// interfaces/repository/IBaseRepository.ts
import { Types, Document, FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string | Types.ObjectId): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[]>;
  update(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string | Types.ObjectId): Promise<boolean>;
  count(filter?: FilterQuery<T>): Promise<number>;
  exists(filter: FilterQuery<T>): Promise<boolean>;
  save(entity: T): Promise<T>;
}