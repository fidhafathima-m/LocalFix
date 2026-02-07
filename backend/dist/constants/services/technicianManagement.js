"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAGINATION_DEFAULTS = exports.DocumentStatus = exports.APPLICATION_STATUS = exports.TechnicianStatus = exports.RATING_FILTER_MAPPING = exports.STATUS_FILTER_MAPPING = exports.EMAIL_CONFIG = exports.BANK_DETAILS_DEFAULTS = exports.SEARCH_FIELDS = exports.RATING_FILTERS = exports.FILTER_DEFAULTS = exports.STATUS_MAPPING = exports.VALID_STATUS_VALUES = exports.TECHNICIAN_MANAGEMENT_MESSAGES = void 0;
const technician_1 = require("../core/technician");
Object.defineProperty(exports, "TechnicianStatus", { enumerable: true, get: function () { return technician_1.TechnicianStatus; } });
Object.defineProperty(exports, "DocumentStatus", { enumerable: true, get: function () { return technician_1.DocumentStatus; } });
const application_1 = require("../core/application");
Object.defineProperty(exports, "APPLICATION_STATUS", { enumerable: true, get: function () { return application_1.APPLICATION_STATUS; } });
const common_1 = require("../core/common");
Object.defineProperty(exports, "PAGINATION_DEFAULTS", { enumerable: true, get: function () { return common_1.PAGINATION_DEFAULTS; } });
exports.TECHNICIAN_MANAGEMENT_MESSAGES = {
    // Success messages
    TECHNICIANS_RETRIEVED: 'Technicians retrieved successfully',
    TECHNICIAN_RETRIEVED: 'Technician retrieved successfully',
    TECHNICIAN_STATUS_UPDATED: 'Technician status updated successfully',
    TECHNICIAN_STATS_RETRIEVED: 'Technician statistics retrieved successfully',
    PENDING_APPLICATIONS_RETRIEVED: 'Pending applications retrieved successfully',
    APPLICATION_APPROVED: 'Application approved successfully',
    APPLICATION_REJECTED: 'Application rejected successfully',
    APPLICATION_RETRIEVED: 'Application retrieved successfully',
    APPLICATIONS_RETRIEVED: 'Applications retrieved successfully',
    APPLICATION_STATS_RETRIEVED: 'Application statistics retrieved successfully',
    TECHNICIAN_BY_APPLICATION_RETRIEVED: 'Technician retrieved successfully',
    // Email notification messages
    APPROVAL_EMAIL_SENT: ' and approval email sent to technician',
    REJECTION_EMAIL_SENT: ' and rejection email sent to applicant',
    STATUS_EMAIL_SENT: ' and status notification email sent to technician',
    EMAIL_SEND_FAILED: ' but failed to send email notification',
    // Error messages
    FAILED_FETCH_TECHNICIANS: 'Failed to fetch technicians',
    FAILED_FETCH_TECHNICIAN: 'Failed to fetch technician',
    FAILED_UPDATE_STATUS: 'Failed to update technician status',
    FAILED_FETCH_STATS: 'Failed to fetch technician statistics',
    FAILED_FETCH_APPLICATIONS: 'Failed to fetch pending applications',
    FAILED_APPROVE_APPLICATION: 'Failed to approve application',
    FAILED_REJECT_APPLICATION: 'Failed to reject application',
    FAILED_FETCH_APPLICATION: 'Failed to fetch application',
    FAILED_FETCH_APPLICATION_STATS: 'Failed to fetch application statistics',
    FAILED_FETCH_TECHNICIAN_BY_APP: 'Failed to fetch technician',
    // Validation messages
    TECHNICIAN_NOT_FOUND: 'Technician not found',
    APPLICATION_NOT_FOUND: 'Application not found',
    TECHNICIAN_NOT_FOUND_FOR_APPLICATION: 'Technician not found for this application',
    VALID_STATUS_REQUIRED: 'Valid status is required (approved, suspended, rejected)',
    UPDATE_APPLICATION_FAILED: 'Failed to update application',
    INVALID_TECHNICIAN_ID: 'Invalid technician ID',
    INVALID_APPLICATION_ID: 'Invalid application ID',
    REJECTION_REASON_REQUIRED: 'Rejection reason is required',
};
exports.VALID_STATUS_VALUES = [
    'approved',
    'suspended',
    'rejected',
];
exports.STATUS_MAPPING = {
    [technician_1.TechnicianStatus.SUBMITTED]: technician_1.TechnicianStatus.PENDING,
    [technician_1.TechnicianStatus.UNDER_REVIEW]: technician_1.TechnicianStatus.PENDING,
    [technician_1.TechnicianStatus.PENDING]: technician_1.TechnicianStatus.PENDING,
    [technician_1.TechnicianStatus.APPROVED]: technician_1.TechnicianStatus.APPROVED,
    [technician_1.TechnicianStatus.ACTIVE]: technician_1.TechnicianStatus.APPROVED,
    [technician_1.TechnicianStatus.REJECTED]: technician_1.TechnicianStatus.REJECTED,
    [technician_1.TechnicianStatus.SUSPENDED]: technician_1.TechnicianStatus.SUSPENDED,
    [technician_1.TechnicianStatus.BLOCKED]: technician_1.TechnicianStatus.SUSPENDED,
};
exports.FILTER_DEFAULTS = {
    PAGE: 1,
    LIMIT: 10,
    STATUS: 'all',
    SERVICE: 'All Services',
    RATING: 'All Ratings',
    LOCATION: 'All Locations',
    APPLICATION_STATUS: 'submitted,under_review',
};
exports.RATING_FILTERS = {
    '5_STAR': { $gte: 4.8 },
    '4_PLUS_STAR': { $gte: 4.0 },
    '3_PLUS_STAR': { $gte: 3.0 },
};
exports.SEARCH_FIELDS = {
    TECHNICIAN: ['displayName', 'user.email', 'user.phone', 'workAreas'],
    APPLICATION: ['personal.fullName', 'email', 'personal.phoneNumber'],
};
exports.BANK_DETAILS_DEFAULTS = {
    WITHDRAWAL_PREFERENCE: 'auto',
};
exports.EMAIL_CONFIG = {
    DEFAULT_NOTIFICATION: true,
    APPROVAL_TEMPLATE: 'application_approval',
    REJECTION_TEMPLATE: 'application_rejection',
    STATUS_UPDATE_TEMPLATE: 'status_update',
};
exports.STATUS_FILTER_MAPPING = {
    active: 'approved',
    pending: 'pending',
    suspended: 'suspended',
    rejected: 'rejected',
};
exports.RATING_FILTER_MAPPING = {
    '5 Star': exports.RATING_FILTERS['5_STAR'],
    '4+ Star': exports.RATING_FILTERS['4_PLUS_STAR'],
    '3+ Star': exports.RATING_FILTERS['3_PLUS_STAR'],
};
