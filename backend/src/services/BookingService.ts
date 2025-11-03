// services/booking/BookingService.ts
import { IBookingService } from "../interfaces/services/user/IBookingService";
import { IBookingRepository } from "../interfaces/repository/user/IBookingRepository";
import { ResponseHelper, ApiResponse } from "../utils/responseHelper";
import { LoggerService } from "../services/LoggerService";
import {
  CreateBookingRequestDto,
  BookingResponseDto,
  BookingListResponseDto,
} from "../interfaces/dtos/bookingDtos";
import { Types } from "mongoose";

export class BookingService implements IBookingService {
  private logger: LoggerService;

  constructor(private bookingRepository: IBookingRepository) {
    this.logger = new LoggerService();
  }

  // services/booking/BookingService.ts - Update createBooking method
async createBooking(userId: string, bookingData: CreateBookingRequestDto): Promise<ApiResponse<BookingResponseDto>> {
  const context = {
    operation: "createBooking",
    data: { userId, ...bookingData },
  };

  try {
    this.logger.info("Creating new booking", context);

    // Validate required fields
    if (!bookingData.technicianId || !bookingData.serviceName || !bookingData.addressId || !bookingData.scheduledAt || !bookingData.timeSlot) {
      this.logger.warn("Missing required booking fields", context);
      return ResponseHelper.badRequest("Please fill in all required booking fields");
    }

    // REMOVED: Availability check since it's already done in the frontend
    // The booking page already validates technician availability using slot rules

    // Generate booking code
    const bookingCount = await this.bookingRepository.getBookingCount();
    const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`;

    // Calculate amounts
    const baseAmount = bookingData.amount || 0;
    const itemsAmount = 0;
    const totalAmount = baseAmount + itemsAmount;

    const bookingModel = {
      bookingCode: bookingCode,
      userId: new Types.ObjectId(userId),
      technicianId: new Types.ObjectId(bookingData.technicianId),
      serviceName: bookingData.serviceName,
      brand: bookingData.brand,
      addressId: new Types.ObjectId(bookingData.addressId),
      scheduledAt: new Date(bookingData.scheduledAt),
      timeSlot: bookingData.timeSlot,
      amount: baseAmount,
      itemsAmount: itemsAmount,
      totalAmount: totalAmount,
      notes: bookingData.notes || '', // Make sure notes are included
      status: 'pending' as const,
      history: [{
        status: 'pending',
        by: 'system',
        at: new Date(),
      }],
    };

    this.logger.debug("Creating booking in repository", {
      ...context,
      bookingModel,
    });

    const newBooking = await this.bookingRepository.create(bookingModel);

    if (!newBooking) {
      this.logger.error("Failed to create booking in database", context);
      return ResponseHelper.error("Failed to create booking");
    }

    this.logger.info("Booking created successfully", {
      ...context,
      bookingId: newBooking._id?.toString(),
      bookingCode: newBooking.bookingCode,
    });

    const bookingDto = this.mapToDto(newBooking);
    return ResponseHelper.created("Booking created successfully", bookingDto);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    this.logger.error("Error creating booking", {
      ...context,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return ResponseHelper.error("Failed to create booking");
  }
}

  async getBookingById(userId: string, bookingId: string): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: "getBookingById",
      data: { userId, bookingId },
    };

    try {
      this.logger.info("Fetching booking by ID", context);

      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        this.logger.warn("Booking not found", context);
        return ResponseHelper.notFound("Booking not found");
      }

      // Check if user has access to this booking
      if (booking.userId.toString() !== userId && booking.technicianId.toString() !== userId) {
        this.logger.warn("User not authorized to access this booking", context);
        return ResponseHelper.forbidden("Not authorized to access this booking");
      }

      this.logger.info("Booking retrieved successfully", context);

      const bookingDto = this.mapToDto(booking);
      return ResponseHelper.success("Booking retrieved successfully", bookingDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching booking", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch booking");
    }
  }

  async getUserBookings(userId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<BookingListResponseDto>> {
    const context = {
      operation: "getUserBookings",
      data: { userId, page, limit },
    };

    try {
      this.logger.info("Fetching user bookings", context);

      const result = await this.bookingRepository.findByUserId(userId, page, limit);

      this.logger.info("User bookings retrieved successfully", {
        ...context,
        bookingCount: result.bookings.length,
        total: result.total,
      });

      const bookingDtos = result.bookings.map((booking: any) => this.mapToDto(booking));
      
      return ResponseHelper.success("Bookings retrieved successfully", {
        bookings: bookingDtos,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching user bookings", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch bookings");
    }
  }

  async getTechnicianBookings(technicianId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<BookingListResponseDto>> {
    const context = {
      operation: "getTechnicianBookings",
      data: { technicianId, page, limit },
    };

    try {
      this.logger.info("Fetching technician bookings", context);

      const result = await this.bookingRepository.findByTechnicianId(technicianId, page, limit);

      this.logger.info("Technician bookings retrieved successfully", {
        ...context,
        bookingCount: result.bookings.length,
        total: result.total,
      });

      const bookingDtos = result.bookings.map((booking: any) => this.mapToDto(booking));
      
      return ResponseHelper.success("Bookings retrieved successfully", {
        bookings: bookingDtos,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician bookings", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch bookings");
    }
  }

  async updateBookingStatus(bookingId: string, status: string, updatedBy: string, reason?: string): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: "updateBookingStatus",
      data: { bookingId, status, updatedBy, reason },
    };

    try {
      this.logger.info("Updating booking status", context);

      const updatedBooking = await this.bookingRepository.updateStatus(bookingId, status, updatedBy, reason);

      if (!updatedBooking) {
        this.logger.warn("Booking not found for status update", context);
        return ResponseHelper.notFound("Booking not found");
      }

      this.logger.info("Booking status updated successfully", context);

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success("Booking status updated successfully", bookingDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error updating booking status", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to update booking status");
    }
  }

  async cancelBooking(userId: string, bookingId: string, reason: string): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: "cancelBooking",
      data: { userId, bookingId, reason },
    };

    try {
      this.logger.info("Cancelling booking", context);

      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        this.logger.warn("Booking not found for cancellation", context);
        return ResponseHelper.notFound("Booking not found");
      }

      // Check if user owns the booking
      if (booking.userId.toString() !== userId) {
        this.logger.warn("User not authorized to cancel this booking", context);
        return ResponseHelper.forbidden("Not authorized to cancel this booking");
      }

      // Check if booking can be cancelled
      if (['cancelled', 'completed'].includes(booking.status)) {
        this.logger.warn("Booking cannot be cancelled in current status", {
          ...context,
          currentStatus: booking.status,
        });
        return ResponseHelper.badRequest(`Booking cannot be cancelled in ${booking.status} status`);
      }

      const updatedBooking = await this.bookingRepository.updateStatus(
        bookingId,
        'cancelled',
        'user',
        reason
      );

      if (!updatedBooking) {
        this.logger.error("Failed to cancel booking", context);
        return ResponseHelper.error("Failed to cancel booking");
      }

      this.logger.info("Booking cancelled successfully", context);

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success("Booking cancelled successfully", bookingDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error cancelling booking", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to cancel booking");
    }
  }

  private mapToDto(booking: any): BookingResponseDto {
    return {
      _id: booking._id.toString(),
      bookingCode: booking.bookingCode,
      userId: booking.userId?._id?.toString() || booking.userId?.toString(),
      technicianId: booking.technicianId?._id?.toString() || booking.technicianId?.toString(),
      serviceName: booking.serviceName,
      brand: booking.brand,
      addressId: booking.addressId?._id?.toString() || booking.addressId?.toString(),
      scheduledAt: booking.scheduledAt.toISOString(),
      timeSlot: booking.timeSlot,
      status: booking.status,
      amount: booking.amount,
      itemsAmount: booking.itemsAmount,
      totalAmount: booking.totalAmount,
      notes: booking.notes,
      history: booking.history.map((h: any) => ({
        status: h.status,
        by: h.by,
        reason: h.reason,
        at: h.at.toISOString(),
      })),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }
}