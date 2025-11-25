import { FilterQuery, Types } from 'mongoose';
import {
  ICategory,
  ICategoryCreate,
  ICategoryUpdate,
} from '../../interfaces/admin/ICategoryManagement';
import { ICategoryRepository } from '../../interfaces/repository/admin/ICategoryRepository';
import { Category } from '../../models/category/categorySchema';
import slugify from 'slugify';

export class CategoryRepository implements ICategoryRepository {
  async create(categoryData: ICategoryCreate): Promise<ICategory> {
    const slug = slugify(categoryData.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const category = new Category({
      ...categoryData,
      slug,
    });

    return await category.save();
  }

  async findById(
    categoryId: string | Types.ObjectId
  ): Promise<ICategory | null> {
    return await Category.findById(categoryId);
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug });
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
  }

  async findAll(
    filter: FilterQuery<ICategory> = {},
    skip: number = 0,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<ICategory[]> {
    const query: FilterQuery<ICategory> = { ...filter };
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { slug: { $regex: searchRegex } },
      ];
    }
    // Add status filter if provided
    if (status && status !== 'All Status' && status !== 'all') {
      query.status = status.toLowerCase(); // 'active' or 'inactive'
    }
    return await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async update(
    categoryId: string | Types.ObjectId,
    updateData: ICategoryUpdate
  ): Promise<ICategory | null> {
    if (updateData.name) {
      updateData.slug = slugify(updateData.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    return await Category.findByIdAndUpdate(
      categoryId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(categoryId: string | Types.ObjectId): Promise<boolean> {
    const result = await Category.findByIdAndDelete(categoryId);
    return result !== null;
  }

  async count(
    filter: FilterQuery<ICategory> = {},
    search?: string,
    status?: string
  ): Promise<number> {
    const query: FilterQuery<ICategory> = { ...filter };

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { slug: { $regex: searchRegex } },
      ];
    }

    if (status && status !== 'All Status' && status !== 'all') {
      query.status = status.toLowerCase();
    }
    return await Category.countDocuments(query);
  }

  async search(
    query: string,
    limit: number = 10,
    status?: string
  ): Promise<ICategory[]> {
    const searchFilter: FilterQuery<ICategory> = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    };

    // Add status filter to search
    if (status && status !== 'All Status' && status !== 'all') {
      searchFilter.status = status.toLowerCase();
    }

    return await Category.find(searchFilter)
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}
