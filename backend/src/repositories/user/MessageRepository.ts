import { IMessageRepository } from '../../interfaces/repository/user/IMessageRepository';
import { IMessage, IMessageCreate } from '../../interfaces/user/IMessage';
import {
  IMessageRoom,
  IMessageRoomCreate,
  IMessageRoomUpdate,
} from '../../interfaces/user/IMessageRoom';
import {
  IMessageRoomDocument,
  MessageRoom,
} from '../../models/MessageRoomSchema';
import { IMessageDocument, Message } from '../../models/MessageSchema';
import OrderSchema from '../../models/OrderSchema';
import { Technician } from '../../models/technician/TechnicianSchema';

export class MessageRepository implements IMessageRepository {
  // Message Methods
  async createMessage(messageData: IMessageCreate): Promise<IMessage> {
    const message = new Message(messageData);
    const savedMessage = await message.save();
    return this.mapMessageToDomain(savedMessage);
  }

  async getMessagesByOrder(
    orderId: string,
    limit: number = 50,
    before?: Date
  ): Promise<IMessage[]> {
    let query = Message.find({ orderId }).sort({ timestamp: -1 }).limit(limit);

    if (before) {
      query = query.where('timestamp').lt(before.getTime());
    }

    const messages = await query.exec();
    return messages.map(this.mapMessageToDomain).reverse();
  }

