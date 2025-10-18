export const TECHNICIAN_STATUS = {
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  DRAFT: "draft",
  PENDING: "pending",
  BLOCKED: "blocked"
} as const;

export const VERIFICATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  UNDER_REVIEW: "under_review",
} as const;

export const DOCUMENT_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  UNDER_REVIEW: "under_review",
} as const;

export const DOCUMENT_TYPES = {
  ID_PROOF: "idProof",
  ADDRESS_PROOF: "addressProof",
  POLICE_VERIFICATION: "policeVerification",
  TRADE_LICENSE: "tradeLicense",
  PASSPORT_PHOTO: "passportPhoto",
  PROFILE_PHOTO: "profilePhoto",
  GOVERNMENT_ID: "governmentId",
  BANK_PROOF: "bankProof",
  OTHER: "other",
} as const;