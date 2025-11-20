import { IMessage, IMessageCreate } from '../../user/IMessage';
import {
  IMessageRoom,
  IMessageRoomCreate,
  IMessageRoomUpdate,
} from '../../user/IMessageRoom';

export interface IMessageRepository {
  // Message methods
  createMessage(messageData: IMessageCreate): Promise<IMessage>;
  getMessagesByOrder(
    orderId: string,
    limit?: number,
    before?: Date
  ): Promise<IMessage[]>;
  markMessagesAsRead(
    orderId: string,
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<number>;
  getUnreadCount(
    orderId: string,
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<number>;

  // Room methods
  createRoom(roomData: IMessageRoomCreate): Promise<IMessageRoom>;
  getRoomByOrder(orderId: string): Promise<IMessageRoom | null>;
  getRoomsByUser(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<IMessageRoom[]>;
  updateRoom(
    orderId: string,
    updateData: IMessageRoomUpdate
  ): Promise<IMessageRoom | null>;
  deactivateRoom(orderId: string): Promise<IMessageRoom | null>;

  // Utility methods
  getOrCreateRoom(
    orderId: string,
    userId: string,
    technicianId: string
  ): Promise<IMessageRoom>;

  getTechnicianDetails(technicianId: string): Promise<{
    displayName: string;
    profilePictureUrl: string;
    serviceName?: string;
  } | null>;
  getOrderServiceName(orderId: string): Promise<string>;
  getOrderStatus(orderId: string): Promise<string | null>;

  syncOrderStatusWithRoom(orderId: string): Promise<IMessageRoom | null>;
}
