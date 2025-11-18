// services/technician/sparePartsService.ts
import { technicianAPI } from "../common/technicianApi";

export interface SparePartRequestItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CreateSparePartsRequestDto {
  orderId: string;
  technicianId: string;
  items: SparePartRequestItem[];
  technicianNotes?: string;
}

export interface SparePartsRequestResponse {
  _id: string;
  orderId: string;
  technicianId: {
    _id: string;
    displayName: string;
    phone: string;
  };
  customerId: string;
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: string;
  technicianNotes?: string;
  customerNotes?: string;
  requestedAt: string;
  respondedAt?: string;
}

export class SparePartsService {
  static async createSparePartsRequest(createDto: CreateSparePartsRequestDto) {
    try {
      const response = await technicianAPI.requestSpareParts(createDto);

      if (response.success === false) {
        throw new Error(response.message || "Failed to request spare parts");
      }

      return response.data;
    } catch (error) {
      console.error("Error requesting spare parts:", error);
      throw error;
    }
  }

  static async getSparePartsRequestsByOrder(orderId: string) {
    try {
      const response = await technicianAPI.getSparePartsRequests(orderId);
      return response.data;
    } catch (error) {
      console.error("Error fetching spare parts requests:", error);
      throw error;
    }
  }

  static async updateSparePartsRequestStatus(
    requestId: string,
    status: "approved" | "rejected",
    customerNotes?: string
  ) {
    try {
      const response = await technicianAPI.updateSparePartsStatus(requestId, {
        status,
        customerNotes,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating spare parts status:", error);
      throw error;
    }
  }
}
