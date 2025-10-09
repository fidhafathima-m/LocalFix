import { z } from 'zod';

// Common schemas
export const phoneSchema = z.string()
  .regex(/^\d{10}$/, 'Phone number must be 10 digits');

export const emailSchema = z.string()
  .email('Enter valid email');

export const dateSchema = z.string()
  .min(1, 'Date is required');

export const requiredString = z.string().min(1, 'This field is required');

export const fileSchema = z.instanceof(File)
  .optional()
  .or(z.null());

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'PIN code is required'),
  landmark: z.string().optional(),
});

// Availability schema
export const dayAvailabilitySchema = z.object({
  available: z.boolean(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

export const availabilitySchema = z.object({
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
});

// Step 1: Personal Information
// Age validation utility function
export const validateAge = (dateOfBirth: string, minAge: number = 18): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minAge;
};

// Date of birth schema with age validation
export const dateOfBirthSchema = z.string()
  .min(1, 'Date of birth is required')
  .refine((dob) => {
    // Basic date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) return false;
    
    // Check if it's a valid date
    const date = new Date(dob);
    return !isNaN(date.getTime());
  }, 'Enter a valid date in YYYY-MM-DD format')
  .refine((dob) => {
    return validateAge(dob, 18);
  }, 'You must be at least 18 years old to register as a technician');

// Step 1: Personal Information (updated with age validation)
export const personalInfoSchema = z.object({
  fullName: requiredString,
  phoneNumber: phoneSchema,
  email: emailSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Please select gender'
  }),
});

// Step 2: Identity & Verification
export const identitySchema = z.object({
  idType: z.enum(['passport', 'drivingLicense', 'nationalId', 'aadhaar'], {
    message: 'Please select ID type'
  }),
  idNumber: requiredString,
});

export const addressFormSchema = z.object({
  'address.street': z.string().min(1, 'Street address is required'),
  'address.city': z.string().min(1, 'City is required'),
  'address.state': z.string().min(1, 'State is required'),
  'address.pincode': z.string().min(1, 'PIN code is required'),
  'address.landmark': z.string().optional(),
});

// Step 3: Skills & Services
export const skillsSchema = z.object({
  services: z.array(z.string()).min(1, 'Select at least one service'),
  yearsOfExperience: requiredString,
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  bio: z.string().min(10, 'Bio must be at least 10 characters')
    .max(500, 'Bio must be less than 500 characters'),
});

// Step 4: Availability & Work Preferences
export const availabilityStepSchema = z.object({
  serviceAreas: z.array(z.string()).min(1, 'Select at least one service area'),
  workRadius: requiredString,
  availability: availabilitySchema.refine(
    (avail) => Object.values(avail).some(day => day.available),
    'Select at least one day of availability'
  ),
});

// Step 5: Banking Details
export const bankingSchema = z.object({
  accountHolderName: requiredString,
  accountNumber: z.string()
    .regex(/^\d{9,18}$/, `Account number must be 9 to 18 digits`),
  ifscCode: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter valid IFSC code'),
  upiId: z.string().optional(),
});


// Step 6: Documents
export const documentsSchema = z.object({
  idProof: z.instanceof(File, { message: 'ID proof is required' }),
  addressProof: z.instanceof(File, { message: 'Address proof is required' }),
  policeVerification: fileSchema,
  tradeLicense: fileSchema,
  certifications: fileSchema,
  passportPhoto: z.instanceof(File, { message: 'Passport photo is required' }),
});

// Step 7: Agreement & Consent
export const agreementSchema = z.object({
  agreement: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
});

export const identityStepSchema = z.object({
  ...identitySchema.shape,
  ...addressFormSchema.shape,
});

// Complete application schema
export const technicianApplicationSchema = z.object({
  // Step 1
  ...personalInfoSchema.shape,
  // Step 2
  ...identitySchema.shape,
  // Step 3
  ...skillsSchema.shape,
  // Step 4
  ...availabilityStepSchema.shape,
  // Step 5
  ...bankingSchema.shape,
  // Step 6
  ...documentsSchema.shape,
  // Step 7
  ...agreementSchema.shape,
});

// Step-specific schemas for validation
export const stepSchemas = {
  1: personalInfoSchema,
  2: identityStepSchema,
  3: skillsSchema,
  4: availabilityStepSchema,
  5: bankingSchema,
  6: documentsSchema,
  7: agreementSchema,
};

// Type exports
export type PersonalInfoData = z.infer<typeof personalInfoSchema>;
export type IdentityData = z.infer<typeof identityStepSchema>;
export type SkillsData = z.infer<typeof skillsSchema>;
export type AvailabilityData = z.infer<typeof availabilityStepSchema>;
export type BankingData = z.infer<typeof bankingSchema>;
export type DocumentsData = z.infer<typeof documentsSchema>;
export type AgreementData = z.infer<typeof agreementSchema>;
export type TechnicianApplicationData = z.infer<typeof technicianApplicationSchema>;