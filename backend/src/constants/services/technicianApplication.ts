import { TECHNICIAN_STATUS, DOCUMENT_TYPES } from "../core/technician";
import {
  APPLICATION_STATUS,
  APPLICATION_STEPS,
  REQUIRED_STEPS,
} from "../core/application";

export const TECH_APPLICATION_MESSAGES = {
  // Success messages
  APPLICATION_STARTED: "Application started successfully",
  APPLICATION_SUBMITTED: "Application submitted successfully",
  APPLICATION_RESUBMITTED: "Application resubmitted successfully",
  APPLICATION_RETRIEVED: "Application retrieved successfully",
  APPLICATION_STATUS_RETRIEVED: "Application status retrieved successfully",
  USER_APPLICATIONS_RETRIEVED: "User applications retrieved successfully",
  STEP_SAVED: "Step saved successfully",
  NEW_APPLICATION_STARTED: "New application started successfully",

  // Info messages
  APPLICATION_ALREADY_SUBMITTED: "Application already submitted",
  APPLICATION_ALREADY_APPROVED: "Application already approved",
  DRAFT_APPLICATION_FOUND: "Draft application found",
  REJECTED_APPLICATION_FOUND:
    "Rejected application found - you can edit and resubmit",

  // Error messages
  APPLICATION_NOT_FOUND: "Application not found",
  USER_NOT_FOUND: "User not found",
  FAILED_TO_START_APPLICATION: "Failed to start application",
  FAILED_TO_SAVE_STEP: "Failed to save step",
  FAILED_TO_RETRIEVE_APPLICATION: "Failed to retrieve application",
  FAILED_TO_SUBMIT_APPLICATION: "Failed to submit application",
  FAILED_TO_GET_STATUS: "Failed to get application status",
  FAILED_TO_RETRIEVE_USER_APPLICATIONS: "Failed to retrieve user applications",
  FAILED_TO_RESUBMIT_APPLICATION: "Failed to resubmit application",
  FAILED_TO_START_NEW_APPLICATION: "Failed to start new application",

  // Validation messages
  EMAIL_AND_USER_ID_REQUIRED: "Email and User ID are required",
  VALID_EMAIL_REQUIRED: "Please provide a valid email address",
  APPLICATION_ID_AND_STEP_REQUIRED: "Application ID and step are required",
  EMAIL_ALREADY_IN_USE:
    "Email already has an application in progress by another user",
  ACCESS_DENIED: "Access denied - application does not belong to current user",
  APPLICATION_ALREADY_SUBMITTED_STATUS:
    "Application has already been submitted",
  COMPLETE_ALL_STEPS_REQUIRED: "Please complete all steps before submitting",
  ONLY_REJECTED_CAN_RESUBMIT: "Only rejected applications can be resubmitted",
  NO_TECHNICIAN_ASSIGNED: "Application has no technician assigned",
  NO_REJECTED_APPLICATION_FOUND: "No rejected application found",

  // Cloudinary upload errors
  CLOUDINARY_UPLOAD_FAILED: "Cloudinary upload failed - no secure_url returned",
  DOCUMENT_UPLOAD_FAILED: "Document upload failed",
} as const;

export const DOCUMENT_FIELDS = [
  "idProof",
  "addressProof",
  "policeVerification",
  "passportPhoto",
  "profilePhoto",
  "tradeLicense",
] as const;

export const STEP_MAPPING = {
  [APPLICATION_STEPS.PERSONAL_INFORMATION]: "personal",
  [APPLICATION_STEPS.IDENTITY_VERIFICATION]: "identity",
  [APPLICATION_STEPS.SKILLS_SERVICES]: "skills",
  [APPLICATION_STEPS.AVAILABILITY_PREFERENCES]: "availability",
  [APPLICATION_STEPS.BANKING_DETAILS]: "bank",
} as const;

export const REDIRECT_PATHS = {
  PENDING_DASHBOARD: "/pending-technician/dashboard",
  TECHNICIAN_DASHBOARD: "/technician/dashboard",
} as const;

export {
  TECHNICIAN_STATUS,
  APPLICATION_STATUS,
  DOCUMENT_TYPES,
  APPLICATION_STEPS,
  REQUIRED_STEPS,
};
