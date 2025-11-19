import api from "../../utils/axiosConfig";

export const serviceService = {
  // Get service by ID
  getServiceById: async (serviceId: string) => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },

  // Get service by slug
  getServiceBySlug: async (slug: string) => {
    const response = await api.get(`/services/slug/${slug}`);
    return response.data;
  },

  // Get all services
  getAllServices: async (
    page: number = 1,
    limit: number = 50,
    search?: string
  ) => {
    const response = await api.get("/services", {
      params: { page, limit, search },
    });
    return response.data;
  },

  // Get services by category
  getServicesByCategory: async (
    categoryId: string,
    page: number = 1,
    limit: number = 50
  ) => {
    const response = await api.get(`/services/category/${categoryId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Search services
  searchServices: async (query: string, limit: number = 10) => {
    const response = await api.get("/services/search", {
      params: { q: query, limit },
    });
    return response.data;
  },
};
