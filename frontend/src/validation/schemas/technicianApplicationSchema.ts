/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

// Common schemas
export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone number must be 10 digits");

export const emailSchema = z.string().email("Enter valid email");

export const dateSchema = z.string().min(1, "Date is required");

export const requiredString = z.string().min(1, "This field is required");

// In your validation file, update the fileSchema and requiredFileSchema

export const fileSchema = z
  .any()
  .refine((val) => {
    if (val === null || val === undefined || val === "") return true;
    
    // Handle File objects
    if (val instanceof File) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(val.type)) {
        throw new Error("File must be JPG, PNG, or PDF");
      }
      if (val.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }
      return true;
    }
    
    // Handle FileMetadata objects (restored from localStorage)
    if (val && typeof val === 'object' && val._isFile === true) {
      // File is already uploaded, no need to validate again
      return true;
    }
    
    // Handle string (file URL from backend)
    if (typeof val === 'string' && val.trim() !== '') {
      return true;
    }
    
    return false;
  }, "Invalid file format. Must be JPG, PNG, or PDF under 5MB")
  .optional();

export const requiredFileSchema = z.any().refine((val) => {
  if (!val) return false;
  
  // Handle File objects
  if (val instanceof File) {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(val.type)) {
      throw new Error("File must be JPG, PNG, or PDF");
    }
    if (val.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }
    return true;
  }
  
  // Handle FileMetadata objects (restored from localStorage)
  if (val && typeof val === 'object' && val._isFile === true) {
    return true; // File is already uploaded
  }
  
  // Handle string (file URL from backend)
  if (typeof val === 'string' && val.trim() !== '') {
    return true;
  }
  
  return false;
}, "This document is required and must be JPG, PNG, or PDF under 5MB");

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "PIN code is required"),
  landmark: z.string().optional(),
});

export const locationSchema = z.object({
  coordinates: z
    .array(z.number())
    .length(2, "Coordinates must have exactly 2 numbers"),
  formattedAddress: z.string().min(1, "Formatted address is required"),
});

// Availability schema
export const dayAvailabilitySchema = z.object({
  available: z.boolean(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
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

// Age validation
export const validateAge = (
  dateOfBirth: string,
  minAge: number = 18
): boolean => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  if (isNaN(birthDate.getTime())) return false;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= minAge;
};

// Date of birth schema with age validation
export const dateOfBirthSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine((dob) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) return false;

    const date = new Date(dob);
    return !isNaN(date.getTime());
  }, "Enter a valid date in YYYY-MM-DD format")
  .refine(
    (dob) => validateAge(dob, 18),
    "You must be at least 18 years old to register as a technician"
  );

// Step 1: Personal Information
export const personalInfoSchema = z.object({
  fullName: requiredString,
  phoneNumber: phoneSchema,
  email: emailSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: z.enum(["male", "female", "other"], {
    message: "Please select gender",
  }),
});

// Step 2: Identity & Verification - FIXED structure
export const identitySchema = z.object({
  idType: z.enum(["passport", "drivingLicense", "nationalId", "aadhaar"], {
    message: "Please select ID type",
  }),
  idNumber: requiredString,
  location: locationSchema,
});

export const addressFormSchema = z.object({
  "address.street": z.string().min(1, "Street address is required"),
  "address.city": z.string().min(1, "City is required"),
  "address.state": z.string().min(1, "State is required"),
  "address.pincode": z.string().min(1, "PIN code is required"),
  "address.landmark": z.string().optional(),
});

export const identityStepSchema = z.object({
  idType: z.enum(["passport", "drivingLicense", "nationalId", "aadhaar"], {
    message: "Please select ID type",
  }),
  idNumber: requiredString,

  location: locationSchema,

  "address.street": z.string().min(1, "Street address is required"),
  "address.city": z.string().min(1, "City is required"),
  "address.state": z.string().min(1, "State is required"),
  "address.pincode": z.string().min(1, "PIN code is required"),
  "address.landmark": z.string().optional(),
});

