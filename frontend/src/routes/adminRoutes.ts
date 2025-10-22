export const ADMIN_ROUTES = {
  
  // User routes
  USERS: "/admin/users",
  USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
  USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,

  // Technician routes
  TECHNICIANS: "/admin/technicians",
  TECHNICIAN_BY_ID: (technicianId: string) =>
    `/admin/technicians/${technicianId}`,
  TECHNICIAN_STATUS: (technicianId: string) =>
    `/admin/technicians/${technicianId}/status`,

  // Application routes
  APPLICATIONS_PENDING: "/admin/technicians/applications/pending",
  APPLICATION_BY_ID: (applicationId: string) =>
    `/admin/technicians/applications/${applicationId}`,
  APPLICATION_APPROVE: (applicationId: string) =>
    `/admin/technicians/applications/${applicationId}/approve`,
  APPLICATION_REJECT: (applicationId: string) =>
    `/admin/technicians/applications/${applicationId}/reject`,
} as const;
