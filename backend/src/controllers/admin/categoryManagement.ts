import { Request, Response } from "express";
import { ICategoryService } from "../../interfaces/services/admin/ICategoryManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { CATEGORY_MESSAGES } from "../../constants";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../interfaces/dtos/categoryDtos";
import { LoggerService } from "../../services/LoggerService";

export class CategoryController {
  private categoryService: ICategoryService;
  private logger: LoggerService;

  constructor(categoryService: ICategoryService) {
    this.categoryService = categoryService;
    this.logger = new LoggerService();
  }

  createCategory = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: "createCategory",
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Creating new category", context);

      const createDto: CreateCategoryDto = req.body;

      // Validation
      if (!createDto.name?.trim()) {
        this.logger.warn("Category creation failed - name required", context);
        const response = ResponseHelper.badRequest(
          CATEGORY_MESSAGES.NAME_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.description?.trim()) {
        this.logger.warn(
          "Category creation failed - description required",
          context
        );
        const response = ResponseHelper.badRequest(
          CATEGORY_MESSAGES.DESCRIPTION_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      this.logger.debug("Calling category service to create category", {
        ...context,
        categoryName: createDto.name,
      });

      const category = await this.categoryService.createCategory(createDto);

      this.logger.info("Category created successfully", {
        ...context,
        categoryId: category.id,
        categoryName: category.name,
      });

      const response = ResponseHelper.success(
        CATEGORY_MESSAGES.CATEGORY_CREATED,
        { category }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || CATEGORY_MESSAGES.FAILED_CREATE_CATEGORY;
      this.logger.error("Create category controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: "getCategoryById",
      categoryId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching category by ID", context);

      const category = await this.categoryService.getCategoryById(id);

      this.logger.info("Category retrieved successfully", {
        ...context,
        categoryName: category.name,
      });

      const response = ResponseHelper.success(
        CATEGORY_MESSAGES.CATEGORY_RETRIEVED,
        { category }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || CATEGORY_MESSAGES.CATEGORY_NOT_FOUND;
      this.logger.error("Get category by ID controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const context = {
      operation: "getCategoryBySlug",
      slug,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching category by slug", context);

      const category = await this.categoryService.getCategoryBySlug(slug);

      this.logger.info("Category retrieved by slug successfully", {
        ...context,
        categoryId: category.id,
        categoryName: category.name,
      });

      const response = ResponseHelper.success(
        CATEGORY_MESSAGES.CATEGORY_RETRIEVED,
        { category }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || CATEGORY_MESSAGES.CATEGORY_NOT_FOUND;
      this.logger.error("Get category by slug controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const context = {
      operation: "getAllCategories",
      page,
      limit,
      search,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching all categories", context);

      const result = await this.categoryService.getAllCategories(
        page,
        limit,
        search
      );

      this.logger.info("Categories retrieved successfully", {
        ...context,
        totalCategories: result.total,
      });

      const response = ResponseHelper.success(
        CATEGORY_MESSAGES.CATEGORIES_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || CATEGORY_MESSAGES.FAILED_FETCH_CATEGORIES;
      this.logger.error("Get all categories controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateDto: UpdateCategoryDto = req.body;

    const context = {
      operation: "updateCategory",
      categoryId: id,
      updateFields: Object.keys(updateDto),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating category", context);

      const category = await this.categoryService.updateCategory(id, updateDto);

      this.logger.info("Category updated successfully", {
        ...context,
        categoryName: category.name,
        updatedFields: Object.keys(updateDto),
      });

      const response = ResponseHelper.success(
        CATEGORY_MESSAGES.CATEGORY_UPDATED,
        { category }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || CATEGORY_MESSAGES.FAILED_UPDATE_CATEGORY;
      this.logger.error("Update category controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: "deleteCategory",
      categoryId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Deleting category", context);

      await this.categoryService.deleteCategory(id);

      this.logger.info("Category deleted successfully", context);

      const response = ResponseHelper.success(
        CATEGORY_MESSAGES.CATEGORY_DELETED
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || CATEGORY_MESSAGES.FAILED_DELETE_CATEGORY;
      this.logger.error("Delete category controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  searchCategories = async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

    const context = {
      operation: "searchCategories",
      query: q,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Searching categories", context);

      if (!q || typeof q !== "string") {
        this.logger.warn("Search categories failed - query required", context);
        const response = ResponseHelper.badRequest("Search query is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const categories = await this.categoryService.searchCategories(q, limit);

      this.logger.info("Categories search completed successfully", {
        ...context,
        resultsCount: categories.length,
      });

      const response = ResponseHelper.success("Categories search completed", {
        categories,
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error("Search categories controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const response = ResponseHelper.error("Failed to search categories");
      res.status(response.statusCode).json(response);
    }
  };
}