  async markMessagesAsRead(
    orderId: string,
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<number> {
    const result = await Message.updateMany(
      {
        orderId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    ).exec();

    return result.modifiedCount;
  }

  async getUnreadCount(
    orderId: string,
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<number> {
    return Message.countDocuments({
      orderId,
      receiverId: userId,
      isRead: false,
    });
  }

  // Room Methods
  // In MessageRepository.ts - FIX createRoom method
  async createRoom(roomData: IMessageRoomCreate): Promise<IMessageRoom> {
    try {
      console.log('💾 Creating room with data:', roomData);

      const room = new MessageRoom(roomData);
      const savedRoom = await room.save();

      console.log('✅ Room saved successfully:', savedRoom._id);
      console.log(
        '🔍 Saved room technicianSnapshot:',
        savedRoom.technicianSnapshot
      );

      return this.mapRoomToDomain(savedRoom);
    } catch (error) {
      console.error('❌ Error creating room:', error);
      throw error;
    }
  }

  // In MessageRepository.ts - update getRoomByOrder method
  async getRoomByOrder(orderId: string): Promise<IMessageRoom | null> {
    try {
      const room = await MessageRoom.findOne({ orderId }).exec();
      if (room) {
        console.log('🔍 Found room for order:', orderId);
        return this.mapRoomToDomain(room);
      }
      console.log('🔍 No room found for order:', orderId);
      return null;
    } catch (error) {
      console.error('❌ Error finding room by order:', error);
      return null;
    }
  }

  // In MessageRepository.ts - fix getRoomsByUser method
  async getRoomsByUser(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<IMessageRoom[]> {
    const query =
      userType === 'user'
        ? { userId, isActive: true }
        : { technicianId: userId, isActive: true };

    // Remove populate to get clean ObjectId strings
    const rooms = await MessageRoom.find(query).sort({ updatedAt: -1 }).exec();

    return rooms.map(this.mapRoomToDomain);
  }

  async updateRoom(
    orderId: string,
    updateData: IMessageRoomUpdate
  ): Promise<IMessageRoom | null> {
    // If updating lastMessage, also fetch current order status
    if (updateData.lastMessage) {
      try {
        const currentOrderStatus = await this.getOrderStatus(orderId);
        if (currentOrderStatus) {
          updateData.technicianSnapshot = {
            ...updateData.technicianSnapshot,
            orderStatus: currentOrderStatus,
          };
        }
      } catch (error) {
        console.error('Error fetching order status for room update:', error);
      }
    }

    const room = await MessageRoom.findOneAndUpdate(
      { orderId },
      { $set: updateData },
      { new: true }
    ).exec();

    return room ? this.mapRoomToDomain(room) : null;
  }

  // Add a method to sync order status with room
  async syncOrderStatusWithRoom(orderId: string): Promise<IMessageRoom | null> {
    try {
      const orderStatus = await this.getOrderStatus(orderId);
      if (orderStatus) {
        const room = await MessageRoom.findOneAndUpdate(
          { orderId },
          {
            $set: {
              'technicianSnapshot.orderStatus': orderStatus,
              orderStatus: orderStatus, // Also store at root level for easy access
            },
          },
          { new: true }
        ).exec();
        return room ? this.mapRoomToDomain(room) : null;
      }
      return null;
    } catch (error) {
      console.error('Error syncing order status with room:', error);
      return null;
    }
  }

  async deactivateRoom(orderId: string): Promise<IMessageRoom | null> {
    return this.updateRoom(orderId, { isActive: false });
  }

  // In MessageRepository.ts - fix getOrCreateRoom method
  async getOrCreateRoom(
    orderId: string,
    userId: string,
    technicianId: string
  ): Promise<IMessageRoom> {
    try {
      // First try to find existing room
      let room = await this.getRoomByOrder(orderId);

      if (room) {
        console.log('✅ Found existing room for order:', orderId);
        return room;
      }

      console.log('🆕 Creating new room for order:', orderId);

      // Create new room
      room = await this.createRoom({
        orderId,
        userId,
        technicianId,
        isActive: true,
      });

      return room;
    } catch (error: any) {
      // If it's a duplicate key error, try to fetch the existing room
      if (error.code === 11000 || error.code === 11001) {
        console.log('🔄 Duplicate key detected, fetching existing room');
        const existingRoom = await this.getRoomByOrder(orderId);
        if (existingRoom) {
          return existingRoom;
        }
      }
      throw error;
    }
  }

  // In MessageRepository.ts - COMPLETELY REWRITE getTechnicianDetails
  async getTechnicianDetails(technicianId: string): Promise<{
    displayName: string;
    profilePictureUrl: string;
    serviceName?: string;
  } | null> {
    try {
      console.log(`🔍 Fetching technician details for ID: ${technicianId}`);

      // Use lean() for better performance and to get plain JavaScript objects
      const technician = await Technician.findById(technicianId)
        .select('displayName profilePictureUrl services specialization')
        .lean()
        .exec();

      if (!technician) {
        console.warn(`❌ Technician not found with ID: ${technicianId}`);
        return null;
      }

      console.log(
        `✅ Raw technician data:`,
        JSON.stringify(technician, null, 2)
      );

      // Extract service name - handle various possible fields
      let serviceName = 'General Service';
      if (technician.services && technician.services.length > 0) {
        serviceName = technician.services[0];
      }

      const result = {
        displayName: technician.displayName || 'Technician',
        profilePictureUrl: technician.profilePictureUrl || '',
        serviceName: serviceName,
      };

      console.log(`✅ Processed technician details:`, result);
      return result;
    } catch (error) {
      console.error(
        `❌ Error fetching technician details for ${technicianId}:`,
        error
      );
      return null;
    }
  }
  // In MessageRepository.ts - improve getOrderServiceName
  async getOrderServiceName(orderId: string): Promise<string> {
    try {
      const order = await OrderSchema.findById(orderId)
        .select('serviceName problemDescription')
        .exec();

      if (!order) {
        console.warn(`❌ Order not found with ID: ${orderId}`);
        return 'Service';
      }

      console.log(`✅ Order service details:`, {
        serviceName: order.serviceName,
        problemDescription: order.problemDescription,
      });

      return order.serviceName || 'Service';
    } catch (error) {
      console.error(
        `❌ Error fetching order service name for ${orderId}:`,
        error
      );
      return 'Service';
    }
  }
  async getOrderStatus(orderId: string): Promise<string | null> {
    try {
      const order = await OrderSchema.findById(orderId).select('status').exec();

      return order?.status || null;
    } catch (error) {
      console.error(`❌ Error fetching order status for ${orderId}:`, error);
      return null;
    }
  }

  // Mappers
  private mapMessageToDomain(doc: IMessageDocument): IMessage {
    return {
      _id: doc.id.toString(),
      orderId: doc.orderId.toString(),
      senderId: doc.senderId.toString(),
      senderType: doc.senderType,
      receiverId: doc.receiverId.toString(),
      receiverType: doc.receiverType,
      message: doc.message,
      messageType: doc.messageType,
      timestamp: doc.timestamp,
      isRead: doc.isRead,
      readAt: doc.readAt,
      metadata: doc.metadata,
    };
  }

  private mapRoomToDomain(doc: IMessageRoomDocument): IMessageRoom {
    // Handle technicianSnapshot safely
    let technicianSnapshot = undefined;
    if (doc.technicianSnapshot) {
      technicianSnapshot = {
        displayName:
          doc.technicianSnapshot.displayName?.toString() || 'Technician',
        profilePictureUrl:
          doc.technicianSnapshot.profilePictureUrl?.toString() || '',
        serviceName:
          doc.technicianSnapshot.serviceName?.toString() || 'Service',
        orderStatus: doc.technicianSnapshot.orderStatus?.toString(),
      };
    }

    return {
      _id: doc._id?.toString() || '',
      orderId: doc.orderId?.toString() || '',
      userId: doc.userId?.toString() || '',
      technicianId: doc.technicianId?.toString() || '',
      technicianSnapshot: technicianSnapshot,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      lastMessage: doc.lastMessage
        ? {
            message: doc.lastMessage.message,
            timestamp: doc.lastMessage.timestamp,
            senderId: doc.lastMessage.senderId?.toString() || '',
            senderType: doc.lastMessage.senderType,
          }
        : undefined,
      unreadCount: doc.unreadCount,
    };
  }
}
