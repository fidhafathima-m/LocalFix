import api from "../../utils/axiosConfig";

export const sparePartsApi = {
  getSparePartsRequests: async (orderId: string) => {
    const response = await api.get(
      `/technician/spare-parts/orders/${orderId}/requests`
    );
    return response.data;
  },
};
