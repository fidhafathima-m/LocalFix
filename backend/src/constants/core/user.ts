export const USER_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
  PENDING: "pending",
} as const;

export const USER_ROLES = {
  USER: "user",
  SERVICE_PROVIDER: "serviceProvider",
  TECHNICIAN: "technician",
  ADMIN: "admin",
} as const;