export interface ValidationError {
  path: (string | number)[];
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export interface BookingValidationState {
  personalDetails: Record<string, string>;
  serviceDetails: Record<string, string>;
  schedule: Record<string, string>;
  address: Record<string, string>;
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface DailyAvailability {
  date: Date;
  formattedDate: string;
  dayName: string;
  slots: TimeSlot[];
  isToday: boolean;
}

export interface AvailabilityValidationResult {
  isValid: boolean;
  error?: string;
  availableSlots?: string[];
}