// repositories/booking/BookingRepository.ts
import TechnicianAvailabilitySchema from "../../models/technician/TechnicianAvailabilitySchema";
import { IBookingRepository } from "../../interfaces/repository/user/IBookingRepository";
import Booking, { IBooking } from "../../models/BookingSchema";
import { Types } from "mongoose";

export class BookingRepository implements IBookingRepository {
  async create(bookingData: Partial<IBooking>): Promise<IBooking> {
    const booking = new Booking(bookingData);
    return await booking.save();
  }

  async findById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId)
      .populate('userId', 'fullName email phone')
      .populate('technicianId', 'displayName profilePictureUrl services')
      .populate('addressId')
      .exec();
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ bookings: IBooking[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('technicianId', 'displayName profilePictureUrl')
        .exec(),
      Booking.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return { bookings, total };
  }

  async findByTechnicianId(technicianId: string, page: number = 1, limit: number = 10): Promise<{ bookings: IBooking[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      Booking.find({ technicianId: new Types.ObjectId(technicianId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName email phone')
        .exec(),
      Booking.countDocuments({ technicianId: new Types.ObjectId(technicianId) })
    ]);

    return { bookings, total };
  }

  async update(bookingId: string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      new Types.ObjectId(bookingId),
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async updateStatus(bookingId: string, status: string, updatedBy: string, reason?: string): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking) return null;

    // Add to history
    booking.history.push({
      status,
      by: updatedBy,
      reason,
      at: new Date(),
    });

    booking.status = status as any;
    return await booking.save();
  }

  async findByBookingCode(bookingCode: string): Promise<IBooking | null> {
    return await Booking.findOne({ bookingCode })
      .populate('userId', 'fullName email phone')
      .populate('technicianId', 'displayName profilePictureUrl services')
      .populate('addressId')
      .exec();
  }

  async checkTechnicianAvailability(technicianId: string, date: Date, timeSlot: string): Promise<boolean> {
    try {
      // Parse the time slot (e.g., "9:00 AM - 6:00 PM")
      const [requestedStartTime, requestedEndTime] = this.parseTimeSlot(timeSlot);
      
      if (!requestedStartTime || !requestedEndTime) {
        console.error('Invalid time slot format:', timeSlot);
        return false;
      }

      // Check if technician has availability for this date
      const availability = await TechnicianAvailabilitySchema.findOne({
        technicianId: new Types.ObjectId(technicianId),
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        }
      }).exec();

      if (!availability) {
        console.log('No availability found for technician on this date');
        return false;
      }

      // Check if the requested time slot is available
      const isSlotAvailable = availability.timeSlots.some(slot => {
        // Convert slot times to comparable format
        const slotStart = this.parseTimeToMinutes(slot.start);
        const slotEnd = this.parseTimeToMinutes(slot.end);
        
        return (
          slot.status === 'available' &&
          requestedStartTime >= slotStart &&
          requestedEndTime <= slotEnd
        );
      });

      if (!isSlotAvailable) {
        console.log('Requested time slot is not available in technician schedule');
        return false;
      }

      // Also check if there's no existing booking for this slot (prevent double booking)
      const existingBooking = await Booking.findOne({
        technicianId: new Types.ObjectId(technicianId),
        scheduledAt: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999))
        },
        timeSlot: timeSlot,
        status: { $in: ['pending', 'accepted', 'in_progress', 'on_the_way'] }
      }).exec();

      return !existingBooking;

    } catch (error) {
      console.error('Error checking technician availability:', error);
      return false;
    }
  }

  // Helper method to parse time slot string (e.g., "9:00 AM - 6:00 PM")
  private parseTimeSlot(timeSlot: string): [number, number] | [null, null] {
    try {
      const [startPart, endPart] = timeSlot.split(' - ');
      
      const startMinutes = this.parseTimeStringToMinutes(startPart.trim());
      const endMinutes = this.parseTimeStringToMinutes(endPart.trim());
      
      return [startMinutes, endMinutes];
    } catch (error) {
      console.error('Error parsing time slot:', error);
      return [null, null];
    }
  }

  // Helper method to parse time string to minutes since midnight
  private parseTimeStringToMinutes(timeStr: string): number {
    // Handle formats like "9:00 AM", "09:00 AM", "2:30 PM"
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    let [_, hours, minutes, period] = match;
    
    let hourNum = parseInt(hours);
    const minuteNum = parseInt(minutes);
    
    // Convert to 24-hour format
    if (period.toUpperCase() === 'PM' && hourNum !== 12) {
      hourNum += 12;
    } else if (period.toUpperCase() === 'AM' && hourNum === 12) {
      hourNum = 0;
    }
    
    return hourNum * 60 + minuteNum;
  }

  // Helper method for simple time format (HH:MM)
  private parseTimeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Add this method to get booking count for code generation
  async getBookingCount(): Promise<number> {
    return await Booking.countDocuments();
  }
}