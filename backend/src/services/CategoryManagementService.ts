import { ICategoryService } from "../interfaces/services/admin/ICategoryManagementService";
import { ICategoryRepository } from "../interfaces/repository/admin/ICategoryRepository";
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryListResponseDto,
} from "../interfaces/dtos/categoryDtos";
import { CategoryMapper } from "../mappers/categoryMapper";
import { CATEGORY_MESSAGES } from "../constants";
import { Service } from "../models/category/serviceSchema";
import { LoggerService } from "../services/LoggerService";
import { ILogger } from "@/interfaces/utils/ILogger";

export class CategoryService implements ICategoryService {
  private categoryRepository: ICategoryRepository;
  private categoryMapper: CategoryMapper;
  private logger: ILogger

  constructor(categoryRepository: ICategoryRepository, logger: ILogger) {
    this.categoryRepository = categoryRepository;
    this.categoryMapper = new CategoryMapper();
    this.logger = logger;
  }

  async createCategory(
    createDto: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    const context = {
      operation: 'createCategory',
      data: { 
        categoryName: createDto.name,
        hasDescription: !!createDto.description,
        hasImage: !!createDto.iconUrl
      }
    };

    try {
      this.logger.info('Creating new category', context);

      // Check if category with same name already exists
      this.logger.debug('Checking for existing category with same name', {
        ...context,
        categoryName: createDto.name
      });

      const existingCategory = await this.categoryRepository.findByName(
        createDto.name
      );
      
      if (existingCategory) {
        this.logger.warn('Category creation failed - category already exists', {
          ...context,
          existingCategoryId: existingCategory._id?.toString()
        });
        throw new Error(CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }

      this.logger.debug('No duplicate found, proceeding with category creation', context);

      const category = await this.categoryRepository.create(createDto);
      
      this.logger.info('Category created successfully', {
        ...context,
        categoryId: category._id?.toString()
      });

      return this.categoryMapper.toCategoryResponseDto(category);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Create category operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getCategoryById(categoryId: string): Promise<CategoryResponseDto> {
    const context = {
      operation: 'getCategoryById',
      data: { categoryId }
    };

    try {
      this.logger.info('Fetching category by ID', context);

      const category = await this.categoryRepository.findById(categoryId);
      
      if (!category) {
        this.logger.warn('Category not found by ID', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this.logger.debug('Category found, counting active services', {
        ...context,
        categoryName: category.name
      });

      const serviceCount = await Service.countDocuments({
        categoryId: category._id,
        status: "active",
      });

      this.logger.debug('Service count retrieved', {
        ...context,
        serviceCount
      });

      const categoryWithCount = {
        ...category.toObject(),
        serviceCount,
      };

      this.logger.info('Category retrieved successfully with service count', {
        ...context,
        categoryId: category._id?.toString(),
        serviceCount
      });

      return this.categoryMapper.toCategoryResponseDto(categoryWithCount);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Get category by ID operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const context = {
      operation: 'getCategoryBySlug',
      data: { slug }
    };

    try {
      this.logger.info('Fetching category by slug', context);

      const category = await this.categoryRepository.findBySlug(slug);
      
      if (!category) {
        this.logger.warn('Category not found by slug', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this.logger.info('Category retrieved successfully by slug', {
        ...context,
        categoryId: category._id?.toString(),
        categoryName: category.name
      });

      return this.categoryMapper.toCategoryResponseDto(category);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Get category by slug operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getAllCategories(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<CategoryListResponseDto> {
    const context = {
      operation: 'getAllCategories',
      data: { 
        page, 
        limit, 
        hasSearch: !!search,
        searchQuery: search 
      }
    };

    try {
      this.logger.info('Fetching all categories', context);

      const skip = (page - 1) * limit;
      let categories: any[];
      let total: number;

      if (search) {
        this.logger.debug('Performing search for categories', {
          ...context,
          searchQuery: search
        });

        categories = await this.categoryRepository.search(search, limit);
        total = categories.length;

        this.logger.debug('Search completed', {
          ...context,
          categoriesFound: categories.length
        });
      } else {
        this.logger.debug('Fetching all categories with pagination', {
          ...context,
          skip,
          limit
        });

        categories = await this.categoryRepository.findAll({}, skip, limit);
        total = await this.categoryRepository.count();

        this.logger.debug('Categories retrieved from repository', {
          ...context,
          categoriesCount: categories.length,
          totalCount: total
        });
      }

      this.logger.debug('Counting services for each category', {
        ...context,
        categoriesToProcess: categories.length
      });

      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const serviceCount = await Service.countDocuments({
            categoryId: category._id,
            status: "active",
          });
          
          return {
            ...category.toObject(),
            serviceCount,
          };
        })
      );

      this.logger.debug('Service counts calculated for all categories', {
        ...context,
        processedCategories: categoriesWithCounts.length
      });

      const result = this.categoryMapper.toCategoryListResponseDto(
        categoriesWithCounts,
        total,
        page,
        limit
      );

      this.logger.info('All categories retrieved successfully', {
        ...context,
        totalCategories: total,
        returnedCategories: result.categories.length,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Get all categories operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async updateCategory(
    categoryId: string,
    updateDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto> {
    const context = {
      operation: 'updateCategory',
      data: { 
        categoryId,
        updateFields: Object.keys(updateDto)
      }
    };

    try {
      this.logger.info('Updating category', context);

      // Check if category exists
      this.logger.debug('Checking if category exists', context);
      
      const existingCategory = await this.categoryRepository.findById(
        categoryId
      );
      
      if (!existingCategory) {
        this.logger.warn('Category not found for update', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this.logger.debug('Category found, checking for name changes', {
        ...context,
        currentName: existingCategory.name,
        newName: updateDto.name
      });

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingCategory.name) {
        this.logger.debug('Category name is being changed, checking for duplicates', {
          ...context,
          newName: updateDto.name
        });

        const duplicateCategory = await this.categoryRepository.findByName(
          updateDto.name
        );
        
        if (
          duplicateCategory &&
          duplicateCategory._id.toString() !== categoryId
        ) {
          this.logger.warn('Category update failed - duplicate name found', {
            ...context,
            duplicateCategoryId: duplicateCategory._id?.toString()
          });
          throw new Error(CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS);
        }

        this.logger.debug('No duplicate name found, proceeding with update', context);
      }

      this.logger.debug('Performing category update in repository', context);

      const updatedCategory = await this.categoryRepository.update(
        categoryId,
        updateDto
      );
      
      if (!updatedCategory) {
        this.logger.error('Category repository update returned null', context);
        throw new Error(CATEGORY_MESSAGES.FAILED_UPDATE_CATEGORY);
      }

      this.logger.info('Category updated successfully', {
        ...context,
        categoryId: updatedCategory._id?.toString()
      });

      return this.categoryMapper.toCategoryResponseDto(updatedCategory);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Update category operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const context = {
      operation: 'deleteCategory',
      data: { categoryId }
    };

    try {
      this.logger.info('Deleting category', context);

      // Check if category exists
      this.logger.debug('Checking if category exists for deletion', context);
      
      const existingCategory = await this.categoryRepository.findById(
        categoryId
      );
      
      if (!existingCategory) {
        this.logger.warn('Category not found for deletion', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this.logger.debug('Category found, proceeding with deletion', {
        ...context,
        categoryName: existingCategory.name
      });

      const deleted = await this.categoryRepository.delete(categoryId);
      
      if (!deleted) {
        this.logger.error('Category repository deletion returned false', context);
        throw new Error(CATEGORY_MESSAGES.FAILED_DELETE_CATEGORY);
      }

      this.logger.info('Category deleted successfully', context);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Delete category operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async searchCategories(
    query: string,
    limit: number = 10
  ): Promise<CategoryResponseDto[]> {
    const context = {
      operation: 'searchCategories',
      data: { 
        query, 
        limit 
      }
    };

    try {
      this.logger.info('Searching categories', context);

      this.logger.debug('Performing search in repository', context);

      const categories = await this.categoryRepository.search(query, limit);

      this.logger.info('Category search completed successfully', {
        ...context,
        categoriesFound: categories.length
      });

      return categories.map((category) =>
        this.categoryMapper.toCategoryResponseDto(category)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Search categories operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}