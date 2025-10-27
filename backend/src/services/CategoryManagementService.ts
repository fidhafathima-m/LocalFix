// services/CategoryService.ts
import { ICategoryService } from "../interfaces/services/admin/ICategoryManagementService";
import { ICategoryRepository } from "../interfaces/repository/admin/ICategoryRepository";
import { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto, CategoryListResponseDto } from "../interfaces/dtos/categoryDtos";
import { CategoryMapper } from "../mappers/categoryMapper";
// import { ResponseHelper } from "../../utils/responseHelper";
import { CATEGORY_MESSAGES } from "../constants";
import { Service } from "../models/category/serviceSchema";

export class CategoryService implements ICategoryService {
  private categoryRepository: ICategoryRepository;
  private categoryMapper: CategoryMapper;

  constructor(categoryRepository: ICategoryRepository) {
    this.categoryRepository = categoryRepository;
    this.categoryMapper = new CategoryMapper();
  }

  async createCategory(createDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    try {
      // Check if category with same name already exists
      const existingCategory = await this.categoryRepository.findByName(createDto.name);
      if (existingCategory) {
        throw new Error(CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }

      const category = await this.categoryRepository.create(createDto);
      return this.categoryMapper.toCategoryResponseDto(category);
    } catch (error) {
      console.error("Create category error:", error);
      throw error;
    }
  }

  async getCategoryById(categoryId: string): Promise<CategoryResponseDto> {
    try {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }
      const serviceCount = await Service.countDocuments({ 
      categoryId: category._id,
      status: 'active' 
    });

    const categoryWithCount = {
      ...category.toObject(),
      serviceCount
    };
      return this.categoryMapper.toCategoryResponseDto(categoryWithCount);
    } catch (error) {
      console.error("Get category by ID error:", error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    try {
      const category = await this.categoryRepository.findBySlug(slug);
      if (!category) {
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }
      return this.categoryMapper.toCategoryResponseDto(category);
    } catch (error) {
      console.error("Get category by slug error:", error);
      throw error;
    }
  }

  async getAllCategories(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<CategoryListResponseDto> {
    try {
      const skip = (page - 1) * limit;
      let categories: any[];
      let total: number;

      if (search) {
        categories = await this.categoryRepository.search(search, limit);
        total = categories.length;
      } else {
        categories = await this.categoryRepository.findAll({}, skip, limit);
        total = await this.categoryRepository.count();
      }

       const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const serviceCount = await Service.countDocuments({ 
          categoryId: category._id,
          status: 'active' 
        });
        return {
          ...category.toObject(),
          serviceCount
        };
      })
    );

      return this.categoryMapper.toCategoryListResponseDto(categoriesWithCounts, total, page, limit);
    } catch (error) {
      console.error("Get all categories error:", error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, updateDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    try {
      // Check if category exists
      const existingCategory = await this.categoryRepository.findById(categoryId);
      if (!existingCategory) {
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingCategory.name) {
        const duplicateCategory = await this.categoryRepository.findByName(updateDto.name);
        if (duplicateCategory && duplicateCategory._id.toString() !== categoryId) {
          throw new Error(CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS);
        }
      }

      const updatedCategory = await this.categoryRepository.update(categoryId, updateDto);
      if (!updatedCategory) {
        throw new Error(CATEGORY_MESSAGES.FAILED_UPDATE_CATEGORY);
      }

      return this.categoryMapper.toCategoryResponseDto(updatedCategory);
    } catch (error) {
      console.error("Update category error:", error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      // Check if category exists
      const existingCategory = await this.categoryRepository.findById(categoryId);
      if (!existingCategory) {
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      const deleted = await this.categoryRepository.delete(categoryId);
      if (!deleted) {
        throw new Error(CATEGORY_MESSAGES.FAILED_DELETE_CATEGORY);
      }
    } catch (error) {
      console.error("Delete category error:", error);
      throw error;
    }
  }

  async searchCategories(query: string, limit: number = 10): Promise<CategoryResponseDto[]> {
    try {
      const categories = await this.categoryRepository.search(query, limit);
      return categories.map(category => this.categoryMapper.toCategoryResponseDto(category));
    } catch (error) {
      console.error("Search categories error:", error);
      throw error;
    }
  }
}