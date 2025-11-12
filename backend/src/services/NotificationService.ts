import { INotificationService } from "../interfaces/services/INotificationService";
import { INotificationRepository } from "../interfaces/repository/INotificationRepository";
import {
  CreateNotificationDto,
  NotificationResponseDto,
  NotificationListResponseDto,
} from "../interfaces/dtos/notificationDtos";
import { NotificationMapper } from "../mappers/notificationMapper";
import { LoggerService } from "./LoggerService";

export class NotificationService implements INotificationService {
  private notificationRepository: INotificationRepository;
  private logger: LoggerService;

  constructor(notificationRepository: INotificationRepository) {
    this.notificationRepository = notificationRepository;
    this.logger = new LoggerService();
  }

  async createNotification(
    createDto: CreateNotificationDto
  ): Promise<NotificationResponseDto> {
    const context = {
      operation: "createNotification",
      userId: createDto.userId,
      userType: createDto.userType,
      type: createDto.type,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Creating notification", context);

      const notification = await this.notificationRepository.create(createDto);
      const responseDto = NotificationMapper.toResponseDto(notification);

      this.logger.info("Notification created successfully", {
        ...context,
        notificationId: responseDto._id,
      });

      return responseDto;
    } catch (error: any) {
      this.logger.error("Create notification error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to create notification");
    }
  }

  async getNotificationsByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationListResponseDto> {
    const context = {
      operation: "getNotificationsByUser",
      userId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching notifications for user", context);

      const skip = (page - 1) * limit;
      const [notifications, total] = await Promise.all([
        this.notificationRepository.findByUser(userId, skip, limit),
        this.notificationRepository.countByUser(userId),
      ]);

      const responseDto = NotificationMapper.toListResponseDto(
        notifications,
        total,
        page,
        limit
      );

      this.logger.info("Notifications retrieved successfully", {
        ...context,
        count: notifications.length,
        total,
      });

      return responseDto;
    } catch (error: any) {
      this.logger.error("Get notifications error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to retrieve notifications");
    }
  }

  async markAsRead(notificationId: string): Promise<NotificationResponseDto> {
    const context = {
      operation: "markAsRead",
      notificationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Marking notification as read", context);

      const notification = await this.notificationRepository.markAsRead(
        notificationId
      );
      if (!notification) {
        this.logger.warn("Notification not found", context);
        throw new Error("Notification not found");
      }

      const responseDto = NotificationMapper.toResponseDto(notification);

      this.logger.info("Notification marked as read successfully", context);

      return responseDto;
    } catch (error: any) {
      this.logger.error("Mark as read error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async markAllAsRead(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const context = {
      operation: "markAllAsRead",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Marking all notifications as read", context);

      const success = await this.notificationRepository.markAllAsRead(userId);

      this.logger.info("All notifications marked as read", {
        ...context,
        success,
      });

      return {
        success: true,
        message: "All notifications marked as read",
      };
    } catch (error: any) {
      this.logger.error("Mark all as read error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        message: "Failed to mark all notifications as read",
      };
    }
  }

  async getUnreadCount(
    userId: string
  ): Promise<{ success: boolean; count: number; message?: string }> {
    const context = {
      operation: "getUnreadCount",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Getting unread notification count", context);

      const count = await this.notificationRepository.countUnreadByUser(userId);

      this.logger.info("Unread count retrieved", {
        ...context,
        count,
      });

      return {
        success: true,
        count,
      };
    } catch (error: any) {
      this.logger.error("Get unread count error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        count: 0,
        message: "Failed to get unread count",
      };
    }
  }

  // Helper methods for common notification types
  async createApplicationApprovedNotification(
    technicianId: string,
    technicianName: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId: technicianId,
      userType: "technician",
      type: "application_approved",
      title: "Application Approved!",
      message: `Congratulations ${technicianName}! Your technician application has been approved. You can now start accepting orders.`,
      priority: "high",
      data: {
        applicationStatus: "approved",
      },
    });
  }

  async createNewBookingNotification(
    technicianId: string,
    orderId: string,
    serviceType: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId: technicianId,
      userType: "technician",
      type: "new_booking",
      title: "New Booking Request",
      message: `You have a new ${serviceType} service request. Please review and accept the order.`,
      priority: "high",
      data: {
        orderId,
        serviceType,
      },
    });
  }

  async createRatingReceivedNotification(
    technicianId: string,
    rating: number,
    customerName: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId: technicianId,
      userType: "technician",
      type: "rating_received",
      title: "New Rating Received",
      message: `${customerName} gave you a ${rating}-star rating. Keep up the good work!`,
      priority: "medium",
      data: {
        rating,
        customerName,
      },
    });
  }

  async createPaymentSuccessNotification(
    technicianId: string,
    amount: number,
    paymentId: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId: technicianId,
      userType: "technician",
      type: "payment_success",
      title: "Payment Received",
      message: `₹${amount} has been credited to your account for completed service.`,
      priority: "medium",
      data: {
        amount,
        paymentId,
      },
    });
  }
  async createBookingConfirmedNotification(
    userId: string,
    serviceType: string,
    date: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      userType: "customer",
      type: "booking_confirmed",
      title: "Booking Confirmed!",
      message: `Your ${serviceType} booking for ${date} has been confirmed.`,
      priority: "medium",
      data: {
        serviceType,
        date,
      },
    });
  }

  async createServiceReminderNotification(
    userId: string,
    serviceType: string,
    date: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId,
      userType: "customer",
      type: "reminder",
      title: "Service Reminder",
      message: `Reminder: Your ${serviceType} service is scheduled for tomorrow (${date}).`,
      priority: "medium",
      data: {
        serviceType,
        date,
      },
    });
  }
  async createTechnicianUnavailableNotification(
    customerId: string,
    technicianName: string,
    serviceType: string,
    scheduledDate: string,
    orderId: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId: customerId,
      userType: "customer",
      type: "technician_unavailable",
      title: "Service Cancelled",
      message: `Your ${serviceType} service with ${technicianName} on ${scheduledDate} has been cancelled due to technician unavailability. We will contact you to reschedule.`,
      priority: "high",
      data: {
        orderId,
        serviceType,
        scheduledDate,
        technicianName,
        reason: "technician_unavailable"
      },
    });
  }

  async createAvailabilityChangeImpactNotification(
    technicianId: string,
    cancelledOrdersCount: number,
    date: string
  ): Promise<NotificationResponseDto> {
    return this.createNotification({
      userId: technicianId,
      userType: "technician",
      type: "availability_change_impact",
      title: "Orders Cancelled",
      message: `${cancelledOrdersCount} order(s) for ${date} have been cancelled due to your unavailability. Customers have been notified.`,
      priority: "medium",
      data: {
        cancelledOrdersCount,
        date,
      },
    });
  }
}
