/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CreateItemData, UpdateItemData } from "../../interface/admin/IAdminApi";
import { adminAPI } from "../common/adminApi";

export class ItemManagementService {
  static async getItemsByService(
    serviceId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    try {
      const response = await adminAPI.getItemsByService(
        serviceId,
        page,
        limit,
        search
      );

      const result = this.handleResponse(response);
      return result;
    } catch (error: any) {
      console.error("Error in getItemsByService:", error);
      throw this.handleError(error, "Failed to get items");
    }
  }

  static async getAllItems(
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    try {
      const response = await adminAPI.getAllItems(page, limit, search);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting all items:", error);
      throw this.handleError(error, "Failed to get items");
    }
  }

  static async getItemById(itemId: string) {
    try {
      const response = await adminAPI.getItemById(itemId);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting item by ID:", error);
      throw this.handleError(error, "Failed to get item by ID");
    }
  }

  static async createItem(itemData: CreateItemData) {
    try {
      const response = await adminAPI.createItem(itemData);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error creating item:", error);
      throw this.handleError(error, "Failed to create item");
    }
  }

  static async updateItem(itemId: string, updateData: UpdateItemData) {
    try {
      const response = await adminAPI.updateItem(itemId, updateData);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error updating item:", error);
      throw this.handleError(error, "Failed to update item");
    }
  }

  static async deleteItem(itemId: string) {
    try {
      const response = await adminAPI.deleteItem(itemId);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error deleting item:", error);
      throw this.handleError(error, "Failed to delete item");
    }
  }

  static async searchItems(query: string, limit: number = 10) {
    try {
      const response = await adminAPI.searchItems(query, limit);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error searching items:", error);
      throw this.handleError(error, "Failed to search items");
    }
  }

  private static handleResponse(response: any) {
    // Check if response has success property (your API structure)
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }

    if (response.data && response.data.data) {
      return response.data.data;
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
