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
import UserSchema from '../../models/UserSchema';

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

  async markAllMessagesAsRead(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<number> {
    try {
      // Mark all unread messages as read
      const result = await Message.updateMany(
        {
          receiverId: userId,
          receiverType: userType,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      ).exec();

      return result.modifiedCount;
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      throw error;
    }
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

  async createRoom(roomData: IMessageRoomCreate): Promise<IMessageRoom> {
    try {
      const roomDataToSave = {
        ...roomData,

        // Handle userSnapshot
        userSnapshot: roomData.userSnapshot
          ? {
              fullName: String(roomData.userSnapshot.fullName || 'Customer'),
              profilePictureUrl: String(
                roomData.userSnapshot.profilePictureUrl || ''
              ),
              phone: String(roomData.userSnapshot.phone || ''),
            }
          : {
              fullName: 'Customer',
              profilePictureUrl: '',
              phone: '',
            },

        // Handle technicianSnapshot
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

      const room = new MessageRoom(roomDataToSave);
      const savedRoom = await room.save();

      return this.mapRoomToDomain(savedRoom);
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async getRoomByOrder(orderId: string): Promise<IMessageRoom | null> {
    try {
      const room = await MessageRoom.findOne({ orderId }).exec();
      if (room) {
        return this.mapRoomToDomain(room);
      }
      return null;
    } catch (error) {
      console.error('Error finding room by order:', error);
      return null;
    }
  }

  async getRoomsByUser(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<IMessageRoom[]> {
    try {
      const query =
        userType === 'user'
          ? { userId, isActive: true }
          : { technicianId: userId, isActive: true };

      const rooms = await MessageRoom.find(query)
        .populate(
          'userId',
          'fullName email phone profilePicture profilePictureUrl'
        )
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      return rooms.map(this.mapRoomToDomain);
    } catch (error) {
      console.error(`Error fetching rooms for ${userType}:`, error);
      throw error;
    }
  }

  async updateRoom(
    orderId: string,
    updateData: IMessageRoomUpdate
  ): Promise<IMessageRoom | null> {
    try {
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

      // Handle userSnapshot field by field
      if (updateData.userSnapshot) {
        if (updateData.userSnapshot.fullName !== undefined) {
          updateObject['userSnapshot.fullName'] =
            updateData.userSnapshot.fullName;
        }
        if (updateData.userSnapshot.profilePictureUrl !== undefined) {
          updateObject['userSnapshot.profilePictureUrl'] =
            updateData.userSnapshot.profilePictureUrl;
        }
        if (updateData.userSnapshot.phone !== undefined) {
          updateObject['userSnapshot.phone'] = updateData.userSnapshot.phone;
        }
      }

      // Handle technicianSnapshot field by field
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

      const room = await MessageRoom.findOneAndUpdate(
        { orderId },
        { $set: updateObject },
        { new: true }
      ).exec();

      return room ? this.mapRoomToDomain(room) : null;
    } catch (error) {
      console.error('Error updating room:', error);
      return null;
    }
  }

  async syncOrderStatusWithRoom(orderId: string): Promise<IMessageRoom | null> {
    try {
      const orderStatus = await this.getOrderStatus(orderId);
      if (orderStatus) {
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
        // If room exists but missing user details, update it
        if (!room.userSnapshot || !room.userSnapshot.fullName) {
          const userDetails = await this.getUserDetails(userId);

          if (userDetails) {
            const updatedRoom = await this.updateRoom(orderId, {
              userSnapshot: {
                fullName: userDetails.fullName,
                profilePictureUrl: userDetails.profilePictureUrl,
                phone: userDetails.phone,
              },
            });

            if (updatedRoom) {
              room = updatedRoom;
            }
          }
        }

        // If room exists but missing technician details, update it
        if (!room.technicianSnapshot || !room.technicianSnapshot.displayName) {
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

            if (updatedRoom) {
              room = updatedRoom;
            }
          }
        }

        return room;
      }

      // Get both user and technician details BEFORE creating room
      const [userDetails, technicianDetails] = await Promise.all([
        this.getUserDetails(userId),
        this.getTechnicianDetails(technicianId),
      ]);

      const orderServiceName = await this.getOrderServiceName(orderId);
      const orderStatus = await this.getOrderStatus(orderId);

      // Create new room with complete snapshots
      const newRoom = await this.createRoom({
        orderId,
        userId,
        technicianId,
        userSnapshot: {
          fullName: userDetails?.fullName || 'Customer',
          profilePictureUrl: userDetails?.profilePictureUrl || '',
          phone: userDetails?.phone || '',
        },
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

      return newRoom;
    } catch (error: any) {
      console.error('Error in getOrCreateRoom:', error);

      // If it's a duplicate key error, try to fetch the existing room
      if (error.code === 11000 || error.code === 11001) {
        const existingRoom = await this.getRoomByOrder(orderId);
        if (existingRoom) {
          return existingRoom;
        }
      }
      throw error;
    }
  }

  async getTechnicianDetails(technicianId: string): Promise<{
    displayName: string;
    profilePictureUrl: string;
    serviceName?: string;
  } | null> {
    try {
      const technician = await Technician.findById(technicianId)
        .select('displayName profilePictureUrl services specialization')
        .lean()
        .exec();

      if (!technician) {
        console.warn(`Technician not found with ID: ${technicianId}`);
        return null;
      }

      let serviceName = 'General Service';
      if (technician.services && technician.services.length > 0) {
        serviceName = technician.services[0];
      }

      const result = {
        displayName: technician.displayName || 'Technician',
        profilePictureUrl: technician.profilePictureUrl || '',
        serviceName: serviceName,
      };

      return result;
    } catch (error) {
      console.error(
        `Error fetching technician details for ${technicianId}:`,
        error
      );
      return null;
    }
  }

  async getOrderServiceName(orderId: string): Promise<string> {
    try {
      const order = await OrderSchema.findById(orderId)
        .select('serviceName problemDescription')
        .exec();

      if (!order) {
        console.warn(`Order not found with ID: ${orderId}`);
        return 'Service';
      }

      return order.serviceName || 'Service';
    } catch (error) {
      console.error(`Error fetching order service name for ${orderId}:`, error);
      return 'Service';
    }
  }
  async getOrderStatus(orderId: string): Promise<string | null> {
    try {
      const order = await OrderSchema.findById(orderId).select('status').exec();

      return order?.status || null;
    } catch (error) {
      console.error(`Error fetching order status for ${orderId}:`, error);
      return null;
    }
  }

  async getUserDetails(userId: string): Promise<{
    fullName: string;
    profilePictureUrl: string;
    phone: string;
  } | null> {
    try {
      const user = await UserSchema.findById(userId)
        .select('fullName profilePictureUrl phone')
        .lean()
        .exec();

      if (!user) {
        console.warn(`User not found with ID: ${userId}`);
        return null;
      }

      const result = {
        fullName: user.fullName || 'Customer',
        profilePictureUrl: user.profilePictureUrl || '',
        phone: user.phone || '',
      };

      return result;
    } catch (error) {
      console.error(`Error fetching user details for ${userId}:`, error);
      return null;
    }
  }

  async getTechnicianIdByUserId(userId: string): Promise<string | null> {
    try {
      const technician = await Technician.findOne({ userId })
        .select('_id')
        .lean()
        .exec();

      if (!technician) {
        console.warn(`No technician found for user ID: ${userId}`);
        return null;
      }

      const technicianId = technician._id.toString();

      return technicianId;
    } catch (error) {
      console.error(`Error finding technician ID for user ${userId}:`, error);
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

  private mapRoomToDomain(doc: any): IMessageRoom {
    const roomDoc = doc.toObject ? doc.toObject() : doc;

    let userId: string;
    if (typeof roomDoc.userId === 'string') {
      // If userId is already a string (not populated)
      userId = roomDoc.userId;
    } else if (roomDoc.userId && typeof roomDoc.userId === 'object') {
      // If userId is a populated object, extract the _id
      userId =
        (roomDoc.userId as any)._id?.toString() || roomDoc.userId.toString();
    } else {
      // Fallback
      userId = roomDoc.userId?.toString() || '';
    }

    let userSnapshot = undefined;
    if (roomDoc.userSnapshot) {
      userSnapshot = {
        fullName: String(roomDoc.userSnapshot.fullName || 'Customer'),
        profilePictureUrl: String(roomDoc.userSnapshot.profilePictureUrl || ''),
        phone: String(roomDoc.userSnapshot.phone || ''),
      };
    } else {
      console.warn('No userSnapshot found for room:', roomDoc._id);
    }

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
      console.warn('No technicianSnapshot found for room:', roomDoc._id);
    }

    const result = {
      _id: roomDoc._id?.toString() || '',
      orderId: roomDoc.orderId?.toString() || '',
      userId: userId,
      technicianId: roomDoc.technicianId?.toString() || '',
      userSnapshot: userSnapshot,
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

    return result;
  }
}
