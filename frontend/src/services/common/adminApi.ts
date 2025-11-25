/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ApiResponse,
  ApplicationsResponse,
  CategoriesResponse,
  Category,
  CreateCategoryData,
  CreateItemData,
  CreateServiceData,
  Item,
  ItemsResponse,
  Order,
  OrdersResponse,
  OrderStatsResponse,
  Service,
  ServicesResponse,
  TechnicianResponse,
  TechniciansResponse,
  UpdateCategoryData,
  UpdateItemData,
  UpdateServiceData,
  User,
  UserResponse,
  UsersResponse,
} from "../../interface/admin/IAdminApi";
import type {
  IPayment,
  PaymentsResponse,
  PaymentStatsResponse,
} from "../../interface/admin/IPayment";
import type { Review, ReviewsResponse } from "../../interface/admin/IReview";
import type {
  CreateSubscriptionData,
  Subscription,
  SubscriptionsResponse,
  UpdateSubscriptionData,
} from "../../interface/admin/ISubscription";
import { ADMIN_ROUTES } from "../../routes/adminRoutes";
import type { Technician } from "../../store/slices/adminSlice";
import api from "../../utils/axiosConfig";
import type { ReviewStatsResponse } from "../user/reviewService";

export const adminAPI = {
  // Users
  getUsers: (search?: string, status?: string) =>
    api.get<ApiResponse<UsersResponse>>(ADMIN_ROUTES.USERS, {
      params: {
        search: search || undefined,
        status: status || undefined,
      },
    }),

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

  getUserProfile: () =>
    api.get<ApiResponse<UserResponse>>(ADMIN_ROUTES.PUBLIC_USER_PROFILE),
  getPublicUserById: (userId: string) =>
    api.get<ApiResponse<{ user: User }>>(
      ADMIN_ROUTES.PUBLIC_USER_BY_ID(userId)
    ),
  getTechnicianPublicAvailability: (
    technicianId: string,
    startDate: string,
    endDate: string
  ) =>
    api.get<ApiResponse<{ user: User }>>(
      ADMIN_ROUTES.PUBLIC_AVAILABILITY(technicianId),
      {
        params: { startDate, endDate },
      }
    ),

  // Technicians
  getTechnicians: (
    filters: {
      status?: string;
      service?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) =>
    api.get<ApiResponse<TechniciansResponse>>(ADMIN_ROUTES.TECHNICIANS, {
      params: filters,
    }),

  getPendingApplications: (
    filters: {
      service?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) =>
    api.get<ApiResponse<ApplicationsResponse>>(
      ADMIN_ROUTES.APPLICATIONS_PENDING,
      { params: filters }
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

  getPublicTechnicians: (filters: {
    service?: string;
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters.service) params.append("service", filters.service);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.location) params.append("location", filters.location);

    return api.get<ApiResponse<TechniciansResponse>>(
      ADMIN_ROUTES.GET_PUBLIC_TECHNICIAN,
      { params }
    );
  },

  getPublicTechnicianById: (technicianId: string) =>
    api.get<ApiResponse<TechnicianResponse>>(
      ADMIN_ROUTES.GET_PUBLIC_TECHNICIAN_BY_ID(technicianId)
    ),

  // Categories
  getCategories: (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) =>
    api.get<ApiResponse<CategoriesResponse>>(ADMIN_ROUTES.CATEGORIES, {
      params: {
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      },
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
    search?: string,
    status?: string
  ) => {
    const params: any = { page, limit };

    if (search && search.trim()) {
      params.search = search;
    }

    if (status && status.trim()) {
      params.status = status;
    }

    return api.get<ApiResponse<ServicesResponse>>(
      ADMIN_ROUTES.SERVICES_BY_CATEGORY(categoryId),
      { params }
    );
  },

  getAllServices: (
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder?: string,
    status?: string
  ) =>
    api.get<ApiResponse<ServicesResponse>>(ADMIN_ROUTES.SERVICES, {
      params: {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status,
      },
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
    api.get<ApiResponse<{ technician: Technician }>>(
      ADMIN_ROUTES.TECHNICIAN_SLOT_RULES(technicianId)
    ),
  getTechnicianAvailability: (
    technicianId: string,
    startDate: string,
    endDate: string
  ) =>
    api.get<ApiResponse<{ technician: Technician }>>(
      ADMIN_ROUTES.TECHNICIAN_AVAILABILITY(technicianId),
      {
        params: { startDate, endDate },
      }
    ),

  getOrders: (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) =>
    api.get<ApiResponse<OrdersResponse>>(ADMIN_ROUTES.ORDERS, {
      params: { page, limit, search, status },
    }),

  getOrderById: (orderId: string) =>
    api.get<ApiResponse<{ order: Order }>>(ADMIN_ROUTES.ORDER_BY_ID(orderId)),

  getOrderStats: () =>
    api.get<ApiResponse<OrderStatsResponse>>(ADMIN_ROUTES.ORDER_STATS),

  updateOrderStatus: (orderId: string, status: string, reason?: string) =>
    api.patch<ApiResponse<{ order: Order }>>(
      ADMIN_ROUTES.ORDER_STATUS(orderId),
      { status, reason }
    ),
  getOrdersByTechnician: (
    technicianId: string,
    page: number = 1,
    limit: number = 100
  ) =>
    api.get<ApiResponse<OrdersResponse>>(
      ADMIN_ROUTES.ORDERS_BY_TECHNICIAN(technicianId),
      {
        params: { page, limit },
      }
    ),

  getReviews: (
    page: number = 1,
    limit: number = 10,
    search?: string,
    rating?: string,
    status?: string,
    service?: string
  ) =>
    api.get<ApiResponse<ReviewsResponse>>(ADMIN_ROUTES.REVIEWS, {
      params: { page, limit, search, rating, status, service },
    }),

  getReviewStats: () =>
    api.get<ApiResponse<ReviewStatsResponse>>(ADMIN_ROUTES.REVIEW_STATS),

  updateReviewStatus: (reviewId: string, status: string) =>
    api.patch<ApiResponse<{ review: Review }>>(
      ADMIN_ROUTES.REVIEW_UPDATE_STATUS(reviewId),
      { status }
    ),

  flagReview: (reviewId: string, reason?: string) =>
    api.patch<ApiResponse<{ review: Review }>>(
      ADMIN_ROUTES.REVIEW_FLAG(reviewId),
      { reason }
    ),

  deleteReview: (reviewId: string) =>
    api.delete<ApiResponse<void>>(ADMIN_ROUTES.REVIEW_BY_ID(reviewId)),

  // Payments
  getPayments: (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ) =>
    api.get<ApiResponse<PaymentsResponse>>(ADMIN_ROUTES.PAYMENTS, {
      params: { page, limit, search, status, startDate, endDate },
    }),

  getPaymentById: (paymentId: string) =>
    api.get<ApiResponse<{ payment: IPayment }>>(
      ADMIN_ROUTES.PAYMENT_BY_ID(paymentId)
    ),

  getPaymentStats: () =>
    api.get<ApiResponse<PaymentStatsResponse>>(ADMIN_ROUTES.PAYMENT_STATS),

  processRefund: (paymentId: string, reason?: string) =>
    api.post<ApiResponse<Promise<{ success: boolean; message?: string }>>>(
      ADMIN_ROUTES.PAYMENT_REFUND(paymentId),
      {
        reason,
      }
    ),

  exportPayments: (format: "csv" | "excel" = "csv", filters?: any) =>
    api.get<Blob>(ADMIN_ROUTES.PAYMENT_EXPORT, {
      params: { format, ...filters },
      responseType: "blob",
    }),

  // reports
  getDashboardOverview: () => api.get(ADMIN_ROUTES.OVERVIEW),

  getRevenueTrend: (period?: string) =>
    api.get(ADMIN_ROUTES.REVENUE_TREND, {
      params: { period },
    }),

  getTopTechnicians: (limit?: number) =>
    api.get(ADMIN_ROUTES.TOP_TECHNICIANS, {
      params: { limit },
    }),

  getCustomerSatisfaction: () => api.get(ADMIN_ROUTES.CUSTOMER_SATISFACTION),

  getPaymentMethods: () => api.get(ADMIN_ROUTES.PAYMENT_METHODS),

  getGrowthMetrics: () => api.get(ADMIN_ROUTES.GROWTH_METRICS),

  getCompleteDashboard: () => api.get(ADMIN_ROUTES.COMPLETE),

  generateReport: (request: any) =>
    api.post(ADMIN_ROUTES.GENERATE_REPORT, request),

  generateFinancialReport: (startDate: Date, endDate: Date) =>
    api.post(ADMIN_ROUTES.FINANCIAL_REPORT, { startDate, endDate }),

  generateCustomerReport: (startDate: Date, endDate: Date) =>
    api.post(ADMIN_ROUTES.CUSTOMER_REPORT, { startDate, endDate }),

  generateTechnicianReport: (startDate: Date, endDate: Date) =>
    api.post(ADMIN_ROUTES.TECHNICIAN_REPORT, { startDate, endDate }),

  exportReport: (data: any, format: string) =>
    api.post(ADMIN_ROUTES.EXPORT_REPORT, { data, format }),

  // Subscriptions
  getSubscriptions: (page: number = 1, limit: number = 10, search?: string) =>
    api.get<ApiResponse<SubscriptionsResponse>>(ADMIN_ROUTES.SUBSCRIPTIONS, {
      params: { page, limit, search },
    }),

  getSubscriptionById: (subscriptionId: string) =>
    api.get<ApiResponse<{ subscription: Subscription }>>(
      ADMIN_ROUTES.SUBSCRIPTION_BY_ID(subscriptionId)
    ),

  getSubscriptionBySlug: (slug: string) =>
    api.get<ApiResponse<{ subscription: Subscription }>>(
      ADMIN_ROUTES.SUBSCRIPTION_BY_SLUG(slug)
    ),

  createSubscription: (subscriptionData: CreateSubscriptionData) =>
    api.post<ApiResponse<{ subscription: Subscription }>>(
      ADMIN_ROUTES.SUBSCRIPTIONS,
      subscriptionData
    ),

  updateSubscription: (
    subscriptionId: string,
    updateData: UpdateSubscriptionData
  ) =>
    api.put<ApiResponse<{ subscription: Subscription }>>(
      ADMIN_ROUTES.SUBSCRIPTION_BY_ID(subscriptionId),
      updateData
    ),

  deleteSubscription: (subscriptionId: string) =>
    api.delete<ApiResponse<void>>(
      ADMIN_ROUTES.SUBSCRIPTION_BY_ID(subscriptionId)
    ),

  searchSubscriptions: (query: string, limit: number = 10) =>
    api.get<ApiResponse<{ subscriptions: Subscription[] }>>(
      ADMIN_ROUTES.SUBSCRIPTIONS_SEARCH,
      { params: { q: query, limit } }
    ),
};
