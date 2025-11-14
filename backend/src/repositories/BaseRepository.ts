import { Model, Types, Document, FilterQuery, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interfaces/repository/IBaseRepository";

export abstract class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  protected constructor(protected readonly model: Model<T>) {}

  private handleError(operation: string, error: any): never {
    // Check if it's a MongoDB connection error
    if (
      error.name === "MongooseError" &&
      error.message.includes("buffering timed out")
    ) {
      throw new Error(
        `Database connection timeout during ${operation}: ${error.message}`
      );
    }

    // Check if it's a connection error
    if (
      error.name === "MongoNetworkError" ||
      error.name === "MongoTimeoutError"
    ) {
      throw new Error(
        `Database connection failed during ${operation}: ${error.message}`
      );
    }

    throw new Error(
      `Failed to ${operation} ${this.model.modelName}: ${error.message}`
    );
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const created = new this.model(data);
      return await created.save();
    } catch (error) {
      this.handleError("create", error);
    }
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    try {
      return await this.model.findById(id).exec();
    } catch (error) {
      this.handleError("find by ID", error);
    }
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter).exec();
    } catch (error) {
      this.handleError("find one", error);
    }
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await this.model.find(filter).exec();
    } catch (error) {
      this.handleError("find", error);
    }
  }

  async update(
    id: string | Types.ObjectId,
    data: UpdateQuery<T>
  ): Promise<T | null> {
    try {
      return await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
        })
        .exec();
    } catch (error) {
      this.handleError("update", error);
    }
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      this.handleError("delete", error);
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error) {
      this.handleError("count", error);
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter).exec();
      return count > 0;
    } catch (error) {
      this.handleError("check existence", error);
    }
  }

  async save(entity: T): Promise<T> {
    try {
      return await entity.save();
    } catch (error) {
      this.handleError("save", error);
    }
  }
}
