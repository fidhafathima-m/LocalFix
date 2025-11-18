/* eslint-disable @typescript-eslint/no-explicit-any */
import { technicianSubscriptionAPI } from "../common/subscriptionApi";

export class TechnicianSubscriptionService {
  static async getSubscriptions() {
    try {
      const response = await technicianSubscriptionAPI.getSubscriptions();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get subscription plans");
    }
  }

  static async getSubscriptionById(subscriptionId: string) {
    try {
      const response = await technicianSubscriptionAPI.getSubscriptionById(
        subscriptionId
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get subscription plan");
    }
  }

  static async getSubscriptionBySlug(slug: string) {
    try {
      const response = await technicianSubscriptionAPI.getSubscriptionBySlug(
        slug
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get subscription plan");
    }
  }

  // Get current active subscription for the technician
  static async getCurrentSubscription() {
    try {
      const response = await technicianSubscriptionAPI.getCurrentSubscription();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get current subscription");
    }
  }

  // Get subscription history for the technician
  static async getSubscriptionHistory() {
    try {
      const response = await technicianSubscriptionAPI.getSubscriptionHistory();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get subscription history");
    }
  }

  // Get subscription details by purchase ID
  static async getSubscriptionPurchaseById(purchaseId: string) {
    try {
      const response =
        await technicianSubscriptionAPI.getSubscriptionPurchaseById(purchaseId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(
        error,
        "Failed to get subscription purchase details"
      );
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
