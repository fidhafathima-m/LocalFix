export const ADMIN_ROUTES = {
  // User routes
  USERS: "/admin/users",
  USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
  USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,

  PUBLIC_USER_PROFILE: "/public/user/profile",
  PUBLIC_USER_BY_ID: (userId: string) => `/public/user/${userId}`,
  PUBLIC_AVAILABILITY: (technicianId: string) =>
    `/admin/technicians/public/${technicianId}/availability`,

  // Technician routes
  TECHNICIANS: "/admin/technicians",
  TECHNICIAN_BY_ID: (technicianId: string) =>
    `/admin/technicians/${technicianId}`,
  TECHNICIAN_STATUS: (technicianId: string) =>
    `/admin/technicians/${technicianId}/status`,
  TECHNICIAN_SLOT_RULES: (technicianId: string) =>
    `/admin/technicians/${technicianId}/slot-rules`,
  TECHNICIAN_AVAILABILITY: (technicianId: string) =>
    `/admin/technicians/${technicianId}/availability`,

  //  Public technciian
  GET_PUBLIC_TECHNICIAN: "/admin/technicians/public",
  GET_PUBLIC_TECHNICIAN_BY_ID: (technicianId: string) =>
    `/admin/technicians/public/${technicianId}`,

  // Application routes
  APPLICATIONS_PENDING: "/admin/technicians/applications/pending",
  APPLICATION_BY_ID: (applicationId: string) =>
    `/admin/technicians/applications/${applicationId}`,
  APPLICATION_APPROVE: (applicationId: string) =>
    `/admin/technicians/applications/${applicationId}/approve`,
  APPLICATION_REJECT: (applicationId: string) =>
    `/admin/technicians/applications/${applicationId}/reject`,

  // Categories
  CATEGORIES: "/admin/categories",
  CATEGORY_BY_ID: (id: string) => `/admin/categories/${id}`,
  CATEGORY_BY_SLUG: (slug: string) => `/admin/categories/slug/${slug}`,
  CATEGORIES_SEARCH: "/admin/categories/search",

  // Services
  SERVICES: "/admin/services",
  SERVICES_BY_CATEGORY: (categoryId: string) =>
    `/admin/services/category/${categoryId}`,
  SERVICE_BY_ID: (id: string) => `/admin/services/${id}`,
  SERVICE_BY_SLUG: (slug: string) => `/admin/services/slug/${slug}`,
  SERVICES_SEARCH: "/admin/services/search",

  //  items
  ITEMS: "/admin/items",
  ITEMS_BY_SERVICE: (serviceId: string) => `/admin/items/service/${serviceId}`,
  ITEM_BY_ID: (itemId: string) => `/admin/items/${itemId}`,
  CREATE_ITEM: `/admin/items/`,
  UPDATE_ITEM: (itemId: string) => `/admin/items/${itemId}`,
  DELETE_ITEM: (itemId: string) => `/admin/items/${itemId}`,
  SEARCH_ITEM: "/admin/items/search",

  // User profile
  UPDATE_USER_PROFILE: "/user/profile",
  UPDATE_PROFILE_PHOTO: "/user/profile/upload-photo",
  CHANGE_PASSWORD: "/user/change-password",
  USER_ADDRESSES: "/user/addresses",
  CREATE_ADDRESS: "/user/addresses",
  UPDATE_ADDRESS: (addressId: string) => `/user/addresses/${addressId}`,
  DELETE_ADDRESS: (addressId: string) => `/user/addresses/${addressId}`,
  SET_DEFAULT_ADDRESS: (addressId: string) =>
    `/user/addresses/${addressId}/default`,

  // Orders
  ORDERS: "/admin/orders",
  ORDER_BY_ID: (orderId: string) => `/admin/orders/${orderId}`,
  ORDER_STATUS: (orderId: string) => `/admin/orders/${orderId}/status`,
  ORDER_STATS: "/admin/orders/stats",
  ORDERS_BY_TECHNICIAN: (technicianId: string) =>
    `/admin/orders/technician/${technicianId}`,

  // Review routes
  REVIEWS: "/admin/reviews",
  REVIEW_BY_ID: (reviewId: string) => `/admin/reviews/${reviewId}`,
  REVIEW_STATS: "/admin/reviews/stats",
  REVIEW_UPDATE_STATUS: (reviewId: string) =>
    `/admin/reviews/${reviewId}/status`,
  REVIEW_FLAG: (reviewId: string) => `/admin/reviews/${reviewId}/flag`,

  // Payments
  PAYMENTS: "/admin/payments",
  PAYMENT_BY_ID: (paymentId: string) => `/admin/payments/${paymentId}`,
  PAYMENT_STATS: "/admin/payments/stats",
  PAYMENT_REFUND: (paymentId: string) => `/admin/payments/${paymentId}/refund`,
  PAYMENT_EXPORT: "/admin/payments/export",

  // dashboard
  OVERVIEW: "/admin/reports/overview",
  REVENUE_TREND: "/admin/reports/revenue-trend",
  TOP_TECHNICIANS: "/admin/reports/top-technicians",
  CUSTOMER_SATISFACTION: "/admin/reports/customer-satisfaction",
  PAYMENT_METHODS: "/admin/reports/payment-methods",
  GROWTH_METRICS: "/admin/reports/growth-metrics",
  COMPLETE: "/admin/reports/complete",

  GENERATE_REPORT: "/admin/reports/generate",
  FINANCIAL_REPORT: "/admin/reports/financial",
  CUSTOMER_REPORT: "/admin/reports/customer",
  TECHNICIAN_REPORT: "/admin/reports/technician",
  EXPORT_REPORT: "/admin/reports/export",

  // Subscription routes
  SUBSCRIPTIONS: "/admin/subscriptions",
  SUBSCRIPTION_BY_ID: (id: string) => `/admin/subscriptions/${id}`,
  SUBSCRIPTION_BY_SLUG: (slug: string) => `/admin/subscriptions/slug/${slug}`,
  SUBSCRIPTIONS_SEARCH: "/admin/subscriptions/search",
} as const;
