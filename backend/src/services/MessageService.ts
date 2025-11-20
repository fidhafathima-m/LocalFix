import { IMessageRepository } from '../interfaces/repository/user/IMessageRepository';
import { IMessageService } from '../interfaces/services/user/IMessageService';
import { IMessage, IMessageCreate } from '../interfaces/user/IMessage';
import { IMessageRoom } from '../interfaces/user/IMessageRoom';

export class MessageService implements IMessageService {
  private _messageRepository: IMessageRepository;
  constructor(messageRepository: IMessageRepository) {
    this._messageRepository = messageRepository;
  }

  async sendMessage(messageData: IMessageCreate): Promise<IMessage> {
    // Validate that the chat room is active
    const room = await this._messageRepository.getRoomByOrder(
      messageData.orderId
    );

    if (!room || !room.isActive) {
      throw new Error('Chat room is not active or does not exist');
    }

    // Create the message
    const message = await this._messageRepository.createMessage(messageData);

    // Update room's last message and unread count
    await this._messageRepository.updateRoom(messageData.orderId, {
      lastMessage: {
        message: messageData.message,
        timestamp: message.timestamp,
        senderId: messageData.senderId,
        senderType: messageData.senderType,
      },
      unreadCount: {
        user:
          messageData.receiverType === 'user'
            ? room.unreadCount.user + 1
            : room.unreadCount.user,
        technician:
          messageData.receiverType === 'technician'
            ? room.unreadCount.technician + 1
            : room.unreadCount.technician,
      },
    });

    return message;
  }

  async getOrderMessages(
    orderId: string,
    limit: number = 50
  ): Promise<IMessage[]> {
    return this._messageRepository.getMessagesByOrder(orderId, limit);
  }

  // In MessageService.ts - add this method
  async syncOrderStatusWithRoom(orderId: string): Promise<void> {
    try {
      const orderStatus = await this._messageRepository.getOrderStatus(orderId);
      if (orderStatus) {
        await this._messageRepository.updateRoom(orderId, {
          technicianSnapshot: {
            orderStatus: orderStatus,
          },
          orderStatus: orderStatus,
        });
        console.log(
          `✅ Synced order status for room ${orderId}: ${orderStatus}`
        );
      }
    } catch (error) {
      console.error('Error syncing order status with room:', error);
      throw error;
    }
  }

  async getConversations(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<IMessageRoom[]> {
    return this._messageRepository.getRoomsByUser(userId, userType);
  }

  async markConversationAsRead(
    orderId: string,
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<void> {
    const markedCount = await this._messageRepository.markMessagesAsRead(
      orderId,
      userId,
      userType
    );

    if (markedCount > 0) {
      // Reset unread count for this user
      const room = await this._messageRepository.getRoomByOrder(orderId);
      if (room) {
        await this._messageRepository.updateRoom(orderId, {
          unreadCount: {
            user: userType === 'user' ? 0 : room.unreadCount.user,
            technician:
              userType === 'technician' ? 0 : room.unreadCount.technician,
          },
        });
      }
    }
  }

  // In MessageService.ts - IMPROVE getTechnicianSnapshot
  private async getTechnicianSnapshot(
    technicianId: string,
    orderId: string
  ): Promise<{
    displayName: string;
    profilePictureUrl: string;
    serviceName: string;
    orderStatus?: string;
  }> {
    try {
      console.log(
        `🔍 Creating technician snapshot for order: ${orderId}, technician: ${technicianId}`
      );

      // Fetch all data in parallel
      const [technicianDetails, orderDetails, orderStatus] = await Promise.all([
        this._messageRepository.getTechnicianDetails(technicianId),
        this._messageRepository.getOrderServiceName(orderId),
        this._messageRepository.getOrderStatus(orderId),
      ]);

      console.log(`✅ Fetched data for snapshot:`, {
        technicianDetails,
        orderDetails,
        orderStatus,
      });

      // Determine the best service name to use
      let serviceName = 'Service';

      // Priority 1: Order service name
      if (orderDetails && orderDetails !== 'Service') {
        serviceName = orderDetails;
      }
      // Priority 2: Technician's service name
      else if (technicianDetails?.serviceName) {
        serviceName = technicianDetails.serviceName;
      }

      const snapshot = {
        displayName: technicianDetails?.displayName || 'Technician',
        profilePictureUrl: technicianDetails?.profilePictureUrl || '',
        serviceName: serviceName,
        orderStatus: orderStatus || undefined,
      };

      console.log(`✅ Final technician snapshot:`, snapshot);
      return snapshot;
    } catch (error) {
      console.error('❌ Error creating technician snapshot:', error);
      // Return meaningful fallback data
      return {
        displayName: 'Technician',
        profilePictureUrl: '',
        serviceName: 'Service',
        orderStatus: undefined,
      };
    }
  }

  // In MessageService.ts - DEBUG initializeChatRoom
  async initializeChatRoom(
    orderId: string,
    userId: string,
    technicianId: string
  ): Promise<IMessageRoom> {
    try {
      console.log('🔄 Initializing chat room for order:', orderId);

      // First try to find existing room
      let room = await this._messageRepository.getRoomByOrder(orderId);

      if (room) {
        console.log('✅ Found existing room for order:', orderId);
        console.log(
          '🔍 Existing room technicianSnapshot:',
          room.technicianSnapshot
        );
        return room;
      }

      console.log('🆕 Creating new room for order:', orderId);

      // DEBUG: Check what getTechnicianSnapshot returns
      const technicianSnapshot = await this.getTechnicianSnapshot(
        technicianId,
        orderId
      );
      console.log(
        '🔍 Technician snapshot before room creation:',
        technicianSnapshot
      );

      // Create new room with technician snapshot
      room = await this._messageRepository.createRoom({
        orderId,
        userId,
        technicianId,
        technicianSnapshot, // Make sure this includes all fields
        isActive: true,
      });

      console.log('✅ Chat room initialized with ID:', room._id);
      console.log(
        '🔍 Room after creation technicianSnapshot:',
        room.technicianSnapshot
      );

      return room;
    } catch (error: any) {
      console.error('❌ Error initializing chat room:', error);

      // If it's a duplicate error, try to get the existing room
      if (error.code === 11000 || error.code === 11001) {
        console.log('🔄 Duplicate room detected, fetching existing room');
        const existingRoom =
          await this._messageRepository.getRoomByOrder(orderId);
        if (existingRoom) {
          return existingRoom;
        }
      }

      throw new Error(`Failed to initialize chat room: ${error.message}`);
    }
  }

  async closeChatRoom(orderId: string): Promise<void> {
    await this._messageRepository.deactivateRoom(orderId);
  }

  async getUnreadCount(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<number> {
    const rooms = await this._messageRepository.getRoomsByUser(
      userId,
      userType
    );
    return rooms.reduce((total, room) => {
      return (
        total +
        (userType === 'user'
          ? room.unreadCount.user
          : room.unreadCount.technician)
      );
    }, 0);
  }
}
