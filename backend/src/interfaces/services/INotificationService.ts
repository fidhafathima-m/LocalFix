import {
  CreateNotificationDto,
  NotificationResponseDto,
  NotificationListResponseDto,
} from "../../interfaces/dtos/notificationDtos";

export interface INotificationService {
  createNotification(
    createDto: CreateNotificationDto
  ): Promise<NotificationResponseDto>;
  getNotificationsByUser(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<NotificationListResponseDto>;
  markAsRead(notificationId: string): Promise<NotificationResponseDto>;
  markAllAsRead(userId: string): Promise<{ success: boolean; message: string }>;
  getUnreadCount(
    userId: string
  ): Promise<{ success: boolean; count: number; message?: string }>;

  // Customer notification methods
  createBookingConfirmedNotification(
    userId: string,
    serviceType: string,
    date: string
  ): Promise<NotificationResponseDto>;
  createServiceReminderNotification(
    userId: string,
    serviceType: string,
    date: string
  ): Promise<NotificationResponseDto>;

  // Technician notification methods
  createApplicationApprovedNotification(
    technicianId: string,
    technicianName: string
  ): Promise<NotificationResponseDto>;
  createNewBookingNotification(
    technicianId: string,
    orderId: string,
    serviceType: string
  ): Promise<NotificationResponseDto>;
  createRatingReceivedNotification(
    technicianId: string,
    rating: number,
    customerName: string
  ): Promise<NotificationResponseDto>;
  createPaymentSuccessNotification(
    technicianId: string,
    amount: number,
    paymentId: string
  ): Promise<NotificationResponseDto>;
  createTechnicianUnavailableNotification(
    customerId: string,
    technicianName: string,
    serviceType: string,
    scheduledDate: string,
    orderId: string
  ): Promise<NotificationResponseDto>
  createAvailabilityChangeImpactNotification(
    technicianId: string,
    cancelledOrdersCount: number,
    date: string
  ): Promise<NotificationResponseDto>
}
