import { IBookingService } from '../interfaces/services/user/IBookingService';
import { IBookingRepository } from '../interfaces/repository/user/IBookingRepository';
import { ResponseHelper, ApiResponse } from '../utils/responseHelper';
import {
  CreateBookingRequestDto,
  BookingResponseDto,
  BookingListResponseDto,
  TechnicianLocationDto,
  TrackingDetailsDto,
} from '../interfaces/dtos/bookingDtos';
import mongoose, { Types } from 'mongoose';
import { IOrderRepository } from '../interfaces/repository/user/IOrderRepository';
import { ITechnician } from '../interfaces/technician/ITechnician';
import { IBooking } from '../models/BookingSchema';
import { ILogger } from '../interfaces/utils/ILogger';
import { IOrderPopulated } from '../interfaces/user/IOrder';
import {
  BookingModel,
  BookingHistoryItem,
  PaginatedBookings,
  StatusHistoryItem,
  TechnicianLocationData,
  isTechnicianPopulated,
  isBooking,
} from '../interfaces/user/IBooking';
import { IRedis } from '../interfaces/config/IRedis';
import { ISlotRule } from '../models/technician/SlotRuleSchema';
import { TimeSlotHelper } from '../utils/timeSlotHelper';

export class BookingService implements IBookingService {
  private _logger: ILogger;
  private _bookingRepository: IBookingRepository;
  private _orderRepository: IOrderRepository;
  private _redisClient: IRedis;

  constructor(
    bookingRepository: IBookingRepository,
    orderRepository: IOrderRepository,
    logger: ILogger,
    redisClient: IRedis
  ) {
    this._logger = logger;
    this._bookingRepository = bookingRepository;
    this._orderRepository = orderRepository;
    this._redisClient = redisClient;
  }

  private async checkBookingIdempotency(
    key: string
  ): Promise<{ exists: boolean; response?: any }> {
    // Similar implementation as payment service
    try {
      const cachedResponse = await this._redisClient.get(
        `booking_idempotency:${key}`
      );
      if (cachedResponse) {
        return { exists: true, response: JSON.parse(cachedResponse) };
      }
      return { exists: false };
    } catch (error) {
      this._logger.error('Error checking booking idempotency key', {
        key,
        error,
      });
      return { exists: false };
    }
  }

  private async storeBookingIdempotency(
    key: string,
    response: any,
    statusCode: number
  ): Promise<void> {
    try {
      await this._redisClient.setex(
        `booking_idempotency:${key}`,
        24 * 60 * 60,
        JSON.stringify({ response, statusCode, timestamp: new Date() })
      );
    } catch (error) {
      this._logger.error('Error storing booking idempotency key', {
        key,
        error,
      });
    }
  }