// Step 3: Skills & Services
export const skillsSchema = z.object({
  services: z.array(z.string()).min(1, "Select at least one service"),
  yearsOfExperience: requiredString,
  languages: z.array(z.string()).min(1, "Select at least one language"),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be less than 500 characters"),
});

// Step 4: Availability & Work Preferences
export const availabilityStepSchema = z.object({
  serviceAreas: z.array(z.string()).min(1, "Select at least one service area"),
  workRadius: requiredString,
  availability: availabilitySchema.refine(
    (avail) => Object.values(avail).some((day) => day.available),
    "Select at least one day of availability"
  ),
});

// Step 5: Banking Details
export const bankingSchema = z.object({
  accountHolderName: requiredString,
  accountNumber: z
    .string()
    .regex(/^\d{9,18}$/, "Account number must be 9 to 18 digits"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code"),
   bankName: z.string().min(1, "Bank name is required"),
  upiId: z.string().optional(),
});

//  Step 6: Documents - Proper file validation
export const documentsSchema = z.object({
  idProof: requiredFileSchema,
  addressProof: requiredFileSchema,
  policeVerification: fileSchema,
  tradeLicense: fileSchema,
  certifications: fileSchema,
  passportPhoto: requiredFileSchema,
});

// Step 7: Agreement & Consent
export const agreementSchema = z.object({
  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export const validateAvailability = (
  availability: any
): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(availability).forEach(([day, dayData]: [string, any]) => {
    if (dayData.available) {
      const startTime = new Date(`2000-01-01T${dayData.startTime}`);
      const endTime = new Date(`2000-01-01T${dayData.endTime}`);

      if (startTime >= endTime) {
        errors[`${day}Time`] = `End time must be after start time for ${day}`;
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (
        !timeRegex.test(dayData.startTime) ||
        !timeRegex.test(dayData.endTime)
      ) {
        errors[`${day}Format`] = `Invalid time format for ${day}`;
      }
    }
  });

  return errors;
};

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

export const validateStepSchema = <T>(
  schema: z.ZodSchema<T>,
  data: any
): { success: boolean; errors?: Record<string, string> } => {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: "Validation failed" } };
  }
};

export const technicianApplicationSchema = z.object({
  // Step 1
  ...personalInfoSchema.shape,
  // Step 2
  idType: identityStepSchema.shape.idType,
  idNumber: identityStepSchema.shape.idNumber,
  location: identityStepSchema.shape.location,
  "address.street": identityStepSchema.shape["address.street"],
  "address.city": identityStepSchema.shape["address.city"],
  "address.state": identityStepSchema.shape["address.state"],
  "address.pincode": identityStepSchema.shape["address.pincode"],
  "address.landmark": identityStepSchema.shape["address.landmark"],
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

export type TechnicianApplicationData = z.infer<
  typeof technicianApplicationSchema
>;

export const validateFileUpload = (
  file: File | null,
  fieldName: string
): string | null => {
  if (!file) {
    return `${fieldName} is required`;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return `${fieldName} must be a JPG, PNG, or PDF file`;
  }

  if (file.size > maxSize) {
    return `${fieldName} must be smaller than 5MB`;
  }

  return null;
};

export const validateDocumentsStep = (
  formData: any
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const requiredDocuments = [
    { field: "idProof", name: "ID Proof" },
    { field: "addressProof", name: "Address Proof" },
    { field: "passportPhoto", name: "Passport Photo" },
  ];

  requiredDocuments.forEach(({ field, name }) => {
    const file = formData[field];
    if (!file) {
      errors[field] = `${name} is required`;
    } else if (file instanceof File) {
      const fileError = validateFileUpload(file, name);
      if (fileError) {
        errors[field] = fileError;
      }
    }
  });

  const optionalDocuments = [
    { field: "policeVerification", name: "Police Verification" },
    { field: "tradeLicense", name: "Trade License" },
    { field: "certifications", name: "Certifications" },
  ];

  optionalDocuments.forEach(({ field, name }) => {
    const file = formData[field];
    if (file && file instanceof File) {
      const fileError = validateFileUpload(file, name);
      if (fileError) {
        errors[field] = fileError;
      }
    }
  });

  return errors;
};
