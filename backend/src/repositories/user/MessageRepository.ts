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

  // In MessageRepository.ts - FIX createRoom method
  // In MessageRepository.ts - IMPROVE createRoom method
  async createRoom(roomData: IMessageRoomCreate): Promise<IMessageRoom> {
    try {
      console.log(
        '💾 Creating room with data:',
        JSON.stringify(roomData, null, 2)
      );

      // Ensure technicianSnapshot has all required fields with proper values
      const roomDataToSave = {
        ...roomData,
        technicianSnapshot: roomData.technicianSnapshot
          ? {
              displayName: String(
                roomData.technicianSnapshot.displayName || 'Technician'
              ),
              profilePictureUrl: String(
                roomData.technicianSnapshot.profilePictureUrl || ''
              ),
              serviceName: String(
                roomData.technicianSnapshot.serviceName || 'Service'
              ),
              orderStatus: roomData.technicianSnapshot.orderStatus
                ? String(roomData.technicianSnapshot.orderStatus)
                : undefined,
            }
          : {
              displayName: 'Technician',
              profilePictureUrl: '',
              serviceName: 'Service',
              orderStatus: undefined,
            },
        unreadCount: roomData.unreadCount || {
          user: 0,
          technician: 0,
        },
      };

      console.log(
        '💾 Room data to save:',
        JSON.stringify(roomDataToSave, null, 2)
      );

      const room = new MessageRoom(roomDataToSave);
      const savedRoom = await room.save();

      console.log('✅ Room saved successfully:', savedRoom._id);
      console.log(
        '🔍 Saved room technicianSnapshot:',
        savedRoom.technicianSnapshot
      );

      // Verify the saved data
      const verifiedRoom = await MessageRoom.findById(savedRoom._id);
      console.log(
        '🔍 Verified room from DB:',
        verifiedRoom?.technicianSnapshot
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

  // In MessageRepository.ts - IMPROVE getRoomsByUser method
  async getRoomsByUser(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<IMessageRoom[]> {
    const query =
      userType === 'user'
        ? { userId, isActive: true }
        : { technicianId: userId, isActive: true };

    const rooms = await MessageRoom.find(query)
      .sort({ updatedAt: -1 })
      .lean() // Use lean for better performance
      .exec();

    console.log(`🔍 Found ${rooms.length} rooms for ${userType}: ${userId}`);

    rooms.forEach((room, index) => {
      console.log(
        `🔍 Room ${index + 1} technicianSnapshot:`,
        room.technicianSnapshot
      );
    });

    return rooms.map(this.mapRoomToDomain);
  }

  // In MessageRepository.ts - FIX THE updateRoom method
  async updateRoom(
    orderId: string,
    updateData: IMessageRoomUpdate
  ): Promise<IMessageRoom | null> {
    try {
      console.log('🔄 Updating room for order:', orderId);
      console.log('📝 Update data:', JSON.stringify(updateData, null, 2));

      // Build the update object carefully to avoid overwriting
      const updateObject: any = {};

      // Handle individual fields instead of entire objects
      if (updateData.lastMessage) {
        updateObject.lastMessage = updateData.lastMessage;
      }

      if (updateData.unreadCount) {
        updateObject.unreadCount = updateData.unreadCount;
      }

      if (updateData.isActive !== undefined) {
        updateObject.isActive = updateData.isActive;
      }

      if (updateData.orderStatus) {
        updateObject.orderStatus = updateData.orderStatus;
      }

      // ✅ CRITICAL FIX: Handle technicianSnapshot field by field
      if (updateData.technicianSnapshot) {
        if (updateData.technicianSnapshot.displayName !== undefined) {
          updateObject['technicianSnapshot.displayName'] =
            updateData.technicianSnapshot.displayName;
        }
        if (updateData.technicianSnapshot.profilePictureUrl !== undefined) {
          updateObject['technicianSnapshot.profilePictureUrl'] =
            updateData.technicianSnapshot.profilePictureUrl;
        }
        if (updateData.technicianSnapshot.serviceName !== undefined) {
          updateObject['technicianSnapshot.serviceName'] =
            updateData.technicianSnapshot.serviceName;
        }
        if (updateData.technicianSnapshot.orderStatus !== undefined) {
          updateObject['technicianSnapshot.orderStatus'] =
            updateData.technicianSnapshot.orderStatus;
        }
      }

      console.log(
        '🔄 Final update object:',
        JSON.stringify(updateObject, null, 2)
      );

      const room = await MessageRoom.findOneAndUpdate(
        { orderId },
        { $set: updateObject },
        { new: true }
      ).exec();

      if (room) {
        console.log('✅ Room updated successfully');
        console.log('🔍 Updated technicianSnapshot:', room.technicianSnapshot);
      }

      return room ? this.mapRoomToDomain(room) : null;
    } catch (error) {
      console.error('❌ Error updating room:', error);
      return null;
    }
  }

  // In MessageRepository.ts - FIX syncOrderStatusWithRoom method
  async syncOrderStatusWithRoom(orderId: string): Promise<IMessageRoom | null> {
    try {
      const orderStatus = await this.getOrderStatus(orderId);
      if (orderStatus) {
        console.log('🔄 Syncing order status for room:', {
          orderId,
          orderStatus,
        });

        // Use field-level update to only update orderStatus
        const room = await MessageRoom.findOneAndUpdate(
          { orderId },
          {
            $set: {
              'technicianSnapshot.orderStatus': orderStatus,
              orderStatus: orderStatus,
            },
          },
          { new: true }
        ).exec();

        if (room) {
          console.log('✅ Order status synced successfully');
          console.log('🔍 Room after sync:', room.technicianSnapshot);
        }

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

        // If room exists but missing technician details, update it
        if (!room.technicianSnapshot || !room.technicianSnapshot.displayName) {
          console.log(
            '🔄 Room exists but missing technician details, updating...'
          );
          const technicianDetails =
            await this.getTechnicianDetails(technicianId);
          const orderServiceName = await this.getOrderServiceName(orderId);
          const orderStatus = await this.getOrderStatus(orderId);

          if (technicianDetails) {
            const updatedRoom = await this.updateRoom(orderId, {
              technicianSnapshot: {
                displayName: technicianDetails.displayName,
                profilePictureUrl: technicianDetails.profilePictureUrl,
                serviceName: orderServiceName,
                orderStatus: orderStatus || undefined,
              },
            });

            // Only assign if update was successful and room is not null
            if (updatedRoom) {
              room = updatedRoom;
            }
          }
        }

        return room;
      }

      console.log('🆕 Creating new room for order:', orderId);

      // Get technician details BEFORE creating room
      const technicianDetails = await this.getTechnicianDetails(technicianId);
      const orderServiceName = await this.getOrderServiceName(orderId);
      const orderStatus = await this.getOrderStatus(orderId);

      console.log('🔍 Technician details for new room:', {
        technicianDetails,
        orderServiceName,
        orderStatus,
      });

      // Create new room with complete technicianSnapshot
      const newRoom = await this.createRoom({
        orderId,
        userId,
        technicianId,
        technicianSnapshot: {
          displayName: technicianDetails?.displayName || 'Technician',
          profilePictureUrl: technicianDetails?.profilePictureUrl || '',
          serviceName: orderServiceName,
          orderStatus: orderStatus || undefined,
        },
        isActive: true,
        unreadCount: {
          user: 0,
          technician: 0,
        },
      });

      console.log('✅ New room created with technician snapshot');
      return newRoom;
    } catch (error: any) {
      console.error('❌ Error in getOrCreateRoom:', error);

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

  // In MessageRepository.ts - FIX mapRoomToDomain method
  private mapRoomToDomain(doc: any): IMessageRoom {
    // Handle both Document and plain objects from lean()
    const roomDoc = doc.toObject ? doc.toObject() : doc;

    // DEBUG: Log what we're actually getting
    console.log('🔍 Mapping room to domain:', {
      id: roomDoc._id,
      hasTechnicianSnapshot: !!roomDoc.technicianSnapshot,
      technicianSnapshot: roomDoc.technicianSnapshot,
    });

    // Ensure technicianSnapshot has proper structure
    let technicianSnapshot = undefined;
    if (roomDoc.technicianSnapshot) {
      technicianSnapshot = {
        displayName: String(
          roomDoc.technicianSnapshot.displayName || 'Technician'
        ),
        profilePictureUrl: String(
          roomDoc.technicianSnapshot.profilePictureUrl || ''
        ),
        serviceName: String(
          roomDoc.technicianSnapshot.serviceName || 'Service'
        ),
        orderStatus: roomDoc.technicianSnapshot.orderStatus
          ? String(roomDoc.technicianSnapshot.orderStatus)
          : undefined,
      };
    } else {
      console.warn('⚠️ No technicianSnapshot found for room:', roomDoc._id);
    }

    const result = {
      _id: roomDoc._id?.toString() || '',
      orderId: roomDoc.orderId?.toString() || '',
      userId: roomDoc.userId?.toString() || '',
      technicianId: roomDoc.technicianId?.toString() || '',
      technicianSnapshot: technicianSnapshot,
      isActive: roomDoc.isActive !== false, // Default to true if not set
      createdAt: roomDoc.createdAt || new Date(),
      updatedAt: roomDoc.updatedAt || new Date(),
      lastMessage: roomDoc.lastMessage
        ? {
            message: String(roomDoc.lastMessage.message || ''),
            timestamp: roomDoc.lastMessage.timestamp || new Date(),
            senderId: roomDoc.lastMessage.senderId?.toString() || '',
            senderType: roomDoc.lastMessage.senderType as 'user' | 'technician',
          }
        : undefined,
      unreadCount: {
        user: Number(roomDoc.unreadCount?.user || 0),
        technician: Number(roomDoc.unreadCount?.technician || 0),
      },
      orderStatus:
        roomDoc.orderStatus || roomDoc.technicianSnapshot?.orderStatus,
    };

    console.log('✅ Mapped room result:', {
      id: result._id,
      technicianName: result.technicianSnapshot?.displayName,
      serviceName: result.technicianSnapshot?.serviceName,
      orderStatus: result.technicianSnapshot?.orderStatus,
    });

    return result;
  }
}
