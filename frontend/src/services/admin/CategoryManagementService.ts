/* eslint-disable @typescript-eslint/no-explicit-any */
// services/admin/CategoryManagementService.ts
import { adminAPI } from "../common/adminApi";
import type { CreateCategoryData, UpdateCategoryData } from "../common/adminApi"

export class CategoryManagementService {
  static async getCategories(page: number = 1, limit: number = 10, search?: string) {
    try {
      const response = await adminAPI.getCategories(page, limit, search);
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
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to create category");
    }
  }

  static async updateCategory(categoryId: string, updateData: UpdateCategoryData) {
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
  console.log("🔄 Handling response:", response);
  
  if (response.success === false) {
    throw new Error(response.message || "Operation failed");
  }
  
  if (response.data && response.data.data) {
    console.log("✅ Extracting nested data:", response.data.data);
    return response.data.data;
  }
  
  if (response.data) {
    console.log("✅ Extracting data from response.data:", response.data);
    return response.data;
  }
  
  console.log("⚠️ No nested data structure found, returning response:", response);
  return response;
}

  private static handleError(error: any, defaultMessage: string) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(defaultMessage);
  }
}