  // In BookingService.ts, add this method
  async checkTechnicianAvailability(
    technicianId: string,
    scheduledAt: Date,
    timeSlot: string
  ): Promise<ApiResponse<{ available: boolean; message?: string }>> {
    const context = {
      operation: 'checkTechnicianAvailability',
      data: { technicianId, scheduledAt, timeSlot },
    };

    try {
      this._logger.info('Checking technician availability', context);

      // Use the same method we created earlier
      const availabilityCheck = await this._checkTechnicianAvailability(
        technicianId,
        scheduledAt,
        timeSlot
      );
      // Or just use the same logic here
      return ResponseHelper.success('Availability checked successfully', {
        available: availabilityCheck.available,
        message: availabilityCheck.message,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error checking technician availability', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to check availability');
    }
  }

  async createBooking(
    userId: string,
    bookingData: CreateBookingRequestDto,
    idempotencyKey?: string
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: 'createBooking',
      data: { userId, ...bookingData, idempotencyKey },
    };

    try {
      this._logger.info('Creating new booking', context);

      // Check idempotency key if provided
      if (idempotencyKey) {
        const idempotencyCheck =
          await this.checkBookingIdempotency(idempotencyKey);
        if (idempotencyCheck.exists) {
          this._logger.info('Returning cached booking response', {
            ...context,
            idempotencyKey,
          });
          return idempotencyCheck.response;
        }
      }

      // Validate required fields
      if (
        !bookingData.technicianId ||
        !bookingData.serviceName ||
        !bookingData.addressId ||
        !bookingData.scheduledAt ||
        !bookingData.timeSlot
      ) {
        this._logger.warn('Missing required booking fields', context);
        return ResponseHelper.badRequest(
          'Please fill in all required booking fields'
        );
      }

      const Service = mongoose.model('Service');
      const service = await Service.findOne({ name: bookingData.serviceName });

      if (!service) {
        this._logger.warn('Service not found', {
          ...context,
          serviceName: bookingData.serviceName,
        });
        return ResponseHelper.notFound(
          `Service '${bookingData.serviceName}' not found`
        );
      }

      // Check technician availability
      const availabilityCheck = await this._checkTechnicianAvailability(
        bookingData.technicianId,
        new Date(bookingData.scheduledAt),
        bookingData.timeSlot
      );

      if (!availabilityCheck.available) {
        this._logger.warn('Technician not available', {
          ...context,
          availabilityMessage: availabilityCheck.message,
        });

        return ResponseHelper.conflict(
          availabilityCheck.message ||
            'Technician is not available for the selected time slot'
        );
      }

      const serviceId = service._id;

      // Generate booking code
      const bookingCount = await this._bookingRepository.getBookingCount();
      const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`;

      // Calculate amounts
      const baseAmount = bookingData.amount || 0;
      const itemsAmount = 0;
      const totalAmount = baseAmount + itemsAmount;

      const bookingModel: BookingModel = {
        bookingCode: bookingCode,
        userId: new Types.ObjectId(userId),
        technicianId: new Types.ObjectId(bookingData.technicianId),
        serviceName: bookingData.serviceName,
        serviceId: serviceId,
        brand: bookingData.brand,
        addressId: new Types.ObjectId(bookingData.addressId),
        scheduledAt: new Date(bookingData.scheduledAt),
        timeSlot: bookingData.timeSlot,
        amount: baseAmount,
        itemsAmount: itemsAmount,
        totalAmount: totalAmount,
        notes: bookingData.notes || '',
        status: 'pending',
        history: [
          {
            status: 'pending',
            by: 'system',
            at: new Date(),
          },
        ],
      };

      this._logger.debug('Creating booking in repository', {
        ...context,
        bookingModel,
        serviceId: serviceId.toString(),
      });

      const newBooking = await this._bookingRepository.create(bookingModel);

      if (!newBooking) {
        this._logger.error('Failed to create booking in database', context);
        return ResponseHelper.error('Failed to create booking');
      }

      this._logger.info('Booking created successfully', {
        ...context,
        bookingId: newBooking._id?.toString(),
        bookingCode: newBooking.bookingCode,
        serviceId: serviceId.toString(),
      });

      const bookingDto = this.mapToDto(newBooking);
      const response = ResponseHelper.created(
        'Booking created successfully',
        bookingDto
      );

      // Store the response for idempotency
      if (idempotencyKey) {
        await this.storeBookingIdempotency(idempotencyKey, response, 201);
      }

      return response;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating booking', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to create booking');
    }
  }

  async getBookingById(
    userId: string,
    bookingId: string
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: 'getBookingById',
      data: { userId, bookingId },
    };

    try {
      this._logger.info('Fetching booking by ID', context);

      const booking = await this._bookingRepository.findById(bookingId);

      if (!booking) {
        this._logger.warn('Booking not found', context);
        return ResponseHelper.notFound('Booking not found');
      }

      const bookingUserId =
        booking.userId?._id?.toString() || booking.userId?.toString();
      const bookingTechnicianId =
        booking.technicianId?._id?.toString() ||
        booking.technicianId?.toString();

      // Check if user has access to this booking
      if (bookingUserId !== userId && bookingTechnicianId !== userId) {
        this._logger.warn(
          'User not authorized to access this booking',
          context
        );
        return ResponseHelper.forbidden(
          'Not authorized to access this booking'
        );
      }

      this._logger.info('Booking retrieved successfully', context);

      const bookingDto = this.mapToDto(booking);
      return ResponseHelper.success(
        'Booking retrieved successfully',
        bookingDto
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching booking', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch booking');
    }
  }

  async getUserBookings(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<BookingListResponseDto>> {
    const context = {
      operation: 'getUserBookings',
      data: { userId, page, limit },
    };

    try {
      this._logger.info('Fetching user bookings', context);

      const result: PaginatedBookings =
        await this._bookingRepository.findByUserId(userId, page, limit);

      this._logger.info('User bookings retrieved successfully', {
        ...context,
        bookingCount: result.bookings.length,
        total: result.total,
      });

      const bookingDtos = result.bookings.map((booking: IBooking) =>
        this.mapToDto(booking)
      );

      return ResponseHelper.success('Bookings retrieved successfully', {
        bookings: bookingDtos,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching user bookings', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch bookings');
    }
  }

  async getTechnicianBookings(
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<BookingListResponseDto>> {
    const context = {
      operation: 'getTechnicianBookings',
      data: { technicianId, page, limit },
    };

    try {
      this._logger.info('Fetching technician bookings', context);

      const result: PaginatedBookings =
        await this._bookingRepository.findByTechnicianId(
          technicianId,
          page,
          limit
        );

      this._logger.info('Technician bookings retrieved successfully', {
        ...context,
        bookingCount: result.bookings.length,
        total: result.total,
      });

      const bookingDtos = result.bookings.map((booking: IBooking) =>
        this.mapToDto(booking)
      );

      return ResponseHelper.success('Bookings retrieved successfully', {
        bookings: bookingDtos,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician bookings', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch bookings');
    }
  }

  async updateBooking(
    userId: string,
    bookingId: string,
    updateData: Partial<BookingResponseDto>
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: 'updateBooking',
      data: { userId, bookingId, updateData },
    };

    try {
      this._logger.info('Updating booking', context);

      const existingBooking = await this._bookingRepository.findById(bookingId);

      if (!existingBooking) {
        this._logger.warn('Booking not found for update', context);
        return ResponseHelper.notFound('Booking not found');
      }

      const bookingUserId =
        existingBooking.userId?._id?.toString() ||
        existingBooking.userId?.toString();

      // Check if user owns the booking
      if (bookingUserId !== userId) {
        this._logger.warn(
          'User not authorized to update this booking',
          context
        );
        return ResponseHelper.forbidden(
          'Not authorized to update this booking'
        );
      }

      const allowedStatuses = ['pending', 'cancelled', 'accepted'];
      if (!allowedStatuses.includes(existingBooking.status)) {
        this._logger.warn('Booking cannot be updated in current status', {
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
      const updatedBooking = await this._bookingRepository.update(
        bookingId,
        repositoryUpdateData
      );

      if (!updatedBooking) {
        this._logger.error('Failed to update booking in repository', context);
        return ResponseHelper.error('Failed to update booking');
      }

      this._logger.info('Booking updated successfully', {
        ...context,
        updatedFields: Object.keys(repositoryUpdateData),
      });

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success('Booking updated successfully', bookingDto);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating booking', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to update booking');
    }
  }

  async updateBookingStatus(
    bookingId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: 'updateBookingStatus',
      data: { bookingId, status, updatedBy, reason },
    };

    try {
      this._logger.info('Updating booking status', context);

      const updatedBooking = await this._bookingRepository.updateStatus(
        bookingId,
        status,
        updatedBy,
        reason
      );

      if (!updatedBooking) {
        this._logger.warn('Booking not found for status update', context);
        return ResponseHelper.notFound('Booking not found');
      }

      this._logger.info('Booking status updated successfully', context);

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success(
        'Booking status updated successfully',
        bookingDto
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating booking status', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to update booking status');
    }
  }

  async cancelBooking(
    userId: string,
    bookingId: string,
    reason: string
  ): Promise<ApiResponse<BookingResponseDto>> {
    const context = {
      operation: 'cancelBooking',
      data: { userId, bookingId, reason },
    };

    try {
      this._logger.info('Cancelling booking', context);

      const booking = await this._bookingRepository.findById(bookingId);

      if (!booking) {
        this._logger.warn('Booking not found for cancellation', context);
        return ResponseHelper.notFound('Booking not found');
      }

      const bookingUserId =
        booking.userId?._id?.toString() || booking.userId?.toString();

      // Check if user owns the booking
      if (bookingUserId !== userId) {
        this._logger.warn(
          'User not authorized to cancel this booking',
          context
        );
        return ResponseHelper.forbidden(
          'Not authorized to cancel this booking'
        );
      }

      // Check if booking can be cancelled
      if (['cancelled', 'completed'].includes(booking.status)) {
        this._logger.warn('Booking cannot be cancelled in current status', {
          ...context,
          currentStatus: booking.status,
        });
        return ResponseHelper.badRequest(
          `Booking cannot be cancelled in ${booking.status} status`
        );
      }

      const updatedBooking = await this._bookingRepository.updateStatus(
        bookingId,
        'cancelled',
        'user',
        reason
      );

      if (!updatedBooking) {
        this._logger.error('Failed to cancel booking', context);
        return ResponseHelper.error('Failed to cancel booking');
      }

      this._logger.info('Booking cancelled successfully', context);

      const bookingDto = this.mapToDto(updatedBooking);
      return ResponseHelper.success(
        'Booking cancelled successfully',
        bookingDto
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error cancelling booking', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to cancel booking');
    }
  }

  private mapToDto(booking: IBooking): BookingResponseDto {
    const userId =
      booking.userId?._id?.toString() || booking.userId?.toString();
    const technicianId =
      booking.technicianId?._id?.toString() || booking.technicianId?.toString();
    const addressId =
      booking.addressId?._id?.toString() || booking.addressId?.toString();
    const serviceId = booking.serviceId?.toString();

    return {
      _id: booking.id.toString(),
      bookingCode: booking.bookingCode,
      userId: userId || '',
      technicianId: technicianId || '',
      serviceId: serviceId || '',
      serviceName: booking.serviceName,
      brand: booking.brand,
      addressId: addressId || '',
      scheduledAt: booking.scheduledAt.toISOString(),
      timeSlot: booking.timeSlot,
      status: booking.status,
      amount: booking.amount,
      itemsAmount: booking.itemsAmount,
      totalAmount: booking.totalAmount,
      notes: booking.notes,
      history: booking.history.map((h: BookingHistoryItem) => ({
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
      operation: 'getTrackingDetails',
      data: { userId, bookingId },
    };

    try {
      this._logger.info('Fetching tracking details', context);

      // Query Order collection
      const order = await this._orderRepository.findByBookingId(bookingId);

      if (!order) {
        this._logger.warn('Order not found for tracking', context);
        return ResponseHelper.notFound('Order not found');
      }

      const technician = order.technicianId;

      if (!technician || !isTechnicianPopulated(technician)) {
        this._logger.warn(
          'Technician data not properly populated in order',
          context
        );
        return ResponseHelper.notFound('Technician details not found');
      }

      const address = order.address;

      // Get technician location if available
      const technicianLocation: TechnicianLocationData | null =
        await this._bookingRepository.getTechnicianLocation(
          technician._id.toString()
        );

      // Calculate estimated arrival and distance if technician is on the way
      let estimatedArrival: string | undefined;
      let distance: number | undefined;

      if (order.status === 'on_the_way' && technicianLocation) {
        distance = this.calculateDistance(
          technicianLocation.latitude,
          technicianLocation.longitude
        );
        estimatedArrival = this.calculateEstimatedArrival(distance);
      }

      const trackingDetails: TrackingDetailsDto = {
        _id: order._id.toString(),
        bookingId: order.bookingId.toString(),
        bookingCode: this._getBookingCode(order),
        userId: order.userId.toString(),
        technicianId: {
          _id: technician._id.toString(),
          displayName: technician.displayName,
          profilePictureUrl: technician.profilePictureUrl || '',
          averageRating: technician.averageRating || 0,
          ratingCount: technician.ratingCount || 0,
          skills: (() => {
            // Normalize services/skills to string[]
            const svc = (technician as any).services;
            const sks = (technician as any).skills;
            const arr = Array.isArray(svc)
              ? svc
              : Array.isArray(sks)
                ? sks
                : [];
            return arr.map((item: any) =>
              typeof item === 'string'
                ? item
                : item?.name || item?.skill || String(item)
            );
          })(),
          phone: technician.phone || '',
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
        status: order.status,
        amount: order.totalAmount,
        estimatedDuration: '1-2 hours',
        statusHistory: order.history.map((h: StatusHistoryItem) => ({
          status: h.status,
          timestamp: h.timestamp.toISOString(),
          description:
            h.description || this.getStatusDescription(h.status, h.reason),
          updatedBy: h.updatedBy,
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

      this._logger.info('Tracking details retrieved successfully', context);

      return ResponseHelper.success(
        'Tracking details retrieved successfully',
        trackingDetails
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching tracking details', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch tracking details');
    }
  }

  private _getBookingCode(order: IOrderPopulated): string {
    if (
      order.bookingId &&
      typeof order.bookingId === 'object' &&
      'bookingCode' in order.bookingId
    ) {
      return (order.bookingId as { bookingCode: string }).bookingCode;
    }
    return 'N/A'; // Fallback if not populated
  }

  async getTechnicianLocation(
    bookingId: string
  ): Promise<ApiResponse<TechnicianLocationDto>> {
    const context = {
      operation: 'getTechnicianLocation',
      data: { bookingId },
    };

    try {
      this._logger.info('Fetching technician location', context);

      const booking = await this._bookingRepository.findById(bookingId);

      if (!booking) {
        this._logger.warn('Booking not found for location tracking', context);
        return ResponseHelper.notFound('Booking not found');
      }

      // Get technician location
      const technicianLocation: TechnicianLocationData | null =
        await this._bookingRepository.getTechnicianLocation(
          booking.technicianId.toString()
        );

      if (!technicianLocation) {
        this._logger.warn('Technician location not available', context);
        return ResponseHelper.notFound('Technician location not available');
      }

      // Calculate estimated arrival and distance
      let estimatedArrival: string | undefined;
      let distance: number | undefined;

      if (booking.status === 'on_the_way') {
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

      this._logger.info('Technician location retrieved successfully', context);

      return ResponseHelper.success(
        'Technician location retrieved successfully',
        locationData
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician location', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch technician location');
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
        'Your booking has been confirmed and is waiting for technician assignment.',
      accepted:
        'Your booking has been accepted and a technician will be assigned soon.',
      assigned: 'A technician has been assigned to your service request.',
      on_the_way: 'The technician is on the way to your location.',
      in_progress: 'The technician is currently working on your service.',
      completed: 'The service has been completed successfully.',
      cancelled: reason
        ? `Booking cancelled: ${reason}`
        : 'Booking has been cancelled.',
    };

    return descriptions[status] || `Status updated to ${status}`;
  }

  private async _checkTechnicianAvailability(
    technicianId: string,
    scheduledAt: Date,
    timeSlot: string
  ): Promise<{ available: boolean; message?: string }> {
    const context = {
      technicianId,
      scheduledAt,
      timeSlot,
    };

    try {
      this._logger.info('Checking technician availability', context);

      // 1. Parse the requested time slot
      const parsedSlot = TimeSlotHelper.parseTimeSlot(timeSlot);
      if (!parsedSlot) {
        this._logger.warn('Invalid time slot format', context);
        return {
          available: false,
          message: 'Invalid time slot format',
        };
      }

      // Combine date with time
      const requestedStart = new Date(scheduledAt);
      requestedStart.setHours(
        parsedSlot.start.getHours(),
        parsedSlot.start.getMinutes(),
        0,
        0
      );

      const requestedEnd = new Date(scheduledAt);
      requestedEnd.setHours(
        parsedSlot.end.getHours(),
        parsedSlot.end.getMinutes(),
        0,
        0
      );

      // 2. Check technician's availability schedule
      const availability =
        await this._bookingRepository.getTechnicianAvailability(
          technicianId,
          scheduledAt
        );

      if (!availability) {
        // Check if there's a recurring slot rule
        const slotRule = await this.getTechnicianSlotRule(
          technicianId,
          scheduledAt
        );
        if (!slotRule) {
          this._logger.warn('Technician has no availability schedule', context);
          return {
            available: false,
            message: 'Technician is not available on this date',
          };
        }

        // Generate slots from the rule
        const slots = slotRule.generateSlotsForDate(scheduledAt);
        const isSlotAvailable = slots.some(slot => {
          const slotStart = new Date(slot.start);
          const slotEnd = new Date(slot.end);

          return (
            slot.status === 'available' &&
            requestedStart.getTime() === slotStart.getTime() &&
            requestedEnd.getTime() === slotEnd.getTime()
          );
        });

        if (!isSlotAvailable) {
          return {
            available: false,
            message: 'Time slot is not available in technician schedule',
          };
        }
      } else {
        // Check against specific availability slots
        const isSlotAvailable = availability.timeSlots.some(slot => {
          const slotStart = new Date(slot.start);
          const slotEnd = new Date(slot.end);

          return (
            slot.status === 'available' &&
            requestedStart.getTime() === slotStart.getTime() &&
            requestedEnd.getTime() === slotEnd.getTime()
          );
        });

        if (!isSlotAvailable) {
          return {
            available: false,
            message: 'Time slot is not available in technician schedule',
          };
        }
      }

      // 3. Check for existing bookings that overlap
      const existingBookings =
        await this._bookingRepository.findByTechnicianAndTimeSlot(
          technicianId,
          scheduledAt,
          timeSlot
        );

      // Filter only active bookings (not cancelled or completed)
      const activeBookings = existingBookings.filter(
        booking =>
          !['cancelled', 'completed', 'refunded'].includes(booking.status)
      );

      if (activeBookings.length > 0) {
        this._logger.warn('Technician already has booking for this time slot', {
          ...context,
          existingBookingIds: activeBookings.map(b => b._id),
        });

        return {
          available: false,
          message: 'Technician is already booked for this time slot',
        };
      }

      // 4. Check if the slot has enough buffer time
      const slotDuration = TimeSlotHelper.getSlotDuration(
        requestedStart,
        requestedEnd
      );

      // Check for bookings that might be too close (within buffer period)
      const allBookings = await this._bookingRepository.findByTechnicianAndDate(
        technicianId,
        scheduledAt
      );

      const bookingsSameDay = allBookings.filter(booking => {
        const bookingDate = new Date(booking.scheduledAt);
        return bookingDate.toDateString() === scheduledAt.toDateString();
      });

      for (const booking of bookingsSameDay) {
        if (['cancelled', 'completed', 'refunded'].includes(booking.status)) {
          continue;
        }

        const bookingParsedSlot = TimeSlotHelper.parseTimeSlot(
          booking.timeSlot
        );
        if (!bookingParsedSlot) continue;

        const bookingStart = new Date(booking.scheduledAt);
        bookingStart.setHours(
          bookingParsedSlot.start.getHours(),
          bookingParsedSlot.start.getMinutes(),
          0,
          0
        );

        const bookingEnd = new Date(booking.scheduledAt);
        bookingEnd.setHours(
          bookingParsedSlot.end.getHours(),
          bookingParsedSlot.end.getMinutes(),
          0,
          0
        );

        // Check minimum buffer (e.g., 30 minutes between appointments)
        const bufferMinutes = 30; // You can make this configurable
        const timeBetween =
          Math.abs(requestedStart.getTime() - bookingEnd.getTime()) /
          (1000 * 60);

        if (timeBetween < bufferMinutes) {
          return {
            available: false,
            message: `Please allow at least ${bufferMinutes} minutes between appointments`,
          };
        }
      }

      this._logger.info(
        'Technician is available for the requested slot',
        context
      );
      return { available: true };
    } catch (error) {
      this._logger.error('Error checking technician availability', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        available: false,
        message: 'Error checking availability',
      };
    }
  }

  private async getTechnicianSlotRule(
    technicianId: string,
    date: Date
  ): Promise<ISlotRule | null> {
    try {
      const SlotRule = mongoose.model<ISlotRule>('SlotRule');

      // Find active slot rules for this technician
      const slotRules = await SlotRule.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
        effectiveFrom: { $lte: date },
        $or: [
          { effectiveTo: { $gte: date } },
          { effectiveTo: { $exists: false } },
        ],
      });

      if (slotRules.length === 0) {
        // Check for global/default slot rules
        const globalRules = await SlotRule.find({
          technicianId: { $exists: false },
          isActive: true,
          effectiveFrom: { $lte: date },
          $or: [
            { effectiveTo: { $gte: date } },
            { effectiveTo: { $exists: false } },
          ],
        });

        return globalRules[0] || null;
      }

      return slotRules[0];
    } catch (error) {
      this._logger.error('Error getting technician slot rule', {
        technicianId,
        date,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
  async getTechnicianBookingsForDate(
    technicianId: string,
    date: Date
  ): Promise<
    ApiResponse<{
      bookings: Array<{
        _id: string;
        scheduledAt: string;
        timeSlot: string;
        status: string;
      }>;
    }>
  > {
    const context = {
      operation: 'getTechnicianBookingsForDate',
      data: { technicianId, date },
    };

    try {
      this._logger.info('Fetching technician bookings for date', context);

      // Get all technician bookings
      const technicianBookings = await this.getTechnicianBookings(
        technicianId,
        1,
        100
      );

      if (!technicianBookings.success || !technicianBookings.data) {
        return ResponseHelper.error('Failed to fetch technician bookings');
      }

      // Filter bookings for the specific date
      const bookingsForDate = technicianBookings.data.bookings.filter(
        (booking: any) => {
          const bookingDate = new Date(booking.scheduledAt);
          return bookingDate.toDateString() === date.toDateString();
        }
      );

      const formattedBookings = bookingsForDate.map((booking: any) => ({
        _id: booking._id || booking.id,
        scheduledAt: booking.scheduledAt,
        timeSlot: booking.timeSlot,
        status: booking.status,
      }));

      return ResponseHelper.success(
        'Technician bookings retrieved successfully',
        { bookings: formattedBookings }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician bookings for date', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch technician bookings');
    }
  }
}
