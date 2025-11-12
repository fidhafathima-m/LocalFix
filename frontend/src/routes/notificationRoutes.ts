export const NOTIFICATION_ROUTES = {
  // Base notification routes
  BASE: "/notifications",
  MARK_AS_READ: (notificationId: string) =>
    `/notifications/${notificationId}/read`,
  MARK_ALL_READ: "/notifications/mark-all-read",
  UNREAD_COUNT: "/notifications/unread-count",

  // Technician specific notification routes
  TECHNICIAN_NOTIFICATIONS: "/technician/notifications",
  TECHNICIAN_MARK_AS_READ: (notificationId: string) =>
    `/technician/notifications/${notificationId}/read`,
  TECHNICIAN_MARK_ALL_READ: "/technician/notifications/mark-all-read",
  TECHNICIAN_UNREAD_COUNT: "/technician/notifications/unread-count",

  // Admin notification routes
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_MARK_AS_READ: (notificationId: string) =>
    `/admin/notifications/${notificationId}/read`,
  ADMIN_MARK_ALL_READ: "/admin/notifications/mark-all-read",
  ADMIN_UNREAD_COUNT: "/admin/notifications/unread-count",

  // Customer notification routes
  CUSTOMER_NOTIFICATIONS: "/customer/notifications",
  CUSTOMER_MARK_AS_READ: (notificationId: string) =>
    `/customer/notifications/${notificationId}/read`,
  CUSTOMER_MARK_ALL_READ: "/customer/notifications/mark-all-read",
  CUSTOMER_UNREAD_COUNT: "/customer/notifications/unread-count",
} as const;
