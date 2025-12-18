import { Server } from 'socket.io';
import { LocationTrackingService } from './LocationTrackingService';
import { ITechnicianLocationShare } from '../interfaces/common/ILocationTracking';
import { NotificationService } from './NotificationService';
import { notificationRepository } from '../config/container';
import { LoggerService } from './LoggerService';
import { INotificationService } from '../interfaces/services/INotificationService';
import { IMessageService } from '../interfaces/services/user/IMessageService';

export class SocketService {
  private _io: Server;
  private _locationService: LocationTrackingService;
  private _activeConnections: Map<string, string> = new Map();
  private _notificationService: INotificationService;
  private _messageService: IMessageService;

  constructor(
    server: any,
    notificationService: INotificationService,
    messageService: IMessageService
  ) {
    this._io = new Server(server, {
      cors: {
        origin: [
          process.env.CLIENT_URL,
          'http://localhost:5173',
          'https://localfix.store',
          'https://www.localfix.store',
          'https://localfix.store',
          'https://www.localfix.store',
          /\.localfix\.store$/,
        ],
        credentials: true,
        methods: ['GET', 'POST'],
      },
      path: '/socket.io/',
      pingTimeout: 60000,
      pingInterval: 25000,
      cookie: {
        name: 'io',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
      allowEIO3: true,
    });

    this._notificationService = notificationService;
    this._messageService = messageService;
    this._locationService = new LocationTrackingService();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this._io.on('connection', socket => {
      console.log('New client connected:', socket.id);

      // Setup location tracking handlers
      this.setupLocationHandlers(socket);

      this.setupNotificationHandlers(socket);

      this.setupOrderStatusHandlers(socket);

      this.setupChatHandlers(socket);

      socket.on('disconnect', () => {
        // Clean up disconnected technicians
        const technicianId = this._activeConnections.get(socket.id);
        if (technicianId) {
          this._activeConnections.delete(socket.id);
        }
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private setupLocationHandlers(socket: any): void {
    socket.on(
      'technician-location-share',
      async (data: ITechnicianLocationShare) => {
        try {
          const { technicianId, orderId, location } = data;

          // Store connection mapping
          this._activeConnections.set(socket.id, technicianId);

          // Start location sharing in database
          const result = await this._locationService.startLocationSharing(
            technicianId,
            orderId,
            location
          );

          if (result.success) {
            const roomName = `order-${orderId}`;

            // Get room info
            const room = this._io.sockets.adapter.rooms.get(roomName);
            const roomSize = room ? room.size : 0;

            // Broadcast to ALL clients in the room
            this._io.to(roomName).emit('technician-location-update', {
              technicianId,
              location: {
                ...location,
                timestamp: new Date(),
              },
              isActive: true,
            });
          }
        } catch (error) {
          console.error('BACKEND: Error in technician-location-share:', error);
          socket.emit('location-error', {
            message: 'Failed to share location',
          });
        }
      }
    );

    socket.on(
      'technician-location-update',
      async (data: ITechnicianLocationShare) => {
        const { technicianId, orderId, location } = data;
        const roomName = `order-${orderId}`;

        this._io.to(roomName).emit('technician-location-update', {
          technicianId,
          location: {
            ...location,
            timestamp: new Date(),
          },
          isActive: true,
        });
      }
    );

    socket.on('join-tracking', (data: { orderId: string; userId: string }) => {
      const { orderId, userId } = data;
      const roomName = `order-${orderId}`;
      socket.join(roomName);
    });

    socket.on('check-room', (data: { orderId: string }) => {
      const { orderId } = data;
      const roomName = `order-${orderId}`;
      const room = this._io.sockets.adapter.rooms.get(roomName);
      const roomSize = room ? room.size : 0;
      socket.emit('room-status', {
        room: roomName,
        clientsInRoom: roomSize,
      });
    });

    // Technician stops sharing location
    socket.on(
      'technician-location-stop',
      async (data: { technicianId: string; orderId: string }) => {
        try {
          const { technicianId, orderId } = data;

          // Stop location sharing in database
          await this._locationService.stopLocationSharing(
            technicianId,
            orderId
          );

          // Remove connection mapping
          this._activeConnections.delete(socket.id);

          // Notify user
          socket.to(`booking-${orderId}`).emit('technician-location-ended', {
            technicianId,
            orderId,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error('Error in technician-location-stop:', error);
          socket.emit('location-error', {
            message: 'Failed to stop location sharing',
          });
        }
      }
    );
  }

  private setupNotificationHandlers(socket: any): void {
    // User joins their personal notification room
    socket.on('join-notification-room', (data: { userId: string }) => {
      const { userId } = data;
      const roomName = `user-${userId}`;
      socket.join(roomName);
    });

    // Mark notification as read in real-time
    socket.on(
      'mark-notification-read',
      async (data: { notificationId: string }) => {
        try {
          const { notificationId } = data;
          const updatedNotification =
            await this._notificationService.markAsRead(notificationId);

          // Notify the user about the update
          socket.emit('notification-read', {
            success: true,
            notification: updatedNotification,
          });
        } catch (error) {
          console.error('Error marking notification as read:', error);
          socket.emit('notification-error', {
            message: 'Failed to mark notification as read',
          });
        }
      }
    );

    // Get unread count
    socket.on('get-unread-count', async (data: { userId: string }) => {
      try {
        const { userId } = data;
        const result = await this._notificationService.getUnreadCount(userId);

        socket.emit('unread-count-update', {
          count: result.count,
          success: result.success,
        });
      } catch (error) {
        console.error('Error getting unread count:', error);
      }
    });

    socket.on('leave-user-room', (data: { userId: string }) => {
      const roomName = `user-${data.userId}`;
      socket.leave(roomName);
    });
  }

  private setupOrderStatusHandlers(socket: any): void {
    // Join order room for status updates
    socket.on(
      'join-order-room',
      async (data: { orderId: string; userId: string; userType: string }) => {
        const { orderId, userId, userType } = data;
        const roomName = `order-status-${orderId}`;
        socket.join(roomName);

        // Sync the room with current order status when joining
        try {
          await this._messageService.syncOrderStatusWithRoom(orderId);
        } catch (error) {
          console.error('Error syncing order status on room join:', error);
        }
      }
    );

    // Handle order status updates
    socket.on(
      'order-status-changed',
      async (data: { orderId: string; newStatus: string; userId: string }) => {
        try {
          // Update the room with new order status
          await this._messageService.syncOrderStatusWithRoom(data.orderId);

          // Notify all users in the order status room
          this._io
            .to(`order-status-${data.orderId}`)
            .emit('order-status-updated', {
              orderId: data.orderId,
              newStatus: data.newStatus,
              timestamp: new Date().toISOString(),
            });
        } catch (error) {
          console.error('Error handling order status change:', error);
        }
      }
    );
  }

  public async notifyOrderStatusChange(
    orderId: string,
    newStatus: string
  ): Promise<void> {
    try {
      const roomName = `order-status-${orderId}`;

      // Check how many clients are in the room
      const room = this._io.sockets.adapter.rooms.get(roomName);
      const clientCount = room ? room.size : 0;

      // Emit to all users in the order status room
      this._io.to(roomName).emit('order-status-updated', {
        orderId,
        newStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('DEBUG: Error sending order status update:', error);
      throw error;
    }
  }

  public async updateUserUnreadMessageCount(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<void> {
    try {
      const count = await this._messageService.getUnreadCount(userId, userType);

      // Send to user's personal room
      this._io.to(`user-${userId}`).emit('unread-message-count-update', {
        count,
        userType,
      });
    } catch (error) {
      console.error('Error updating unread message count:', error);
    }
  }

  // Method to manually trigger unread count sync
  public async syncUnreadCountForUser(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<void> {
    await this.updateUserUnreadMessageCount(userId, userType);
  }

  public async sendLiveNotification(userId: string, notificationData: any) {
    try {
      // 1. Create notification in database
      const notification =
        await this._notificationService.createNotification(notificationData);

      // 2. Send real-time notification
      const roomName = `user-${userId}`;

      this._io.to(roomName).emit('new-notification', {
        notification: notification,
        unreadCount: await this.getUserUnreadCount(userId),
      });

      return notification;
    } catch (error) {
      console.error('Error sending live notification:', error);
      throw error;
    }
  }

  // Specific notification methods for different scenarios
  public async notifyNewBookingToTechnician(
    technicianId: string,
    orderId: string,
    serviceType: string
  ) {
    return this.sendLiveNotification(technicianId, {
      userId: technicianId,
      userType: 'technician',
      type: 'new_booking',
      title: 'New Booking Request 🎯',
      message: `You have a new ${serviceType} service request! Tap to view details.`,
      priority: 'high',
      data: { orderId, serviceType },
    });
  }

  public async notifyBookingConfirmed(
    customerId: string,
    serviceType: string,
    date: string
  ) {
    return this.sendLiveNotification(customerId, {
      userId: customerId,
      userType: 'customer',
      type: 'booking_confirmed',
      title: 'Booking Confirmed! ✅',
      message: `Your ${serviceType} is confirmed for ${date}. Get ready!`,
      priority: 'medium',
      data: { serviceType, date },
    });
  }

  public async notifyOrderStatusUpdate(
    userId: string,
    orderId: string,
    status: string,
    serviceType: string
  ) {
    const statusMessages = {
      accepted: {
        title: 'Order Accepted',
        message: 'Technician has accepted your order',
      },
      on_the_way: {
        title: 'Technician On the Way!',
        message: 'Your technician is coming to your location',
      },
      in_progress: {
        title: 'Service Started',
        message: 'Technician has started the service',
      },
      completed: {
        title: 'Service Completed',
        message: 'Your service has been completed successfully',
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled',
      },
    };

    const messageConfig = statusMessages[
      status as keyof typeof statusMessages
    ] || {
      title: 'Order Updated',
      message: `Your order status changed to ${status}`,
    };

    return this.sendLiveNotification(userId, {
      userId,
      userType: 'customer',
      type: 'order_status_update',
      title: messageConfig.title,
      message: messageConfig.message,
      priority: status === 'on_the_way' ? 'high' : 'medium',
      data: { orderId, status, serviceType },
    });
  }

  public async notifyPaymentSuccess(
    userId: string,
    amount: number,
    serviceType: string
  ) {
    return this.sendLiveNotification(userId, {
      userId,
      userType: 'customer',
      type: 'payment_success',
      title: 'Payment Successful! 💰',
      message: `Your payment of ₹${amount} for ${serviceType} was successful`,
      priority: 'medium',
      data: { amount, serviceType },
    });
  }

  public async notifyReviewReceived(
    technicianId: string,
    rating: number,
    customerName: string
  ) {
    return this.sendLiveNotification(technicianId, {
      userId: technicianId,
      userType: 'technician',
      type: 'rating_received',
      title: 'New Rating Received ⭐',
      message: `${customerName} gave you a ${rating}-star rating`,
      priority: 'medium',
      data: { rating, customerName },
    });
  }

  public async notifyApplicationStatus(
    technicianId: string,
    status: string,
    technicianName: string
  ) {
    const statusMessages = {
      approved: {
        title: 'Application Approved! 🎉',
        message: `Congratulations ${technicianName}! Your application has been approved`,
      },
      rejected: {
        title: 'Application Update',
        message: `Your technician application status has been updated`,
      },
    };

    const messageConfig = statusMessages[status as keyof typeof statusMessages];

    if (messageConfig) {
      return this.sendLiveNotification(technicianId, {
        userId: technicianId,
        userType: 'technician',
        type: 'application_approved',
        title: messageConfig.title,
        message: messageConfig.message,
        priority: 'high',
        data: { status },
      });
    }
  }

  public async notifyRefundProcessed(
    userId: string,
    amount: number,
    orderId: string,
    reason?: string,
    newBalance?: number
  ) {
    const notificationMessage =
      reason && reason !== 'Admin initiated refund'
        ? `Your payment of ₹${amount} for order ${orderId} has been refunded: "${reason}". Amount credited to your wallet.`
        : `Your payment of ₹${amount} for order ${orderId} has been refunded. Amount credited to your wallet.`;

    return this.sendLiveNotification(userId, {
      userId: userId,
      userType: 'customer',
      type: 'payment_refund',
      title: 'Payment Refunded 💰',
      message: notificationMessage,
      priority: 'high',
      data: {
        amount,
        orderId,
        reason: reason || 'Admin initiated refund',
        newBalance,
        timestamp: new Date().toISOString(),
        refundType: 'wallet_credit',
      },
    });
  }

  public async notifySparePartsRequest(
    customerId: string,
    technicianName: string,
    serviceType: string,
    orderId: string,
    totalAmount: number,
    itemsCount: number,
    requestId: string
  ) {
    return this.sendLiveNotification(customerId, {
      userId: customerId,
      userType: 'customer',
      type: 'spare_parts_request',
      title: 'Spare Parts Request 🔧',
      message: `${technicianName} has requested ${itemsCount} spare parts for your ${serviceType} service. Total: ₹${totalAmount}`,
      priority: 'high',
      data: {
        orderId,
        requestId,
        serviceType,
        technicianName,
        totalAmount,
        itemsCount,
        actionUrl: `/orders/${orderId}/spare-parts/${requestId}/approval`,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async getUserUnreadCount(userId: string): Promise<number> {
    const result = await this._notificationService.getUnreadCount(userId);
    return result.count;
  }

  private setupChatHandlers(socket: any): void {
    // Join chat room for an order
    socket.on(
      'join-chat-room',
      async (data: {
        orderId: string;
        userId: string;
        userType: 'user' | 'technician';
      }) => {
        try {
          const { orderId, userId, userType } = data;
          const roomName = `chat-${orderId}`;

          socket.join(roomName);

          // Mark messages as read when user joins
          await this._messageService.markConversationAsRead(
            orderId,
            userId,
            userType
          );
          const updatedCount = await this._messageService.getUnreadCount(
            userId,
            userType
          );

          // Send to the specific user who joined
          socket.emit('unread-message-count-update', {
            count: updatedCount,
            userType,
          });
        } catch (error) {
          console.error('Error joining chat room:', error);
          socket.emit('chat-error', { message: 'Failed to join chat room' });
        }
      }
    );

    socket.on(
      'send-message',
      async (data: {
        orderId: string;
        senderId: string;
        senderType: 'user' | 'technician';
        receiverId: string;
        receiverType: 'user' | 'technician';
        message: string;
        messageType?: 'text' | 'image' | 'file';
        tempId?: string;
      }) => {
        try {
          const recentMessages = await this._messageService.getRecentMessages(
            data.orderId,
            data.senderId,
            5000 // 5 seconds
          );

          const duplicate = recentMessages.find(
            msg =>
              msg.message === data.message &&
              msg.senderId === data.senderId &&
              Date.now() - new Date(msg.timestamp).getTime() < 5000
          );

          let savedMessage;

          if (duplicate) {
            savedMessage = duplicate;
          } else {
            // Save message to database only if it's not a duplicate
            const messageToSave = {
              orderId: data.orderId,
              senderId: data.senderId,
              senderType: data.senderType,
              receiverId: data.receiverId,
              receiverType: data.receiverType,
              message: data.message,
              messageType: data.messageType || 'text',
            };

            savedMessage =
              await this._messageService.sendMessage(messageToSave);
          }

          const roomName = `chat-${data.orderId}`;

          // Send to everyone EXCEPT the sender
          socket.to(roomName).emit('new-message', {
            message: savedMessage,
            roomName,
          });

          // Send confirmation to sender
          socket.emit('message-sent', {
            message: savedMessage,
            tempId: data.tempId,
          });

          // Update unread count for receiver
          const receiverUnreadCount = await this._messageService.getUnreadCount(
            data.receiverId,
            data.receiverType
          );

          this._io
            .to(`user-${data.receiverId}`)
            .emit('unread-message-count-update', {
              count: receiverUnreadCount,
              userType: data.receiverType,
            });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('chat-error', { message: 'Failed to send message' });
          socket.emit('message-failed', {
            tempId: data.tempId,
            error: 'Failed to send message',
          });
        }
      }
    );

    socket.on(
      'mark-all-messages-read',
      async (data: { userId: string; userType: 'user' | 'technician' }) => {
        try {
          const { userId, userType } = data;

          // Mark all messages as read
          await this._messageService.markAllMessagesAsRead(userId, userType);

          // Get updated count (should be 0)
          const updatedCount = await this._messageService.getUnreadCount(
            userId,
            userType
          );

          // Notify the user
          socket.emit('unread-message-count-update', {
            count: updatedCount,
            userType,
          });

          // Also broadcast to user's personal room
          this._io.to(`user-${userId}`).emit('unread-message-count-update', {
            count: updatedCount,
            userType,
          });
        } catch (error) {
          console.error('Error marking all messages as read:', error);
          socket.emit('chat-error', {
            message: 'Failed to mark messages as read',
          });
        }
      }
    );

    socket.on(
      'get-unread-message-count',
      async (data: { userId: string; userType: 'user' | 'technician' }) => {
        try {
          const { userId, userType } = data;
          const count = await this._messageService.getUnreadCount(
            userId,
            userType
          );

          socket.emit('unread-message-count-update', {
            count,
            userType,
          });
        } catch (error) {
          console.error('Error getting unread count:', error);
        }
      }
    );

    // Leave chat room
    socket.on('leave-chat-room', (data: { orderId: string }) => {
      const roomName = `chat-${data.orderId}`;
      socket.leave(roomName);
    });

    // Typing indicators
    socket.on(
      'typing-start',
      (data: { orderId: string; userId: string; userType: string }) => {
        const roomName = `chat-${data.orderId}`;
        socket.to(roomName).emit('user-typing', {
          userId: data.userId,
          userType: data.userType,
          isTyping: true,
        });
      }
    );

    socket.on(
      'typing-stop',
      (data: { orderId: string; userId: string; userType: string }) => {
        const roomName = `chat-${data.orderId}`;
        socket.to(roomName).emit('user-typing', {
          userId: data.userId,
          userType: data.userType,
          isTyping: false,
        });
      }
    );
  }

  public getIO(): Server {
    return this._io;
  }
}
