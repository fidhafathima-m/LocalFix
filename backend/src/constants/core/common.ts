export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  SINGLE_RESULT: {
    page: 1,
    limit: 1,
    total: 1,
    pages: 1,
  },
  SORT_BY: "createdAt",
  SORT_ORDER: "desc" as const,
} as const;

export const VALIDATION = {
  MIN_FULL_NAME_LENGTH: 2,
  MAX_FULL_NAME_LENGTH: 100,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 15,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_EXPERIENCE_YEARS: 0,
  MAX_EXPERIENCE_YEARS: 50,
  MIN_WORK_RADIUS: 1,
  MAX_WORK_RADIUS: 100,
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
} as const;

export const RESPONSE_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  FAIL: "fail",
} as const;

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  EXPIRY_MS: 5 * 60 * 1000, // 5 minutes in milliseconds
} as const;

export const OTP_PURPOSES = {
  SIGNUP: "signup",
  RESET: "reset",
  LOGIN: "login",
  VERIFICATION: "verification",
} as const;

export const GENERAL_MESSAGES = {
  SERVER_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  BAD_REQUEST: "Bad request",
  CONFLICT: "Resource already exists",
} as const;
