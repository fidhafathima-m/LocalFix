// controllers/CategoryController.ts
import { Request, Response } from "express";
import { ICategoryService } from "../../interfaces/services/admin/ICategoryManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { CATEGORY_MESSAGES } from "../../constants";
import { CreateCategoryDto, UpdateCategoryDto } from "../../interfaces/dtos/categoryDtos";

export class CategoryController {
  private categoryService: ICategoryService;

  constructor(categoryService: ICategoryService) {
    this.categoryService = categoryService;
  }

  createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreateCategoryDto = req.body;

      // Validation
      if (!createDto.name?.trim()) {
        const response = ResponseHelper.badRequest(CATEGORY_MESSAGES.NAME_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.description?.trim()) {
        const response = ResponseHelper.badRequest(CATEGORY_MESSAGES.DESCRIPTION_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      const category = await this.categoryService.createCategory(createDto);
      const response = ResponseHelper.success(CATEGORY_MESSAGES.CATEGORY_CREATED, { category });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Create category controller error:", error);
      const response = ResponseHelper.error(error.message || CATEGORY_MESSAGES.FAILED_CREATE_CATEGORY);
      res.status(response.statusCode).json(response);
    }
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const category = await this.categoryService.getCategoryById(id);
      const response = ResponseHelper.success(CATEGORY_MESSAGES.CATEGORY_RETRIEVED, { category });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get category by ID controller error:", error);
      const response = ResponseHelper.error(error.message || CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      res.status(response.statusCode).json(response);
    }
  };

  getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const category = await this.categoryService.getCategoryBySlug(slug);
      const response = ResponseHelper.success(CATEGORY_MESSAGES.CATEGORY_RETRIEVED, { category });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get category by slug controller error:", error);
      const response = ResponseHelper.error(error.message || CATEGORY_MESSAGES.CATEGORY_NOT_FOUND);
      res.status(response.statusCode).json(response);
    }
  };

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.categoryService.getAllCategories(page, limit, search);
      const response = ResponseHelper.success(CATEGORY_MESSAGES.CATEGORIES_RETRIEVED, result);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get all categories controller error:", error);
      const response = ResponseHelper.error(error.message || CATEGORY_MESSAGES.FAILED_FETCH_CATEGORIES);
      res.status(response.statusCode).json(response);
    }
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateCategoryDto = req.body;

      const category = await this.categoryService.updateCategory(id, updateDto);
      const response = ResponseHelper.success(CATEGORY_MESSAGES.CATEGORY_UPDATED, { category });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Update category controller error:", error);
      const response = ResponseHelper.error(error.message || CATEGORY_MESSAGES.FAILED_UPDATE_CATEGORY);
      res.status(response.statusCode).json(response);
    }
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.categoryService.deleteCategory(id);
      const response = ResponseHelper.success(CATEGORY_MESSAGES.CATEGORY_DELETED);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Delete category controller error:", error);
      const response = ResponseHelper.error(error.message || CATEGORY_MESSAGES.FAILED_DELETE_CATEGORY);
      res.status(response.statusCode).json(response);
    }
  };

  searchCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!q || typeof q !== "string") {
        const response = ResponseHelper.badRequest("Search query is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const categories = await this.categoryService.searchCategories(q, limit);
      const response = ResponseHelper.success("Categories search completed", { categories });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Search categories controller error:", error);
      const response = ResponseHelper.error("Failed to search categories");
      res.status(response.statusCode).json(response);
    }
  };
}