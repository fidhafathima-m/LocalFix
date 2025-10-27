// repositories/CategoryRepository.ts
import { FilterQuery, Types } from "mongoose";
import { ICategory, ICategoryCreate, ICategoryUpdate } from "../../interfaces/admin/ICategoryManagement";
import { ICategoryRepository } from "../../interfaces/repository/admin/ICategoryRepository";
import { Category } from "../../models/category/categorySchema";
import slugify from "slugify";

export class CategoryRepository implements ICategoryRepository {
  async create(categoryData: ICategoryCreate): Promise<ICategory> {
    const slug = slugify(categoryData.name, { 
      lower: true, 
      strict: true, 
      trim: true 
    });

    const category = new Category({
      ...categoryData,
      slug,
    });

    return await category.save();
  }

  async findById(categoryId: string | Types.ObjectId): Promise<ICategory | null> {
    return await Category.findById(categoryId);
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return await Category.findOne({ slug });
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
  }

  async findAll(
    filter: FilterQuery<ICategory> = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<ICategory[]> {
    return await Category.find(filter)
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

  async count(filter: FilterQuery<ICategory> = {}): Promise<number> {
    return await Category.countDocuments(filter);
  }

  async search(query: string, limit: number = 10): Promise<ICategory[]> {
    return await Category.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}