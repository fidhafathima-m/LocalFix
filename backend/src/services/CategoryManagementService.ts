import { ICategoryService } from '../interfaces/services/admin/ICategoryManagementService';
import { ICategoryRepository } from '../interfaces/repository/admin/ICategoryRepository';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryListResponseDto,
} from '../interfaces/dtos/categoryDtos';
import { CATEGORY_MESSAGES } from '../constants';
import { Service } from '../models/category/serviceSchema';
import { ILogger } from '../interfaces/utils/ILogger';
import {
  toCategoryListResponseDto,
  toCategoryResponseDto,
} from '../mappers/categoryMapper';
import {
  ICategory,
  CategoryWithCount,
  PaginatedCategories,
} from '../interfaces/user/ICategory';

export class CategoryService implements ICategoryService {
  private _categoryRepository: ICategoryRepository;
  private _logger: ILogger;

  constructor(categoryRepository: ICategoryRepository, logger: ILogger) {
    this._categoryRepository = categoryRepository;
    this._logger = logger;
  }

  async createCategory(
    createDto: CreateCategoryDto
  ): Promise<CategoryResponseDto> {
    const context = {
      operation: 'createCategory',
      data: {
        categoryName: createDto.name,
        hasDescription: !!createDto.description,
        hasImage: !!createDto.iconUrl,
      },
    };

    try {
      this._logger.info('Creating new category', context);

      // Check if category with same name already exists
      this._logger.debug('Checking for existing category with same name', {
        ...context,
        categoryName: createDto.name,
      });

      const existingCategory = await this._categoryRepository.findByName(
        createDto.name
      );

      if (existingCategory) {
        this._logger.warn(
          'Category creation failed - category already exists',
          {
            ...context,
            existingCategoryId: existingCategory._id?.toString(),
          }
        );
        throw new Error(CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS);
      }

      this._logger.debug(
        'No duplicate found, proceeding with category creation',
        context
      );

      const category = await this._categoryRepository.create(createDto);

      this._logger.info('Category created successfully', {
        ...context,
        categoryId: category._id?.toString(),
      });

      return toCategoryResponseDto(category);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Create category operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async getCategoryById(categoryId: string): Promise<CategoryResponseDto> {
    const context = {
      operation: 'getCategoryById',
      data: { categoryId },
    };

    try {
      this._logger.info('Fetching category by ID', context);

      const category = await this._categoryRepository.findById(categoryId);

      if (!category) {
        this._logger.warn('Category not found by ID', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this._logger.debug('Category found, counting active services', {
        ...context,
        categoryName: category.name,
      });

      const serviceCount = await Service.countDocuments({
        categoryId: category._id,
        status: 'active',
      });

      this._logger.debug('Service count retrieved', {
        ...context,
        serviceCount,
      });

      const categoryWithCount: CategoryWithCount = {
        ...category.toObject(),
        serviceCount,
      };

      this._logger.info('Category retrieved successfully with service count', {
        ...context,
        categoryId: category._id?.toString(),
        serviceCount,
      });

      return toCategoryResponseDto(categoryWithCount);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get category by ID operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const context = {
      operation: 'getCategoryBySlug',
      data: { slug },
    };

    try {
      this._logger.info('Fetching category by slug', context);

      const category = await this._categoryRepository.findBySlug(slug);

      if (!category) {
        this._logger.warn('Category not found by slug', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this._logger.info('Category retrieved successfully by slug', {
        ...context,
        categoryId: category._id?.toString(),
        categoryName: category.name,
      });

      return toCategoryResponseDto(category);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get category by slug operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async getAllCategories(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<CategoryListResponseDto> {
    const context = {
      operation: 'getAllCategories',
      data: {
        page,
        limit,
        hasSearch: !!search,
        searchQuery: search,
        hasStatusFilter: !!status && status !== 'All Status',
        statusFilter: status,
      },
    };

    try {
      this._logger.info('Fetching all categories with filters', context);

      const skip = (page - 1) * limit;
      let categories: ICategory[];
      let total: number;

      if (search) {
        this._logger.debug('Performing search for categories with filters', {
          ...context,
          searchQuery: search,
          statusFilter: status,
        });

        categories = await this._categoryRepository.search(
          search,
          limit,
          status
        );
        total = categories.length;

        this._logger.debug('Search with filters completed', {
          ...context,
          categoriesFound: categories.length,
        });
      } else {
        this._logger.debug(
          'Fetching all categories with filters and pagination',
          {
            ...context,
            skip,
            limit,
            statusFilter: status,
          }
        );

        categories = await this._categoryRepository.findAll(
          {},
          skip,
          limit,
          search,
          status
        );
        total = await this._categoryRepository.count({}, search, status);

        this._logger.debug(
          'Categories retrieved from repository with filters',
          {
            ...context,
            categoriesCount: categories.length,
            totalCount: total,
          }
        );
      }

      this._logger.debug('Counting services for each category', {
        ...context,
        categoriesToProcess: categories.length,
      });

      const categoriesWithCounts: CategoryWithCount[] = await Promise.all(
        categories.map(async (category): Promise<CategoryWithCount> => {
          const serviceCount = await Service.countDocuments({
            categoryId: category._id,
            status: 'active',
          });

          return {
            ...category.toObject(),
            serviceCount,
          };
        })
      );

      this._logger.debug('Service counts calculated for all categories', {
        ...context,
        processedCategories: categoriesWithCounts.length,
      });

      const result = toCategoryListResponseDto(
        categoriesWithCounts,
        total,
        page,
        limit
      );

      this._logger.info('All categories retrieved successfully with filters', {
        ...context,
        totalCategories: total,
        returnedCategories: result.categories.length,
        appliedFilters: {
          search: !!search,
          status: status && status !== 'All Status' ? status : 'none',
        },
      });

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get all categories with filters operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
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
        updateFields: Object.keys(updateDto),
      },
    };

    try {
      this._logger.info('Updating category', context);

      // Check if category exists
      this._logger.debug('Checking if category exists', context);

      const existingCategory =
        await this._categoryRepository.findById(categoryId);

      if (!existingCategory) {
        this._logger.warn('Category not found for update', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this._logger.debug('Category found, checking for name changes', {
        ...context,
        currentName: existingCategory.name,
        newName: updateDto.name,
      });

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingCategory.name) {
        this._logger.debug(
          'Category name is being changed, checking for duplicates',
          {
            ...context,
            newName: updateDto.name,
          }
        );

        const duplicateCategory = await this._categoryRepository.findByName(
          updateDto.name
        );

        if (
          duplicateCategory &&
          duplicateCategory._id.toString() !== categoryId
        ) {
          this._logger.warn('Category update failed - duplicate name found', {
            ...context,
            duplicateCategoryId: duplicateCategory._id?.toString(),
          });
          throw new Error(CATEGORY_MESSAGES.CATEGORY_ALREADY_EXISTS);
        }

        this._logger.debug(
          'No duplicate name found, proceeding with update',
          context
        );
      }

      this._logger.debug('Performing category update in repository', context);

      const updatedCategory = await this._categoryRepository.update(
        categoryId,
        updateDto
      );

      if (!updatedCategory) {
        this._logger.error('Category repository update returned null', context);
        throw new Error(CATEGORY_MESSAGES.FAILED_UPDATE_CATEGORY);
      }

      this._logger.info('Category updated successfully', {
        ...context,
        categoryId: updatedCategory._id?.toString(),
      });

      return toCategoryResponseDto(updatedCategory);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Update category operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const context = {
      operation: 'deleteCategory',
      data: { categoryId },
    };

    try {
      this._logger.info('Deleting category', context);

      // Check if category exists
      this._logger.debug('Checking if category exists for deletion', context);

      const existingCategory =
        await this._categoryRepository.findById(categoryId);

      if (!existingCategory) {
        this._logger.warn('Category not found for deletion', context);
        throw new Error(CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      }

      this._logger.debug('Category found, proceeding with deletion', {
        ...context,
        categoryName: existingCategory.name,
      });

      const deleted = await this._categoryRepository.delete(categoryId);

      if (!deleted) {
        this._logger.error(
          'Category repository deletion returned false',
          context
        );
        throw new Error(CATEGORY_MESSAGES.FAILED_DELETE_CATEGORY);
      }

      this._logger.info('Category deleted successfully', context);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Delete category operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
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
        limit,
      },
    };

    try {
      this._logger.info('Searching categories', context);

      this._logger.debug('Performing search in repository', context);

      const categories: ICategory[] = await this._categoryRepository.search(
        query,
        limit
      );

      this._logger.info('Category search completed successfully', {
        ...context,
        categoriesFound: categories.length,
      });

      return categories.map((category: ICategory) =>
        toCategoryResponseDto(category)
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Search categories operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
