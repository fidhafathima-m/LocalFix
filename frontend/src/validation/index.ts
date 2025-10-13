export * from './schemas/authSchema';
// Explicitly re-export only non-conflicting members from technicianApplicationSchema
export {
  technicianApplicationSchema,
  // If you need to re-export emailSchema or phoneSchema from this file, give them unique names:
  // emailSchema as technicianEmailSchema,
  // phoneSchema as technicianPhoneSchema,
} from './schemas/technicianApplicationSchema';
export * from './types/authTypes';
export * from './utils/validationUtils';

// Re-export commonly used types
export type { UserType, OTPContext } from './types/authTypes';