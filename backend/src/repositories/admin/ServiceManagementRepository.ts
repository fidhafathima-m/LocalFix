import { FilterQuery, Types } from "mongoose";
import {
  IService,
  IServiceCreate,
  IServiceUpdate,
} from "../../interfaces/admin/IServiceManagement";
import { IServiceRepository } from "../../interfaces/repository/admin/IServiceRepository";
import { Service } from "../../models/category/serviceSchema";
import slugify from "slugify";

export class ServiceRepository implements IServiceRepository {
  async create(serviceData: IServiceCreate): Promise<IService> {
    const slug = slugify(serviceData.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const service = new Service({
      ...serviceData,
      slug,
    });

    return await service.save();
  }

  async findById(serviceId: string | Types.ObjectId): Promise<IService | null> {
    return await Service.findById(serviceId);
  }

  async findBySlug(slug: string): Promise<IService | null> {
    return await Service.findOne({ slug });
  }

  async findByName(name: string): Promise<IService | null> {
    return await Service.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }

  async findByCategoryId(
    categoryId: string | Types.ObjectId
  ): Promise<IService[]> {
    return await Service.find({ categoryId }).sort({ createdAt: -1 });
  }

  async findAll(
    filter: FilterQuery<IService> = {},
    skip: number = 0,
    limit: number = 10,
    sort: any = { name: 1 } // Add sort parameter with default
  ): Promise<IService[]> {
    return await Service.find(filter)
      .sort(sort) // Use the provided sort
      .skip(skip)
      .limit(limit);
  }

  async update(
    serviceId: string | Types.ObjectId,
    updateData: IServiceUpdate
  ): Promise<IService | null> {
    if (updateData.name) {
      updateData.slug = slugify(updateData.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    return await Service.findByIdAndUpdate(
      serviceId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(serviceId: string | Types.ObjectId): Promise<boolean> {
    const result = await Service.findByIdAndDelete(serviceId);
    return result !== null;
  }

  async count(filter: FilterQuery<IService> = {}): Promise<number> {
    return await Service.countDocuments(filter);
  }

  async search(
    query: string, 
    limit: number = 10, 
    sort: any = { name: 1 } // Add sort parameter
  ): Promise<IService[]> {
    return await Service.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .sort(sort) // Use the provided sort
      .limit(limit);
  }

  async searchByCategory(
    categoryId: string | Types.ObjectId,
    query: string,
    limit: number = 10,
    sort: any = { name: 1 } // Add sort parameter
  ): Promise<IService[]> {
    return await Service.find({
      categoryId,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .sort(sort) // Use the provided sort
      .limit(limit);
  }
}