
import { Model, Types, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../interfaces/repository/IBaseRepository';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    try {
      const created = new this.model(data);
      return await created.save();
    } catch (error) {
      throw new Error(`Failed to create ${this.model.modelName}: ${error}`);
    }
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName} by ID: ${error}`);
    }
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error) {
      throw new Error(`Failed to find one ${this.model.modelName}: ${error}`);
    }
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await this.model.find(filter).exec();
    } catch (error) {
      throw new Error(`Failed to find ${this.model.modelName}: ${error}`);
    }
  }

  async update(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    } catch (error) {
      throw new Error(`Failed to update ${this.model.modelName}: ${error}`);
    }
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      throw new Error(`Failed to delete ${this.model.modelName}: ${error}`);
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      throw new Error(`Failed to count ${this.model.modelName}: ${error}`);
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter).exec();
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check existence of ${this.model.modelName}: ${error}`);
    }
  }

  async save(entity: T): Promise<T> {
    try {
      return await entity.save();
    } catch (error) {
      throw new Error(`Failed to save ${this.model.modelName}: ${error}`);
    }
  }
}