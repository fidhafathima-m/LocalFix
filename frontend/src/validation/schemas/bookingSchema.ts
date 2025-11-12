import { z } from "zod";

// Common schemas
export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Enter valid 10-digit phone number");

export const emailSchema = z
  .string()
  .email("Enter valid email")
  .optional()
  .or(z.literal(""));

// Address schemas
export const addressSchema = z.object({
  label: z.string().min(1, "Address label is required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
  landmark: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// Booking specific schemas
export const serviceSelectionSchema = z.object({
  selectedService: z.string().min(1, "Please select a service type"),
  selectedBrand: z.string().min(1, "Please select a brand"),
  problemDescription: z
    .string()
    .min(10, "Problem description must be at least 10 characters")
    .max(500, "Problem description too long"),
});

export const scheduleSchema = z.object({
  selectedDate: z.string().min(1, "Please select a date"),
  selectedTime: z.string().min(1, "Please select a time slot"),
});

export const addressSelectionSchema = z.object({
  usesSavedAddress: z.boolean(),
  selectedAddress: z.string().optional(),
}).refine((data) => {
  if (data.usesSavedAddress) {
    return !!data.selectedAddress;
  }
  return true;
}, {
  message: "Please select an address",
  path: ["selectedAddress"],
});

export const personalDetailsSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: phoneSchema,
  email: emailSchema,
});

// Main booking schema
export const bookingSchema = z.object({
  // Personal details
  personalDetails: personalDetailsSchema,
  
  // Service details
  serviceDetails: serviceSelectionSchema,
  
  // Schedule
  schedule: scheduleSchema,
  
  // Address
  address: addressSelectionSchema,
});

// Partial schemas for step-by-step validation
export const bookingStep1Schema = personalDetailsSchema;
export const bookingStep2Schema = serviceSelectionSchema;
export const bookingStep3Schema = scheduleSchema;
export const bookingStep4Schema = addressSelectionSchema;

// Export types
export type AddressFormData = z.infer<typeof addressSchema>;
export type PersonalDetailsData = z.infer<typeof personalDetailsSchema>;
export type ServiceSelectionData = z.infer<typeof serviceSelectionSchema>;
export type ScheduleData = z.infer<typeof scheduleSchema>;
export type AddressSelectionData = z.infer<typeof addressSelectionSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;

export type BookingStep = 
  | "personal-details" 
  | "service-details" 
  | "schedule" 
  | "address" 
  | "review";