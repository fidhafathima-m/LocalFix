import {
  TECHNICIAN_STATUS,
  VERIFICATION_STATUS,
  DOCUMENT_STATUS,
  DOCUMENT_TYPES,
} from "../core/technician";

export const TECHNICIAN_PROFILE_MESSAGES = {
  // Success messages
  PROFILE_RETRIEVED: "Profile data retrieved successfully",
  PERSONAL_INFO_UPDATED: "Personal information updated successfully",
  IDENTITY_VERIFICATION_UPDATED: "Identity verification updated successfully",
  SKILLS_SERVICES_UPDATED: "Skills and services updated successfully",
  AVAILABILITY_UPDATED: "Availability preferences updated successfully",
  BANK_PAYMENT_UPDATED: "Bank and payment details updated successfully",
  PASSWORD_UPDATED: "Password updated successfully",
  DOCUMENT_UPLOADED: "Document uploaded successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PHOTO_UPLOADED: "Profile photo updated successfully",

  // Error messages
  TECHNICIAN_NOT_FOUND: "Technician not found",
  TECHNICIAN_PROFILE_NOT_FOUND: "Technician profile not found",
  USER_NOT_FOUND: "User not found",
  FAILED_FETCH_PROFILE: "Failed to fetch profile data",
  FAILED_UPDATE_PERSONAL_INFO: "Failed to update personal information",
  FAILED_UPDATE_IDENTITY_VERIFICATION: "Failed to update identity verification",
  FAILED_UPDATE_SKILLS_SERVICES: "Failed to update skills and services",
  FAILED_UPDATE_AVAILABILITY: "Failed to update availability preferences",
  FAILED_UPDATE_BANK_PAYMENT: "Failed to update bank and payment details",
  FAILED_UPDATE_PASSWORD: "Failed to update password",
  FAILED_UPLOAD_DOCUMENT: "Failed to upload document",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  FAILED_UPLOAD_PHOTO: "Failed to upload profile photo",
   PHOTO_REQUIRED: "Profile photo is required",
  INVALID_FILE_TYPE: "Invalid file type. Only images are allowed",
  FILE_TOO_LARGE: "File size too large. Maximum size is 5MB",

  // Validation messages
  CURRENT_PASSWORD_INCORRECT: "Current password is incorrect",
  PASSWORDS_DO_NOT_MATCH: "New password and confirm password do not match",
  INVALID_TECHNICIAN_ID: "Invalid technician ID",
  DOCUMENT_TYPE_REQUIRED: "Document type is required",
  FILE_URL_REQUIRED: "File URL is required",
  FILE_NAME_REQUIRED: "File name is required",
} as const;

export const AVAILABILITY_DEFAULTS = {
  IS_AVAILABLE: true,
  WORK_RADIUS: 10,
  START_TIME: "09:00",
  END_TIME: "19:00",
  DAYS_OFF: ["sunday"],
} as const;

export const WEEKLY_AVAILABILITY_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const PAYMENT_DEFAULTS = {
  WITHDRAWAL_PREFERENCE: "auto",
  BANK_ACCOUNT: {
    HOLDER_NAME: "",
    ACCOUNT_NUMBER: "",
    IFSC_CODE: "",
    BANK_NAME: "",
  },
  UPI_ID: "",
} as const;

export const PROFILE_SECTIONS = {
  PERSONAL_INFORMATION: "personalInformation",
  IDENTITY_VERIFICATION: "identityVerification",
  SKILLS_SERVICES: "skillsServices",
  AVAILABILITY_PREFERENCES: "availabilityPreferences",
  BANK_PAYMENT_DETAILS: "bankPaymentDetails",
  DOCUMENTS: "documents",
  SECURITY_SETTINGS: "securitySettings",
} as const;

export const PROFILE_FIELD_MAPPINGS = {
  // Personal Information
  fullName: "personalInfo.fullName",
  phoneNumber: "personalInfo.phoneNumber",
  dateOfBirth: "personalInfo.dateOfBirth",
  gender: "personalInfo.gender",
  languages: "personalInfo.languages",
  bio: "bio",
  profilePicture: "profilePictureUrl",
  email: "user.email",

  // Identity Verification
  governmentIdType: "identityVerification.governmentIdType",
  governmentIdNumber: "identityVerification.governmentIdNumber",
  idDocument: "identityVerification.idDocument",

  // Skills & Services
  services: "services",
  experienceYears: "experienceYears",
  basePrices: "basePrices",

  // Availability Preferences
  isAvailable: "availability.isAvailable",
  serviceAreas: "workAreas",
  workRadius: "serviceRadiusKm",
  weeklyAvailability: "availability.weeklyAvailability",

  // Bank & Payment Details
  accountHolderName: "paymentDetails.bankAccount.holderName",
  accountNumber: "paymentDetails.bankAccount.accountNumber",
  ifscCode: "paymentDetails.bankAccount.ifscCode",
  upiId: "paymentDetails.upiId",
  withdrawalPreference: "paymentDetails.withdrawalPreference",
} as const;

export const SKILLS_DEFAULTS = {
  SERVICES: [] as string[],
  EXPERIENCE_YEARS: 0,
  BASE_PRICES: {} as Record<string, number>,
} as const;

export const SECURITY_SETTINGS_DEFAULTS = {
  LAST_LOGIN: null,
  LOGIN_DEVICE: null,
} as const;

export {
  TECHNICIAN_STATUS,
  VERIFICATION_STATUS,
  DOCUMENT_STATUS,
  DOCUMENT_TYPES,
};
