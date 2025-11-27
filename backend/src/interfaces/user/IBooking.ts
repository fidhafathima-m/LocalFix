import { Types } from 'mongoose';
import { ITechnician } from '../technician/ITechnician';
import { IBooking } from '../../models/BookingSchema';

export interface BookingHistoryItem {
  status: string;
  by: string;
  reason?: string;
  at: Date;
}

export interface BookingModel {
  bookingCode: string;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  serviceName: string;
  serviceId: Types.ObjectId;
  brand?: string;
  addressId: Types.ObjectId;
  scheduledAt: Date;
  timeSlot: string;
  amount: number;
  itemsAmount: number;
  totalAmount: number;
  notes?: string;
  status:
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'on_the_way'
    | 'completed'
    | 'cancelled'
    | 'rescheduled';
  history: BookingHistoryItem[];
}

export interface PaginatedBookings {
  bookings: IBooking[];
  total: number;
}

export interface StatusHistoryItem {
  status: string;
  reason?: string;
  timestamp: Date;
  description: string;
  updatedBy: 'user' | 'technician' | 'system';
}

export interface TechnicianLocationData {
  latitude: number;
  longitude: number;
  lastUpdated: Date;
}

// Type guard for populated technician
export const isTechnicianPopulated = (tech: any): tech is ITechnician => {
  return (
    tech && typeof tech === 'object' && '_id' in tech && 'displayName' in tech
  );
};

// Type guard for booking
export const isBooking = (booking: any): booking is IBooking => {
  return booking && typeof booking === 'object' && '_id' in booking;
};
