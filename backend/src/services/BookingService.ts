import { IBookingService } from "../interfaces/services/user/IBookingService";
import { IBookingRepository } from "../interfaces/repository/user/IBookingRepository";
import { ResponseHelper, ApiResponse } from "../utils/responseHelper";
import { LoggerService } from "../services/LoggerService";
import {
  CreateBookingRequestDto,
  BookingResponseDto,
  BookingListResponseDto,
  TechnicianLocationDto,
  TrackingDetailsDto,
} from "../interfaces/dtos/bookingDtos";
import { Types } from "mongoose";
import { IOrderRepository } from "@/interfaces/repository/user/IOrderRepository";
import { ITechnicianRepository } from "@/interfaces/repository/technician/ITechnicianRepository";
import { ITechnician } from "@/interfaces/technician/ITechnician";
import { IBooking } from "@/models/BookingSchema";

export class BookingService implements IBookingService {
  private logger: LoggerService;

  constructor(
    private bookingRepository: IBookingRepository,
    private orderRepository: IOrderRepository
  ) {
    this.logger = new LoggerService();
  }

  async createBooking(
    userId: string,
    bookingData: CreateBookingRequestDto
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: "createBooking",
      data: { userId, ...bookingData },
    };

    try {
      this.logger.info("Creating new booking", context);

      // Validate required fields
      if (
        !bookingData.technicianId ||
        !bookingData.serviceName ||
        !bookingData.addressId ||
        !bookingData.scheduledAt ||
        !bookingData.timeSlot
      ) {
        this.logger.warn("Missing required booking fields", context);
        return ResponseHelper.badRequest(
          "Please fill in all required booking fields"
        );
      }

      // Generate booking code
      const bookingCount = await this.bookingRepository.getBookingCount();
      const bookingCode = `BK${String(bookingCount + 1).padStart(6, "0")}`;

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
        notes: bookingData.notes || "",
        status: "pending" as const,
        history: [
          {
            status: "pending",
            by: "system",
            at: new Date(),
          },
        ],
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error creating booking", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to create booking");
    }
  }

  async getBookingById(
    userId: string,
    bookingId: string
  ): Promise<ApiResponse<BookingResponseDto>> {
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

      const bookingUserId =
        booking.userId?._id?.toString() || booking.userId?.toString();
      const bookingTechnicianId =
        booking.technicianId?._id?.toString() ||
        booking.technicianId?.toString();

      // Check if user has access to this booking
      if (bookingUserId !== userId && bookingTechnicianId !== userId) {
        this.logger.warn("User not authorized to access this booking", context);
        return ResponseHelper.forbidden(
          "Not authorized to access this booking"
        );
      }

      this.logger.info("Booking retrieved successfully", context);

      const bookingDto = this.mapToDto(booking);
      return ResponseHelper.success(
        "Booking retrieved successfully",
        bookingDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching booking", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch booking");
    }
  }

  async getUserBookings(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<BookingListResponseDto>> {
    const context = {
      operation: "getUserBookings",
      data: { userId, page, limit },
    };

    try {
      this.logger.info("Fetching user bookings", context);

      const result = await this.bookingRepository.findByUserId(
        userId,
        page,
        limit
      );

      this.logger.info("User bookings retrieved successfully", {
        ...context,
        bookingCount: result.bookings.length,
        total: result.total,
      });

      const bookingDtos = result.bookings.map((booking: any) =>
        this.mapToDto(booking)
      );

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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching user bookings", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch bookings");
    }
  }

  async getTechnicianBookings(
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<BookingListResponseDto>> {
    const context = {
      operation: "getTechnicianBookings",
      data: { technicianId, page, limit },
    };

    try {
      this.logger.info("Fetching technician bookings", context);

      const result = await this.bookingRepository.findByTechnicianId(
        technicianId,
        page,
        limit
      );

      this.logger.info("Technician bookings retrieved successfully", {
        ...context,
        bookingCount: result.bookings.length,
        total: result.total,
      });

      const bookingDtos = result.bookings.map((booking: any) =>
        this.mapToDto(booking)
      );

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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician bookings", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch bookings");
    }
  }

  async updateBooking(
    userId: string,
    bookingId: string,
    updateData: Partial<BookingResponseDto>
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: "updateBooking",
      data: { userId, bookingId, updateData },
    };

    try {
      this.logger.info("Updating booking", context);

      const existingBooking = await this.bookingRepository.findById(bookingId);

      if (!existingBooking) {
        this.logger.warn("Booking not found for update", context);
        return ResponseHelper.notFound("Booking not found");
      }

      const bookingUserId =
        existingBooking.userId?._id?.toString() ||
        existingBooking.userId?.toString();

      // Check if user owns the booking
      if (bookingUserId !== userId) {
        this.logger.warn("User not authorized to update this booking", context);
        return ResponseHelper.forbidden(
          "Not authorized to update this booking"
        );
      }

      const allowedStatuses = ["pending", "cancelled", "accepted"];
      if (!allowedStatuses.includes(existingBooking.status)) {
        this.logger.warn("Booking cannot be updated in current status", {
          ...context,
          currentStatus: existingBooking.status,
        });
        return ResponseHelper.badRequest(
          `Booking cannot be updated in ${existingBooking.status} status`
        );
      }

      // Prepare update data for repository
      const repositoryUpdateData: Partial<IBooking> = {};

      // Map the update fields to the repository model
      if (updateData.serviceName)
        repositoryUpdateData.serviceName = updateData.serviceName;
      if (updateData.brand) repositoryUpdateData.brand = updateData.brand;
      if (updateData.scheduledAt)
        repositoryUpdateData.scheduledAt = new Date(updateData.scheduledAt);
      if (updateData.timeSlot)
        repositoryUpdateData.timeSlot = updateData.timeSlot;
      if (updateData.amount !== undefined)
        repositoryUpdateData.amount = updateData.amount;
      if (updateData.notes !== undefined)
        repositoryUpdateData.notes = updateData.notes;

      // Handle address update
      if (updateData.addressId) {
        repositoryUpdateData.addressId = new Types.ObjectId(
          updateData.addressId
        );
      }

      // Update the booking in repository
      const updatedBooking = await this.bookingRepository.update(
        bookingId,
        repositoryUpdateData
      );

      if (!updatedBooking) {
        this.logger.error("Failed to update booking in repository", context);
        return ResponseHelper.error("Failed to update booking");
      }

      this.logger.info("Booking updated successfully", {
        ...context,
        updatedFields: Object.keys(repositoryUpdateData),
      });

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success("Booking updated successfully", bookingDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error updating booking", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to update booking");
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: "updateBookingStatus",
      data: { bookingId, status, updatedBy, reason },
    };

    try {
      this.logger.info("Updating booking status", context);

      const updatedBooking = await this.bookingRepository.updateStatus(
        bookingId,
        status,
        updatedBy,
        reason
      );

      if (!updatedBooking) {
        this.logger.warn("Booking not found for status update", context);
        return ResponseHelper.notFound("Booking not found");
      }

      this.logger.info("Booking status updated successfully", context);

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success(
        "Booking status updated successfully",
        bookingDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error updating booking status", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to update booking status");
    }
  }

  async cancelBooking(
    userId: string,
    bookingId: string,
    reason: string
  ): Promise<ApiResponse<BookingResponseDto>> {
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

      const bookingUserId =
        booking.userId?._id?.toString() || booking.userId?.toString();

      // Check if user owns the booking
      if (bookingUserId !== userId) {
        this.logger.warn("User not authorized to cancel this booking", context);
        return ResponseHelper.forbidden(
          "Not authorized to cancel this booking"
        );
      }

      // Check if booking can be cancelled
      if (["cancelled", "completed"].includes(booking.status)) {
        this.logger.warn("Booking cannot be cancelled in current status", {
          ...context,
          currentStatus: booking.status,
        });
        return ResponseHelper.badRequest(
          `Booking cannot be cancelled in ${booking.status} status`
        );
      }

      const updatedBooking = await this.bookingRepository.updateStatus(
        bookingId,
        "cancelled",
        "user",
        reason
      );

      if (!updatedBooking) {
        this.logger.error("Failed to cancel booking", context);
        return ResponseHelper.error("Failed to cancel booking");
      }

      this.logger.info("Booking cancelled successfully", context);

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success(
        "Booking cancelled successfully",
        bookingDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
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
      technicianId:
        booking.technicianId?._id?.toString() ||
        booking.technicianId?.toString(),
      serviceName: booking.serviceName,
      brand: booking.brand,
      addressId:
        booking.addressId?._id?.toString() || booking.addressId?.toString(),
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
  async getTrackingDetails(
    userId: string,
    bookingId: string
  ): Promise<ApiResponse<TrackingDetailsDto>> {
    const context = {
      operation: "getTrackingDetails",
      data: { userId, bookingId },
    };

    try {
      this.logger.info("Fetching tracking details", context);

      // Query Order collection
      const order = await this.orderRepository.findByBookingId(bookingId);

      if (!order) {
        this.logger.warn("Order not found for tracking", context);
        return ResponseHelper.notFound("Order not found");
      }

      const technician = order.technicianId;

      // Type guard function to check if it's ITechnician
      const isTechnicianPopulated = (tech: any): tech is ITechnician => {
        return (
          tech &&
          typeof tech === "object" &&
          "_id" in tech &&
          "displayName" in tech
        );
      };

      if (!technician || !isTechnicianPopulated(technician)) {
        this.logger.warn(
          "Technician data not properly populated in order",
          context
        );
        return ResponseHelper.notFound("Technician details not found");
      }

      const address = order.address;

      // Get technician location if available
      const technicianLocation =
        await this.bookingRepository.getTechnicianLocation(
          technician._id.toString()
        );

      // Calculate estimated arrival and distance if technician is on the way
      let estimatedArrival: string | undefined;
      let distance: number | undefined;

      if (order.status === "on_the_way" && technicianLocation) {
        distance = this.calculateDistance(
          technicianLocation.latitude,
          technicianLocation.longitude
        );
        estimatedArrival = this.calculateEstimatedArrival(distance);
      }

      const trackingDetails: TrackingDetailsDto = {
        _id: order._id.toString(),
        bookingId: order.bookingId.toString(),
        userId: order.userId.toString(),
        technicianId: {
          _id: technician._id.toString(),
          displayName: technician.displayName,
          profilePictureUrl: technician.profilePictureUrl || "",
          averageRating: technician.averageRating || 0,
          ratingCount: technician.ratingCount || 0,
          skills: technician.services || technician.skills || [],
          phone: technician.phone || "",
        },
        serviceName: order.serviceName,
        problemDescription: order.problemDescription,
        scheduledAt: order.scheduledAt.toISOString(),
        timeSlot: order.timeSlot,
        address: {
          label: address.label,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark,
        },
        status: order.status as any,
        amount: order.totalAmount,
        estimatedDuration: "1-2 hours",
        statusHistory: order.history.map((h: any) => ({
          status: h.status,
          timestamp: h.timestamp.toISOString(),
          description:
            h.description || this.getStatusDescription(h.status, h.reason),
          updatedBy: h.updatedBy as "user" | "technician" | "system",
        })),
        technicianLocation: technicianLocation
          ? {
              latitude: technicianLocation.latitude,
              longitude: technicianLocation.longitude,
              lastUpdated: technicianLocation.lastUpdated.toISOString(),
            }
          : undefined,
        estimatedArrival,
        distance,
      };

      this.logger.info("Tracking details retrieved successfully", context);

      return ResponseHelper.success(
        "Tracking details retrieved successfully",
        trackingDetails
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching tracking details", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch tracking details");
    }
  }
  async getTechnicianLocation(
    bookingId: string
  ): Promise<ApiResponse<TechnicianLocationDto>> {
    const context = {
      operation: "getTechnicianLocation",
      data: { bookingId },
    };

    try {
      this.logger.info("Fetching technician location", context);

      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        this.logger.warn("Booking not found for location tracking", context);
        return ResponseHelper.notFound("Booking not found");
      }

      // Get technician location
      const technicianLocation =
        await this.bookingRepository.getTechnicianLocation(
          booking.technicianId.toString()
        );

      if (!technicianLocation) {
        this.logger.warn("Technician location not available", context);
        return ResponseHelper.notFound("Technician location not available");
      }

      // Calculate estimated arrival and distance
      let estimatedArrival: string | undefined;
      let distance: number | undefined;

      if (booking.status === "on_the_way") {
        distance = this.calculateDistance(
          technicianLocation.latitude,
          technicianLocation.longitude
        );
        estimatedArrival = this.calculateEstimatedArrival(distance);
      }

      const locationData: TechnicianLocationDto = {
        latitude: technicianLocation.latitude,
        longitude: technicianLocation.longitude,
        lastUpdated: technicianLocation.lastUpdated.toISOString(),
        estimatedArrival,
        distance,
        technicianId: booking.technicianId.toString(),
        bookingId: booking.bookingCode,
      };

      this.logger.info("Technician location retrieved successfully", context);

      return ResponseHelper.success(
        "Technician location retrieved successfully",
        locationData
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician location", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch technician location");
    }
  }

  // Helper methods for location calculations
  private calculateDistance(lat: number, lng: number): number {
    // Mock distance calculation
    return Math.random() * 10 + 1;
  }

  private calculateEstimatedArrival(distance: number): string {
    // Mock ETA calculation - in real app, use traffic data
    const averageSpeed = 30; // km/h
    const travelTimeMinutes = Math.round((distance / averageSpeed) * 60);
    return `${travelTimeMinutes} minutes`;
  }

  private getStatusDescription(status: string, reason?: string): string {
    const descriptions: { [key: string]: string } = {
      pending:
        "Your booking has been confirmed and is waiting for technician assignment.",
      accepted:
        "Your booking has been accepted and a technician will be assigned soon.",
      assigned: "A technician has been assigned to your service request.",
      on_the_way: "The technician is on the way to your location.",
      in_progress: "The technician is currently working on your service.",
      completed: "The service has been completed successfully.",
      cancelled: reason
        ? `Booking cancelled: ${reason}`
        : "Booking has been cancelled.",
    };

    return descriptions[status] || `Status updated to ${status}`;
  }
}
