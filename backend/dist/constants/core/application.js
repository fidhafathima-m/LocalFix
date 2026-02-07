"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_STEPS = exports.APPLICATION_STEPS = exports.APPLICATION_STATUS = void 0;
exports.APPLICATION_STATUS = {
    NOT_APPLIED: "not-applied",
    PENDING: "pending",
    SUBMITTED: "submitted",
    UNDER_REVIEW: "under_review",
    APPROVED: "approved",
    REJECTED: "rejected",
    DRAFT: "draft",
};
exports.APPLICATION_STEPS = {
    PERSONAL_INFORMATION: "Personal Information",
    IDENTITY_VERIFICATION: "Identity & Verification",
    SKILLS_SERVICES: "Skills & Services",
    AVAILABILITY_PREFERENCES: "Availability & Work Preferences",
    BANKING_DETAILS: "Banking Details",
    DOCUMENTS: "Documents",
    AGREEMENT_CONSENT: "Agreement & Consent",
    REVIEW_SUBMIT: "Review & Submit",
};
exports.REQUIRED_STEPS = [
    exports.APPLICATION_STEPS.PERSONAL_INFORMATION,
    exports.APPLICATION_STEPS.IDENTITY_VERIFICATION,
    exports.APPLICATION_STEPS.SKILLS_SERVICES,
    exports.APPLICATION_STEPS.AVAILABILITY_PREFERENCES,
    exports.APPLICATION_STEPS.BANKING_DETAILS,
    exports.APPLICATION_STEPS.DOCUMENTS,
    exports.APPLICATION_STEPS.AGREEMENT_CONSENT,
];
