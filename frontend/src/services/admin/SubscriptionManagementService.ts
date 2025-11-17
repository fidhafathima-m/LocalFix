/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CreateSubscriptionData,
  UpdateSubscriptionData,
} from "../../interface/admin/ISubscription";
import { adminAPI } from "../common/adminApi";

export class SubscriptionManagementService {
  static async getSubscriptions(
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    try {
      const response = await adminAPI.getSubscriptions(page, limit, search);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get subscriptions");
    }
  }

  static async getSubscriptionById(subscriptionId: string) {
    try {
      const response = await adminAPI.getSubscriptionById(subscriptionId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get subscription by ID");
    }
  }

  static async getSubscriptionBySlug(slug: string) {
    try {
      const response = await adminAPI.getSubscriptionBySlug(slug);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get subscription by slug");
    }
  }

  static async createSubscription(subscriptionData: CreateSubscriptionData) {
    try {
      const response = await adminAPI.createSubscription(subscriptionData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to create subscription");
    }
  }

  static async updateSubscription(
    subscriptionId: string,
    updateData: UpdateSubscriptionData
  ) {
    try {
      const response = await adminAPI.updateSubscription(
        subscriptionId,
        updateData
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update subscription");
    }
  }

  static async deleteSubscription(subscriptionId: string) {
    try {
      const response = await adminAPI.deleteSubscription(subscriptionId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to delete subscription");
    }
  }

  static async searchSubscriptions(query: string, limit: number = 10) {
    try {
      const response = await adminAPI.searchSubscriptions(query, limit);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to search subscriptions");
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
