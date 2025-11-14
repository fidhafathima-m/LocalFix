import { Server } from "socket.io";
import { LocationTrackingService } from "./LocationTrackingService";
import { ITechnicianLocationShare } from "@/interfaces/common/ILocationTracking";
import { NotificationService } from "./NotificationService";
import { notificationRepository } from "../config/container";
import { LoggerService } from "./LoggerService";
import { INotificationService } from "../interfaces/services/INotificationService";

export class SocketService {
  private _io: Server;
  private _locationService: LocationTrackingService;
  private _activeConnections: Map<string, string> = new Map();
  private _notificationService: INotificationService;

  constructor(server: any, notificationService: INotificationService) {
    this._io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
      },
    });

    this._notificationService = notificationService;
    this._locationService = new LocationTrackingService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this._io.on("connection", (socket) => {
      console.log("🔌 New client connected:", socket.id);

      // Setup location tracking handlers
      this.setupLocationHandlers(socket);

      // ✅ FIX: Add this line to setup notification handlers
      this.setupNotificationHandlers(socket);

      socket.on("disconnect", () => {
        // Clean up disconnected technicians
        const technicianId = this._activeConnections.get(socket.id);
        if (technicianId) {
          this._activeConnections.delete(socket.id);
        }
        console.log("🔌 Client disconnected:", socket.id);
      });
    });
  }

  // ✅ Add this method for location handlers
  private setupLocationHandlers(socket: any): void {
    socket.on(
      "technician-location-share",
      async (data: ITechnicianLocationShare) => {
        try {
          const { technicianId, orderId, location } = data;

          // Store connection mapping
          this._activeConnections.set(socket.id, technicianId);

          // Start location sharing in database
          const result = await this._locationService.startLocationSharing(
            technicianId,
            orderId,
            location,
          );

          if (result.success) {
            const roomName = `order-${orderId}`;

            // Get room info
            const room = this._io.sockets.adapter.rooms.get(roomName);
            const roomSize = room ? room.size : 0;

            // Broadcast to ALL clients in the room
            this._io.to(roomName).emit("technician-location-update", {
              technicianId,
              location: {
                ...location,
                timestamp: new Date(),
              },
              isActive: true,
            });
          }
        } catch (error) {
          console.error("BACKEND: Error in technician-location-share:", error);
          socket.emit("location-error", {
            message: "Failed to share location",
          });
        }
      },
    );

    // Update ALL other handlers too:
    socket.on(
      "technician-location-update",
      async (data: ITechnicianLocationShare) => {
        const { technicianId, orderId, location } = data;
        const roomName = `order-${orderId}`;

        this._io.to(roomName).emit("technician-location-update", {
          technicianId,
          location: {
            ...location,
            timestamp: new Date(),
          },
          isActive: true,
        });
      },
    );

    socket.on("join-tracking", (data: { orderId: string; userId: string }) => {
      const { orderId, userId } = data;
      const roomName = `order-${orderId}`;
      socket.join(roomName);
    });

    socket.on("check-room", (data: { orderId: string }) => {
      const { orderId } = data;
      const roomName = `order-${orderId}`;
      const room = this._io.sockets.adapter.rooms.get(roomName);
      const roomSize = room ? room.size : 0;
      socket.emit("room-status", {
        room: roomName,
        clientsInRoom: roomSize,
      });
    });

    // Technician stops sharing location
    socket.on(
      "technician-location-stop",
      async (data: { technicianId: string; orderId: string }) => {
        try {
          const { technicianId, orderId } = data;

          // Stop location sharing in database
          await this._locationService.stopLocationSharing(
            technicianId,
            orderId,
          );

          // Remove connection mapping
          this._activeConnections.delete(socket.id);

          // Notify user
          socket.to(`booking-${orderId}`).emit("technician-location-ended", {
            technicianId,
            orderId,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error("Error in technician-location-stop:", error);
          socket.emit("location-error", {
            message: "Failed to stop location sharing",
          });
        }
      },
    );
  }

  private setupNotificationHandlers(socket: any): void {
    // User joins their personal notification room
    socket.on("join-notification-room", (data: { userId: string }) => {
      const { userId } = data;
      const roomName = `user-${userId}`;
      socket.join(roomName);
      console.log(`🔔 User ${userId} joined notification room: ${roomName}`);
    });

    // Mark notification as read in real-time
    socket.on(
      "mark-notification-read",
      async (data: { notificationId: string }) => {
        try {
          const { notificationId } = data;
          // Use your existing service
          const updatedNotification =
            await this._notificationService.markAsRead(notificationId);

          // Notify the user about the update
          socket.emit("notification-read", {
            success: true,
            notification: updatedNotification,
          });
        } catch (error) {
          console.error("Error marking notification as read:", error);
          socket.emit("notification-error", {
            message: "Failed to mark notification as read",
          });
        }
      },
    );

    // Get unread count
    socket.on("get-unread-count", async (data: { userId: string }) => {
      try {
        const { userId } = data;
        const result = await this._notificationService.getUnreadCount(userId);

        socket.emit("unread-count-update", {
          count: result.count,
          success: result.success,
        });
      } catch (error) {
        console.error("Error getting unread count:", error);
      }
    });
  }

  // In your SocketService, add these comprehensive methods:

  public async sendLiveNotification(userId: string, notificationData: any) {
    try {
      // 1. Create notification in database (your existing service)
      const notification =
        await this._notificationService.createNotification(notificationData);

      // 2. Send real-time notification
      const roomName = `user-${userId}`;

      this._io.to(roomName).emit("new-notification", {
        notification: notification,
        unreadCount: await this.getUserUnreadCount(userId),
      });

      console.log(`📢 Live notification sent to user ${userId}`);
      return notification;
    } catch (error) {
      console.error("Error sending live notification:", error);
      throw error;
    }
  }

  // Specific notification methods for different scenarios
  public async notifyNewBookingToTechnician(
    technicianId: string,
    orderId: string,
    serviceType: string,
  ) {
    return this.sendLiveNotification(technicianId, {
      userId: technicianId,
      userType: "technician",
      type: "new_booking",
      title: "New Booking Request 🎯",
      message: `You have a new ${serviceType} service request! Tap to view details.`,
      priority: "high",
      data: { orderId, serviceType },
    });
  }

  public async notifyBookingConfirmed(
    customerId: string,
    serviceType: string,
    date: string,
  ) {
    return this.sendLiveNotification(customerId, {
      userId: customerId,
      userType: "customer",
      type: "booking_confirmed",
      title: "Booking Confirmed! ✅",
      message: `Your ${serviceType} is confirmed for ${date}. Get ready!`,
      priority: "medium",
      data: { serviceType, date },
    });
  }

  public async notifyOrderStatusUpdate(
    userId: string,
    orderId: string,
    status: string,
    serviceType: string,
  ) {
    const statusMessages = {
      accepted: {
        title: "Order Accepted",
        message: "Technician has accepted your order",
      },
      on_the_way: {
        title: "Technician On the Way!",
        message: "Your technician is coming to your location",
      },
      in_progress: {
        title: "Service Started",
        message: "Technician has started the service",
      },
      completed: {
        title: "Service Completed",
        message: "Your service has been completed successfully",
      },
      cancelled: {
        title: "Order Cancelled",
        message: "Your order has been cancelled",
      },
    };

    const messageConfig = statusMessages[
      status as keyof typeof statusMessages
    ] || {
      title: "Order Updated",
      message: `Your order status changed to ${status}`,
    };

    return this.sendLiveNotification(userId, {
      userId,
      userType: "customer",
      type: "order_status_update",
      title: messageConfig.title,
      message: messageConfig.message,
      priority: status === "on_the_way" ? "high" : "medium",
      data: { orderId, status, serviceType },
    });
  }

  public async notifyPaymentSuccess(
    userId: string,
    amount: number,
    serviceType: string,
  ) {
    return this.sendLiveNotification(userId, {
      userId,
      userType: "customer",
      type: "payment_success",
      title: "Payment Successful! 💰",
      message: `Your payment of ₹${amount} for ${serviceType} was successful`,
      priority: "medium",
      data: { amount, serviceType },
    });
  }

  public async notifyReviewReceived(
    technicianId: string,
    rating: number,
    customerName: string,
  ) {
    return this.sendLiveNotification(technicianId, {
      userId: technicianId,
      userType: "technician",
      type: "rating_received",
      title: "New Rating Received ⭐",
      message: `${customerName} gave you a ${rating}-star rating`,
      priority: "medium",
      data: { rating, customerName },
    });
  }

  public async notifyApplicationStatus(
    technicianId: string,
    status: string,
    technicianName: string,
  ) {
    const statusMessages = {
      approved: {
        title: "Application Approved! 🎉",
        message: `Congratulations ${technicianName}! Your application has been approved`,
      },
      rejected: {
        title: "Application Update",
        message: `Your technician application status has been updated`,
      },
    };

    const messageConfig = statusMessages[status as keyof typeof statusMessages];

    if (messageConfig) {
      return this.sendLiveNotification(technicianId, {
        userId: technicianId,
        userType: "technician",
        type: "application_status",
        title: messageConfig.title,
        message: messageConfig.message,
        priority: "high",
        data: { status },
      });
    }
  }

  private async getUserUnreadCount(userId: string): Promise<number> {
    const result = await this._notificationService.getUnreadCount(userId);
    return result.count;
  }
  public getIO(): Server {
    return this._io;
  }
}
