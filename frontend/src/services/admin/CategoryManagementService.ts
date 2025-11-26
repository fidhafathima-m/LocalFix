/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CreateCategoryData,
  UpdateCategoryData,
} from "../../interface/admin/IAdminApi";
import { adminAPI } from "../common/adminApi";

export class CategoryManagementService {
  static async getCategories(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    try {
      const response = await adminAPI.getCategories(
        page,
        limit,
        search,
        status
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get categories");
    }
  }

  static async getCategoryById(categoryId: string) {
    try {
      const response = await adminAPI.getCategoryById(categoryId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get category by ID");
    }
  }

  static async getCategoryBySlug(slug: string) {
    try {
      const response = await adminAPI.getCategoryBySlug(slug);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get category by slug");
    }
  }

  static async createCategory(categoryData: CreateCategoryData) {
    try {
      const response = await adminAPI.createCategory(categoryData);

      return response.data || response;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.message) {
        throw new Error(error.message);
      }

      throw new Error("Failed to create category");
    }
  }

  static async updateCategory(
    categoryId: string,
    updateData: UpdateCategoryData
  ) {
    try {
      const response = await adminAPI.updateCategory(categoryId, updateData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update category");
    }
  }

  static async deleteCategory(categoryId: string) {
    try {
      const response = await adminAPI.deleteCategory(categoryId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to delete category");
    }
  }

  static async searchCategories(query: string, limit: number = 10) {
    try {
      const response = await adminAPI.searchCategories(query, limit);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to search categories");
    }
  }

  private static handleResponse(response: any) {
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }

    if (response.data && response.data.data) {
      return response.data.data;
    }

    if (response.data) {
      return response.data;
    }
    return response;
  }

  private static handleError(error: any, defaultMessage: string) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(defaultMessage);
  }
}
