/* eslint-disable @typescript-eslint/no-explicit-any */
// services/admin/ServiceManagementService.ts
import { adminAPI } from "../common/adminApi";
import type { CreateServiceData, UpdateServiceData } from "../common/adminApi"

export class ServiceManagementService {
  static async getServicesByCategory(categoryId: string, page: number = 1, limit: number = 10, search?: string) {
    try {
      console.log("📡 Calling API for services by category:", { categoryId, page, limit, search });
      
      const response = await adminAPI.getServicesByCategory(categoryId, page, limit, search);
      console.log("✅ Raw API response:", response);
      
      // Extract data from the response
      const result = this.handleResponse(response);
      console.log("✅ Processed result:", result);
      return result;
      
    } catch (error: any) {
      console.error("💥 Error in getServicesByCategory:", error);
      throw this.handleError(error, "Failed to get services");
    }
  }

  static async getAllServices(page: number = 1, limit: number = 10, search?: string) {
    try {
      const response = await adminAPI.getAllServices(page, limit, search);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting all services:", error);
      throw this.handleError(error, "Failed to get services");
    }
  }

  static async getServiceById(serviceId: string) {
    try {
      const response = await adminAPI.getServiceById(serviceId);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting service by ID:", error);
      throw this.handleError(error, "Failed to get service by ID");
    }
  }

  static async getServiceBySlug(slug: string) {
    try {
      const response = await adminAPI.getServiceBySlug(slug);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting service by slug:", error);
      throw this.handleError(error, "Failed to get service by slug");
    }
  }

  static async createService(serviceData: CreateServiceData) {
    try {
      console.log("📡 Creating service:", serviceData);
      const response = await adminAPI.createService(serviceData);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error creating service:", error);
      throw this.handleError(error, "Failed to create service");
    }
  }

  static async updateService(serviceId: string, updateData: UpdateServiceData) {
    try {
      const response = await adminAPI.updateService(serviceId, updateData);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error updating service:", error);
      throw this.handleError(error, "Failed to update service");
    }
  }

  static async deleteService(serviceId: string) {
    try {
      const response = await adminAPI.deleteService(serviceId);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error deleting service:", error);
      throw this.handleError(error, "Failed to delete service");
    }
  }

  static async searchServices(query: string, limit: number = 10) {
    try {
      const response = await adminAPI.searchServices(query, limit);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error searching services:", error);
      throw this.handleError(error, "Failed to search services");
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