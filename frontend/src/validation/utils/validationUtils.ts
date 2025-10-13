import { ZodError } from "zod";
import type { ValidationResult } from "../types/authTypes";

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

import type { ZodSchema } from "zod";

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

export function validateStepSchema<T>(
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

export function validateNestedFields(
  errors: Record<string, string>,
  prefix: string
): Record<string, string> {
  const nestedErrors: Record<string, string> = {};

  Object.entries(errors).forEach(([key, value]) => {
    if (key.startsWith(prefix)) {
      const fieldName = key.replace(`${prefix}.`, "");
      nestedErrors[fieldName] = value;
    }
  });

  return nestedErrors;
}

type AvailabilityDay = {
  available: boolean;
  startTime?: string;
  endTime?: string;
};

type Availability = Record<string, AvailabilityDay>;

export function validateAvailability(
  availability: Availability
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.entries(availability).forEach(([day, dayData]) => {
    if (dayData.available) {
      if (!dayData.startTime) {
        errors[`startTime-${day}`] = `Start time required for ${day}`;
      }
      if (!dayData.endTime) {
        errors[`endTime-${day}`] = `End time required for ${day}`;
      }
      if (
        dayData.startTime &&
        dayData.endTime &&
        dayData.startTime >= dayData.endTime
      ) {
        errors[`time-${day}`] = `End time must be after start time for ${day}`;
      }
    }
  });

  return errors;
}
