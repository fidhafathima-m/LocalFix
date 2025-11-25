import { TechnicianStatus, DocumentStatus } from '../core/technician';
import { APPLICATION_STATUS } from '../core/application';
import { PAGINATION_DEFAULTS } from '../core/common';

export const TECHNICIAN_MANAGEMENT_MESSAGES = {
  // Success messages
  TECHNICIANS_RETRIEVED: 'Technicians retrieved successfully',
  TECHNICIAN_RETRIEVED: 'Technician retrieved successfully',
  TECHNICIAN_STATUS_UPDATED: 'Technician status updated successfully',
  TECHNICIAN_STATS_RETRIEVED: 'Technician statistics retrieved successfully',
  PENDING_APPLICATIONS_RETRIEVED: 'Pending applications retrieved successfully',
  APPLICATION_APPROVED: 'Application approved successfully',
  APPLICATION_REJECTED: 'Application rejected successfully',
  APPLICATION_RETRIEVED: 'Application retrieved successfully',
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
  TECHNICIAN_NOT_FOUND_FOR_APPLICATION:
    'Technician not found for this application',
  VALID_STATUS_REQUIRED:
    'Valid status is required (approved, suspended, rejected)',
  UPDATE_APPLICATION_FAILED: 'Failed to update application',
  INVALID_TECHNICIAN_ID: 'Invalid technician ID',
  INVALID_APPLICATION_ID: 'Invalid application ID',
  REJECTION_REASON_REQUIRED: 'Rejection reason is required',
} as const;

export const VALID_STATUS_VALUES = [
  'approved',
  'suspended',
  'rejected',
] as const;

export const STATUS_MAPPING = {
  [TechnicianStatus.SUBMITTED]: TechnicianStatus.PENDING,
  [TechnicianStatus.UNDER_REVIEW]: TechnicianStatus.PENDING,
  [TechnicianStatus.PENDING]: TechnicianStatus.PENDING,
  [TechnicianStatus.APPROVED]: TechnicianStatus.APPROVED,
  [TechnicianStatus.ACTIVE]: TechnicianStatus.APPROVED,
  [TechnicianStatus.REJECTED]: TechnicianStatus.REJECTED,
  [TechnicianStatus.SUSPENDED]: TechnicianStatus.SUSPENDED,
  [TechnicianStatus.BLOCKED]: TechnicianStatus.SUSPENDED,
} as const;

export const FILTER_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  STATUS: 'all',
  SERVICE: 'All Services',
  RATING: 'All Ratings',
  LOCATION: 'All Locations',
  APPLICATION_STATUS: 'submitted,under_review',
} as const;

export const RATING_FILTERS = {
  '5_STAR': { $gte: 4.8 },
  '4_PLUS_STAR': { $gte: 4.0 },
  '3_PLUS_STAR': { $gte: 3.0 },
} as const;

export const SEARCH_FIELDS = {
  TECHNICIAN: ['displayName', 'user.email', 'user.phone', 'workAreas'] as const,
  APPLICATION: ['personal.fullName', 'email', 'personal.phoneNumber'] as const,
} as const;

export const BANK_DETAILS_DEFAULTS = {
  WITHDRAWAL_PREFERENCE: 'auto',
} as const;

export const EMAIL_CONFIG = {
  DEFAULT_NOTIFICATION: true,
  APPROVAL_TEMPLATE: 'application_approval',
  REJECTION_TEMPLATE: 'application_rejection',
  STATUS_UPDATE_TEMPLATE: 'status_update',
} as const;

export const STATUS_FILTER_MAPPING: Record<string, string> = {
  active: 'approved',
  pending: 'pending',
  suspended: 'suspended',
  rejected: 'rejected',
} as const;

export const RATING_FILTER_MAPPING = {
  '5 Star': RATING_FILTERS['5_STAR'],
  '4+ Star': RATING_FILTERS['4_PLUS_STAR'],
  '3+ Star': RATING_FILTERS['3_PLUS_STAR'],
} as const;

export {
  TechnicianStatus,
  APPLICATION_STATUS,
  DocumentStatus,
  PAGINATION_DEFAULTS,
};
