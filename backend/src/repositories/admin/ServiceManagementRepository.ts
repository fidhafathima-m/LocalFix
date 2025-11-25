import { FilterQuery, Types } from 'mongoose';
import {
  IService,
  IServiceCreate,
  IServiceUpdate,
} from '../../interfaces/admin/IServiceManagement';
import { IServiceRepository } from '../../interfaces/repository/admin/IServiceRepository';
import { Service } from '../../models/category/serviceSchema';
import slugify from 'slugify';

export class ServiceRepository implements IServiceRepository {
  // Helper method for status filtering
  private addStatusFilter(query: FilterQuery<IService>, status?: string): void {
    if (status && status !== 'All Status' && status !== 'all') {
      // Normalize status input
      const normalizedStatus = status.trim().toLowerCase();

      // Map various status inputs to consistent values
      const statusMap: { [key: string]: string } = {
        active: 'active',
        inactive: 'inactive',
        activated: 'active',
        deactivated: 'inactive',
        enable: 'active',
        disable: 'inactive',
      };

      const backendStatus = statusMap[normalizedStatus] || normalizedStatus;

      // Only apply filter if we have a valid status
      if (['active', 'inactive'].includes(backendStatus)) {
        query.status = backendStatus;
      }
    }
  }

  // Helper method for search filtering
  private addSearchFilter(query: FilterQuery<IService>, search?: string): void {
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { slug: { $regex: searchRegex } },
      ];
    }
  }

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
      name: { $regex: new RegExp(`^${name}$`, 'i') },
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
    sort: any = { name: 1 },
    search?: string,
    status?: string
  ): Promise<IService[]> {
    const query: FilterQuery<IService> = { ...filter };

    this.addSearchFilter(query, search);
    this.addStatusFilter(query, status);

    return await Service.find(query).sort(sort).skip(skip).limit(limit);
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

  async count(
    filter: FilterQuery<IService> = {},
    status?: string,
    search?: string
  ): Promise<number> {
    const query: FilterQuery<IService> = { ...filter };

    this.addSearchFilter(query, search);
    this.addStatusFilter(query, status);

    return await Service.countDocuments(query);
  }

  async search(
    query: string,
    limit: number = 10,
    sort: any = { name: 1 },
    status?: string
  ): Promise<IService[]> {
    const searchFilter: FilterQuery<IService> = {};

    // Add search criteria
    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchFilter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    this.addStatusFilter(searchFilter, status);

    return await Service.find(searchFilter).sort(sort).limit(limit);
  }

  async searchByCategory(
    categoryId: string | Types.ObjectId,
    query: string,
    limit: number = 10,
    sort: any = { name: 1 },
    status?: string
  ): Promise<IService[]> {
    const searchFilter: FilterQuery<IService> = {
      categoryId,
    };

    // Add search criteria
    if (query && query.trim()) {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchFilter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    this.addStatusFilter(searchFilter, status);

    return await Service.find(searchFilter).sort(sort).limit(limit);
  }
}
