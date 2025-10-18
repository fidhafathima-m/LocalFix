import { TECHNICIAN_STATUS } from "../core/technician";

export const DASHBOARD_MESSAGES = {
 // Success messages
  DASHBOARD_OVERVIEW_RETRIEVED: "Dashboard overview retrieved successfully",
  TECHNICIAN_PROFILE_RETRIEVED: "Technician profile retrieved successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  STATS_RETRIEVED: "Dashboard statistics retrieved successfully",

  // Error messages
  TECHNICIAN_NOT_FOUND: "Technician not found",
  TECHNICIAN_PROFILE_NOT_FOUND: "Technician profile not found",
  FAILED_FETCH_OVERVIEW: "Failed to fetch dashboard overview",
  FAILED_FETCH_PROFILE: "Failed to fetch technician profile",
  FAILED_UPDATE_PROFILE: "Failed to update technician profile",
  FAILED_FETCH_STATS: "Failed to fetch dashboard statistics",

  // Validation messages
  USER_ID_REQUIRED: "User ID is required",
  INVALID_TECHNICIAN_ID: "Invalid technician ID",
  PROFILE_DATA_REQUIRED: "Profile data is required",
} as const;

export const DASHBOARD_DEFAULTS = {
  AVERAGE_RATING: 0,
  RATING_COUNT: 0,
  EXPERIENCE_YEARS: 0,
  UPCOMING_BOOKINGS: 0,
  MONTHLY_EARNINGS: 0,
  TOTAL_JOBS: 0,
} as const;
export const PERSONAL_INFO_DEFAULTS = {
  FULL_NAME: "Not specified",
  GENDER: "Not specified",
  PHONE_NUMBER: "Not provided",
  DATE_OF_BIRTH: "Not specified",
  BIO: "",
  PROFILE_PICTURE_URL: "",
  ADDRESS: {
    STREET: "Not specified",
    CITY: "Not specified",
    STATE: "Not specified",
    PINCODE: "Not specified",
  },
  LANGUAGES: [] as string[],
} as const;

export const LANGUAGE_FORMAT_OPTIONS = {
  DELIMITERS: {
    COMMA: ",",
    SEMICOLON: ";",
  },
  MAX_LANGUAGES: 10,
} as const;

// Re-export
export { TECHNICIAN_STATUS };