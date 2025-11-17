import type { SparePartsRequest } from "../../interface/user/ISpareParts";
import { sparePartsApi } from "../common/sparePartsApi";

export class UserSparePartsService {
  static async getSparePartsByOrder(
    orderId: string
  ): Promise<SparePartsRequest[]> {
    try {
      const response = await sparePartsApi.getSparePartsRequests(orderId);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching spare parts:", error);
      return [];
    }
  }
}
