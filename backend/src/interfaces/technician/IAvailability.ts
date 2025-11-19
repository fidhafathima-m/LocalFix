// interfaces/availabilityInterfaces.ts
import { Types } from 'mongoose';
import { ITimeSlot } from '../../models/technician/SlotRuleSchema';

export interface WeeklyPatternDay {
  available: boolean;
  startTime: string;
  endTime: string;
}

export interface WeeklyPattern {
  [day: string]: WeeklyPatternDay;
}

export interface ApplicationAvailability {
  weeklyPattern?: WeeklyPattern;
  availability?: {
    weeklyPattern: WeeklyPattern;
  };
}

export interface AvailabilityDayConfig {
  day: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityConfig {
  availableDays: AvailabilityDayConfig[];
  slotDuration: number;
}

export interface TimePattern {
  days: string[];
  startTime: string;
  endTime: string;
}

export interface SlotRuleData {
  technicianId: Types.ObjectId;
  name: string;
  rruleString: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  bookingBufferBeforeMinutes: number;
  bookingBufferAfterMinutes: number;
  maxBookingsPerSlot: number;
  effectiveFrom: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedSlot {
  start: Date;
  end: Date;
  status: 'available' | 'booked' | 'blocked';
  maxBookings: number;
  currentBookings: number;
}

export interface DayAvailability {
  date: Date;
  slots: ITimeSlot[];
}

// Use number instead of RRule.Weekday in the interface
export interface DayMap {
  [key: string]: number;
}
