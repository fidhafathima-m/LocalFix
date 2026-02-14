import { IBooking } from '../../../models/BookingSchema';
import { ITechnicianAvailability } from '../../../models/technician/TechnicianAvailabilitySchema';

export interface IBookingRepository {
  create(bookingData: Partial<IBooking>): Promise<IBooking>;
  findById(bookingId: string): Promise<IBooking | null>;
  findByUserId(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<{ bookings: IBooking[]; total: number }>;
  findByTechnicianId(
    technicianId: string,
    page?: number,
    limit?: number
  ): Promise<{ bookings: IBooking[]; total: number }>;
  update(
    bookingId: string,
    updateData: Partial<IBooking>
  ): Promise<IBooking | null>;
  updateStatus(
    bookingId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<IBooking | null>;
  findByBookingCode(bookingCode: string): Promise<IBooking | null>;
  checkTechnicianAvailability(
    technicianId: string,
    date: Date,
    timeSlot: string
  ): Promise<boolean>;
  getBookingCount(): Promise<number>;
  getTechnicianDetails(technicianId: string): Promise<any>;
  getAddressDetails(addressId: string): Promise<any>;
  getTechnicianLocation(technicianId: string): Promise<{
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  } | null>;
  findByTechnicianAndTimeSlot(
    technicianId: string,
    date: Date,
    timeSlot: string
  ): Promise<IBooking[]>;

  getTechnicianAvailability(
    technicianId: string,
    date: Date
  ): Promise<ITechnicianAvailability | null>;
  findByTechnicianAndDate(
    technicianId: string,
    date: Date
  ): Promise<IBooking[]>;
}
