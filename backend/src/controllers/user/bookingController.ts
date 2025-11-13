import { Response } from "express";
import { IBookingService } from "../../interfaces/services/user/IBookingService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import { CreateBookingRequestDto } from "../../interfaces/dtos/bookingDtos";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ILogger } from "@/interfaces/utils/ILogger";

export class BookingController {
  private bookingService: IBookingService;
  private logger: ILogger;

  constructor(
    bookingService: IBookingService,
    logger: ILogger
  ) {
    this.bookingService = bookingService;
    this.logger = logger;
  }

  createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const bookingData: CreateBookingRequestDto = req.body;

    const context = {
      operation: "createBooking",
      userId,
      technicianId: bookingData?.technicianId,
      serviceName: bookingData?.serviceName,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Creating new booking", context);

      if (!userId) {
        this.logger.warn(
          "Create booking failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      this.logger.debug("Booking creation data", {
        ...context,
        scheduledAt: bookingData.scheduledAt,
        timeSlot: bookingData.timeSlot,
        brand: bookingData.brand,
      });

      const result = await this.bookingService.createBooking(
        userId,
        bookingData
      );

      this.logger.info("Booking created successfully", {
        ...context,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Create booking controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId } = req.params;

    const context = {
      operation: "getBookingById",
      userId,
      bookingId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching booking by ID", context);

      if (!userId) {
        this.logger.warn(
          "Get booking failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.bookingService.getBookingById(
        userId,
        bookingId
      );

      this.logger.info("Booking retrieved successfully", {
        ...context,
        bookingFound: !!result,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get booking by ID controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const context = {
      operation: "getUserBookings",
      userId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching user bookings", context);

      if (!userId) {
        this.logger.warn(
          "Get user bookings failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.bookingService.getUserBookings(
        userId,
        page,
        limit
      );

      this.logger.info("User bookings retrieved successfully", {
        ...context,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get user bookings controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    const { reason } = req.body;

    const context = {
      operation: "cancelBooking",
      userId,
      bookingId,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Cancelling booking", context);

      if (!userId) {
        this.logger.warn(
          "Cancel booking failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!reason) {
        this.logger.warn("Cancel booking failed - reason required", context);
        const badRequestResponse = ResponseHelper.badRequest(
          "Cancellation reason is required"
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result = await this.bookingService.cancelBooking(
        userId,
        bookingId,
        reason
      );

      this.logger.info("Booking cancelled successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Cancel booking controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  updateBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    const updateData = req.body;

    const context = {
      operation: "updateBooking",
      userId,
      bookingId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating booking", context);

      if (!userId) {
        this.logger.warn(
          "Update booking failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Validate required fields
      if (!updateData || Object.keys(updateData).length === 0) {
        this.logger.warn(
          "Update booking failed - no update data provided",
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          "No update data provided"
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      // Check if user owns the booking
      const booking = await this.bookingService.getBookingById(
        userId,
        bookingId
      );
      if (!booking.success) {
        this.logger.warn("Booking not found or user not authorized", context);
        res.status(booking.statusCode).json(booking);
        return;
      }

      // Update the booking
      const result = await this.bookingService.updateBooking(
        userId,
        bookingId,
        updateData
      );

      this.logger.info("Booking updated successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Update booking controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  updateBookingStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId } = req.params;
    const { status, updatedBy, reason } = req.body;

    const context = {
      operation: "updateBookingStatus",
      userId,
      bookingId,
      status,
      updatedBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating booking status", context);

      if (!userId) {
        this.logger.warn(
          "Update booking status failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!status || !updatedBy) {
        this.logger.warn(
          "Update booking status failed - missing required fields",
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          "Status and updatedBy are required"
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result = await this.bookingService.updateBookingStatus(
        bookingId,
        status,
        updatedBy,
        reason
      );

      this.logger.info("Booking status updated successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Update booking status controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  getTrackingDetails = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId } = req.params;

    const context = {
      operation: "getTrackingDetails",
      userId,
      bookingId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching booking tracking details", context);

      if (!userId) {
        this.logger.warn(
          "Get tracking details failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.bookingService.getTrackingDetails(
        userId,
        bookingId
      );

      this.logger.info("Tracking details retrieved successfully", {
        ...context,
        bookingFound: !!result,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get tracking details controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianLocation = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId } = req.params;

    const context = {
      operation: "getTechnicianLocation",
      userId,
      bookingId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching technician location", context);

      if (!userId) {
        this.logger.warn(
          "Get technician location failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.bookingService.getTechnicianLocation(bookingId);

      this.logger.info("Technician location retrieved successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get technician location controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
