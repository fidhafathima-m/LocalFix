/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodError } from "zod";
import type { ValidationResult, AvailabilityValidationResult } from "../types/bookingTypes";
import type { ZodSchema } from "zod";
import { 
  scheduleSchema, 
  serviceSelectionSchema, 
  addressSelectionSchema,
  personalDetailsSchema,
  type BookingStep 
} from "../schemas/bookingSchema";

export function formatZodError(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path[0] as string;
    if (path) {
      errors[path] = err.message;
    }
  });

  return errors;
}

export function validateSchema<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodError(error),
      };
    }
    return {
      success: false,
      errors: { general: "Validation failed" },
    };
  }
}

export function validateBookingStep(
  step: BookingStep,
  data: unknown
): ValidationResult<any> {
  switch (step) {
    case "personal-details":
      return validateSchema(personalDetailsSchema, data);
    case "service-details":
      return validateSchema(serviceSelectionSchema, data);
    case "schedule":
      return validateSchema(scheduleSchema, data);
    case "address":
      return validateSchema(addressSelectionSchema, data);
    default:
      return { success: false, errors: { general: "Invalid validation step" } };
  }
}

export function validateAvailability(
  selectedDate: string,
  selectedTime: string,
  weeklyAvailability: any[]
): AvailabilityValidationResult {
  if (!selectedDate || !selectedTime) {
    return {
      isValid: false,
      error: "Please select both date and time"
    };
  }

  const selectedDay = weeklyAvailability.find(
    (day) => day.formattedDate === selectedDate
  );

  if (!selectedDay || selectedDay.slots.length === 0) {
    return {
      isValid: false,
      error: "Technician is not available on the selected date"
    };
  }

  // Check if selected time is available
  const availableSlots = getAvailableTimeSlotsForDate(selectedDate, weeklyAvailability);
  const isTimeAvailable = availableSlots.includes(selectedTime);

  if (!isTimeAvailable) {
    return {
      isValid: false,
      error: "Selected time slot is not available"
    };
  }

  return {
    isValid: true,
    availableSlots
  };
}

export function getAvailableTimeSlotsForDate(
  date: string, 
  weeklyAvailability: any[]
): string[] {
  const dayForDate = weeklyAvailability.find(
    (day) => day.formattedDate === date
  );

  if (!dayForDate) return [];

  const now = new Date();
  const isToday = date === now.toISOString().split("T")[0];

  if (!isToday) {
    return dayForDate.slots.map((slot: any) => formatTimeRange(slot));
  }

  // For today, filter out past time slots
  const currentTime = now.getHours() * 60 + now.getMinutes();

  return dayForDate.slots
    .filter((slot: any) => {
      const [slotHour, slotMinute] = slot.start.split(":").map(Number);
      const slotTime = slotHour * 60 + slotMinute;
      return slotTime > currentTime;
    })
    .map((slot: any) => formatTimeRange(slot));
}

export function formatTimeRange(range: { start: string; end: string }): string {
  const formatTimeTo12Hour = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return `${formatTimeTo12Hour(range.start)} - ${formatTimeTo12Hour(range.end)}`;
}

export function validatePhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(phone);
}

export function validateProblemDescription(description: string): {
  isValid: boolean;
  error?: string;
} {
  if (!description.trim()) {
    return { isValid: false, error: "Problem description is required" };
  }

  if (description.trim().length < 10) {
    return { 
      isValid: false, 
      error: "Problem description must be at least 10 characters" 
    };
  }

  if (description.trim().length > 500) {
    return { 
      isValid: false, 
      error: "Problem description must be less than 500 characters" 
    };
  }

  return { isValid: true };
}

export function getAvailableDaysSummary(weeklyAvailability: any[]): string {
  const availableDays = weeklyAvailability.filter(
    (day) => day.slots.length > 0
  );
  if (availableDays.length === 0) return "No available days";

  const dayNames = availableDays.map((day) => day.dayName);
  const uniqueDays = [...new Set(dayNames)];

  const capitalizedDays = uniqueDays.map(
    (day) => day.charAt(0).toUpperCase() + day.slice(1)
  );

  return `Available on ${capitalizedDays.join(", ")}`;
}