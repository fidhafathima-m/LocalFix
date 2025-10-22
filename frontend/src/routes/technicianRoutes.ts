export const TECHNICIAN_ROUTES = {

  // Profile routes
  PROFILE: {
    BASE: "/technician/profile",
    UPLOAD_PHOTO: "/technician/profile/upload-photo",
    PERSONAL_INFO: "/technician/profile/personal-info",
    IDENTITY_VERIFICATION: "/technician/profile/identity-verification",
    DOCUMENTS: "/technician/profile/documents",
    SKILLS_SERVICES: "/technician/profile/skills-services",
    AVAILABILITY: "/technician/profile/availability",
    BANK_PAYMENT: "/technician/profile/bank-payment",
  },
  
  // Address routes
  ADDRESS: "/technician/address",

  // Application routes
  APPLICATION: {
    BASE: "/technician-application",
    BY_ID: (applicationId: string) =>
      `/technician-application/${applicationId}`,
    USER_APPLICATIONS: "/technician-application/user/applications",
    START: "/technician-application/start",
    SAVE_STEP: "/technician-application/save-step",
    SUBMIT: "/technician-application/submit",
    RESUBMIT: (applicationId: string) =>
      `/technician-application/${applicationId}/resubmit`,
    START_NEW_AFTER_REJECTION:
      "/technician-application/start-new-after-rejection",
  },
} as const;
