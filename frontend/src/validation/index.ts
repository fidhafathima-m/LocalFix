export * from "./schemas/authSchema";
export { technicianApplicationSchema } from "./schemas/technicianApplicationSchema";
export * from "./types/authTypes";
export * from "./utils/validationUtils";

export type { UserType, OTPContext } from "./types/authTypes";

export type { 
  BookingFormData, 
  PersonalDetailsData, 
  ServiceSelectionData,
  ScheduleData,
  AddressSelectionData,
  BookingStep 
} from "./schemas/bookingSchema";
