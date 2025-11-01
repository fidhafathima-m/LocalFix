export const TECHNICIAN_ROUTES = {
  // Profile routes
  PROFILE: {
    BASE: "/technician/profile",
    UPLOAD_PHOTO: "/technician/profile/upload-photo",
    PERSONAL_INFO: "/technician/profile/personal-info",
    IDENTITY_VERIFICATION: "/technician/profile/identity-verification",
    UPLOAD_DOCUMENT: "/technician/profile/upload-document",
    SKILLS_SERVICES: "/technician/profile/skills-services",
    AVAILABILITY: "/technician/profile/availability",
    BANK_PAYMENT: "/technician/profile/bank-payment",
    UPDATE_PASSWORD: '/technician/profile/password',
    // Add these new routes without technicianId parameter
    SLOT_RULES: "/technician/profile/slot-rules",
    TECHNICIAN_AVAILABILITY: "/technician/profile/technician-availability"
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
    EDIT: (applicationId: string) => 
      `/technician-application/${applicationId}/edit`
  },
} as const;