import { ADMIN_ROUTES } from "../../routes/adminRoutes";
import api from "../../utils/axiosConfig";
import type { Address } from "./userProfileApi";

export interface User {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  status: "Active" | "Inactive" | "Blocked";
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
  defaultAddress?: {
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    location: { type: "Point"; coordinates: [number, number] };
  };
  isVerified: boolean;
  role: string;
  createdAt: string;
  wallet: { balance: number };
  addresses?: Address[];
}

export interface Technician {
  _id: string;
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  averageRating: number;
  ratingCount: number;
  totalJobs?: number;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    phone: string;
    fullName: string;
  };
}

export interface TechnicianApplication {
  _id: string;
  technicianId: string;
  email: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  skills: {
    services?: string[];
    yearsOfExperience?: number;
  };
  submittedAt?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

interface UsersResponse {
  users: User[];
}

interface UserResponse {
  user: User;
}

interface TechniciansResponse {
  technicians: Technician[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface TechnicianResponse {
  data: {
    technician: Technician;
  };
}

interface ApplicationsResponse {
  applications: TechnicianApplication[];
}

export interface Category {
  serviceCount: number;
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  iconUrl?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Service {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  itemCount?: number; // Optional field for frontend stats
  rating?: number;
  estimatedDuration?: string;
  features?: string[];
  popular?: boolean;
}

export interface CreateServiceData {
  categoryId?: string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl?: string;
  status?: "active" | "inactive";
  rating?: number;
  estimatedDuration?: string;
  features?: string[];
  popular?: boolean
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  avgBasePrice?: number;
  iconUrl?: string;
  status?: "active" | "inactive";
  rating?: number;
  estimatedDuration?: string;
  features?: string[];
  popular?: boolean
}

export interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Item {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  serviceId?: string;
  name: string;
  description: string;
  price: number;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateItemData {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  isActive?: boolean;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminAPI = {
  // Users
  getUsers: () => api.get<ApiResponse<UsersResponse>>(ADMIN_ROUTES.USERS),

  updateUser: (userId: string, updates: Partial<User>) =>
    api.put<ApiResponse<UserResponse>>(
      ADMIN_ROUTES.USER_BY_ID(userId),
      updates
    ),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse<void>>(ADMIN_ROUTES.USER_BY_ID(userId)),

  updateUserStatus: (userId: string, status: string) =>
    api.patch<ApiResponse<UserResponse>>(ADMIN_ROUTES.USER_STATUS(userId), {
      status,
    }),

    getUserProfile: () => api.get<ApiResponse<UserResponse>>(ADMIN_ROUTES.PUBLIC_USER_PROFILE),
    getPublicUserById: (userId: string) =>
    api.get<ApiResponse<{ user: User }>>(ADMIN_ROUTES.PUBLIC_USER_BY_ID(userId)),

  // Technicians
  getTechnicians: (filters: { status?: string } = {}) =>
    api.get<ApiResponse<TechniciansResponse>>(ADMIN_ROUTES.TECHNICIANS, {
      params: filters,
    }),

  getPendingApplications: () =>
    api.get<ApiResponse<ApplicationsResponse>>(
      ADMIN_ROUTES.APPLICATIONS_PENDING
    ),

  approveApplication: (applicationId: string) =>
    api.patch<ApiResponse<void>>(
      ADMIN_ROUTES.APPLICATION_APPROVE(applicationId)
    ),

  rejectApplication: (applicationId: string, rejectionReason: string) =>
    api.patch<ApiResponse<void>>(
      ADMIN_ROUTES.APPLICATION_REJECT(applicationId),
      { rejectionReason }
    ),

  updateTechnicianStatus: (technicianId: string, status: string) =>
    api.patch<ApiResponse<TechnicianResponse>>(
      ADMIN_ROUTES.TECHNICIAN_STATUS(technicianId),
      { status }
    ),

  // Application details
  getApplicationDetails: (applicationId: string) =>
    api.get<ApiResponse<ApplicationsResponse>>(
      ADMIN_ROUTES.APPLICATION_BY_ID(applicationId)
    ),

  // Technician details
  getTechnicianById: (technicianId: string) =>
    api.get<ApiResponse<TechnicianResponse>>(
      ADMIN_ROUTES.TECHNICIAN_BY_ID(technicianId)
    ),

    // In your adminAPI object, fix the getPublicTechnicians method
getPublicTechnicians: (filters: {
  service?: string;
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
}) => {
  const params = new URLSearchParams();
  if (filters.service) params.append('service', filters.service);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.location) params.append('location', filters.location);

  // Add the missing return statement
  return api.get<ApiResponse<TechniciansResponse>>(ADMIN_ROUTES.GET_PUBLIC_TECHNICIAN, { params });
},

  getPublicTechnicianById: (technicianId: string) =>
    api.get<ApiResponse<TechnicianResponse>>(ADMIN_ROUTES.GET_PUBLIC_TECHNICIAN_BY_ID(technicianId)),

  // Categories
  getCategories: (page: number = 1, limit: number = 10, search?: string) =>
    api.get<ApiResponse<CategoriesResponse>>(ADMIN_ROUTES.CATEGORIES, {
      params: { page, limit, search },
    }),

  getCategoryById: (categoryId: string) =>
    api.get<ApiResponse<{ category: Category }>>(
      ADMIN_ROUTES.CATEGORY_BY_ID(categoryId)
    ),

  getCategoryBySlug: (slug: string) =>
    api.get<ApiResponse<{ category: Category }>>(
      ADMIN_ROUTES.CATEGORY_BY_SLUG(slug)
    ),

  createCategory: (categoryData: CreateCategoryData) =>
    api.post<ApiResponse<{ category: Category }>>(
      ADMIN_ROUTES.CATEGORIES,
      categoryData
    ),

  updateCategory: (categoryId: string, updateData: UpdateCategoryData) =>
    api.put<ApiResponse<{ category: Category }>>(
      ADMIN_ROUTES.CATEGORY_BY_ID(categoryId),
      updateData
    ),

  deleteCategory: (categoryId: string) =>
    api.delete<ApiResponse<void>>(ADMIN_ROUTES.CATEGORY_BY_ID(categoryId)),

  searchCategories: (query: string, limit: number = 10) =>
    api.get<ApiResponse<{ categories: Category[] }>>(
      ADMIN_ROUTES.CATEGORIES_SEARCH,
      { params: { q: query, limit } }
    ),

  // Services
  getServicesByCategory: (
    categoryId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) =>
    api.get<ApiResponse<ServicesResponse>>(
      ADMIN_ROUTES.SERVICES_BY_CATEGORY(categoryId),
      {
        params: { page, limit, search },
      }
    ),

  getAllServices: (page: number = 1, limit: number = 10, search?: string) =>
    api.get<ApiResponse<ServicesResponse>>(ADMIN_ROUTES.SERVICES, {
      params: { page, limit, search },
    }),

  getServiceById: (serviceId: string) =>
    api.get<ApiResponse<{ service: Service }>>(
      ADMIN_ROUTES.SERVICE_BY_ID(serviceId)
    ),

  getServiceBySlug: (slug: string) =>
    api.get<ApiResponse<{ service: Service }>>(
      ADMIN_ROUTES.SERVICE_BY_SLUG(slug)
    ),

  createService: (serviceData: CreateServiceData) =>
    api.post<ApiResponse<{ service: Service }>>(
      ADMIN_ROUTES.SERVICES,
      serviceData
    ),

  updateService: (serviceId: string, updateData: UpdateServiceData) =>
    api.put<ApiResponse<{ service: Service }>>(
      ADMIN_ROUTES.SERVICE_BY_ID(serviceId),
      updateData
    ),

  deleteService: (serviceId: string) =>
    api.delete<ApiResponse<void>>(ADMIN_ROUTES.SERVICE_BY_ID(serviceId)),

  searchServices: (query: string, limit: number = 10) =>
    api.get<ApiResponse<{ services: Service[] }>>(
      ADMIN_ROUTES.SERVICES_SEARCH,
      { params: { q: query, limit } }
    ),

  // Items
  getItemsByService: (
    serviceId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) =>
    api.get<ApiResponse<ItemsResponse>>(
      ADMIN_ROUTES.ITEMS_BY_SERVICE(serviceId),
      { params: { page, limit, search } }
    ),

  getAllItems: (page: number = 1, limit: number = 10, search?: string) =>
    api.get<ApiResponse<ItemsResponse>>(ADMIN_ROUTES.ITEMS, {
      params: { page, limit, search },
    }),

  getItemById: (itemId: string) =>
    api.get<ApiResponse<{ item: Item }>>(ADMIN_ROUTES.ITEM_BY_ID(itemId)),

  createItem: (itemData: CreateItemData) =>
    api.post<ApiResponse<{ item: Item }>>(ADMIN_ROUTES.CREATE_ITEM, itemData),

  updateItem: (itemId: string, updateData: UpdateItemData) =>
    api.put<ApiResponse<{ item: Item }>>(
      ADMIN_ROUTES.UPDATE_ITEM(itemId),
      updateData
    ),

  deleteItem: (itemId: string) =>
    api.delete<ApiResponse<void>>(ADMIN_ROUTES.DELETE_ITEM(itemId)),

  searchItems: (query: string, limit: number = 10) =>
    api.get<ApiResponse<{ items: Item[] }>>(ADMIN_ROUTES.SEARCH_ITEM, {
      params: { q: query, limit },
    }),
  getTechnicianSlotRules: (technicianId: string) =>
    api.get<ApiResponse<{technician: Technician}>>(ADMIN_ROUTES.TECHNICIAN_SLOT_RULES(technicianId)),
  getTechnicianAvailability: (technicianId: string, startDate: string, endDate: string) =>
    api.get<ApiResponse<{technician: Technician}>>(ADMIN_ROUTES.TECHNICIAN_AVAILABILITY(technicianId), {
        params: { startDate, endDate }
      }),



};
