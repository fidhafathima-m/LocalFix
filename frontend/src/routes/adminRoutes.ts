export const ADMIN_ROUTES = {
  
  // User routes
  USERS: "/admin/users",
  USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
  USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,

  PUBLIC_USER_PROFILE: "/public/user/profile",
  PUBLIC_USER_BY_ID: (userId: string) => `/public/user/${userId}`,  

  // Technician routes
  TECHNICIANS: "/admin/technicians",
  TECHNICIAN_BY_ID: (technicianId: string) =>
    `/admin/technicians/${technicianId}`,
  TECHNICIAN_STATUS: (technicianId: string) =>
    `/admin/technicians/${technicianId}/status`,

  //  Public technciian 
  GET_PUBLIC_TECHNICIAN: "/admin/technicians/public",
  GET_PUBLIC_TECHNICIAN_BY_ID: (technicianId: string) => `/admin/technicians/public/${technicianId}`,

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
  SERVICES_BY_CATEGORY: (categoryId: string) => `/admin/services/category/${categoryId}`,
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
} as const;
