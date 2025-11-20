import { IMessage, IMessageCreate } from '../../user/IMessage';
import { IMessageRoom } from '../../user/IMessageRoom';

export interface IMessageService {
  sendMessage(messageData: IMessageCreate): Promise<IMessage>;
  getOrderMessages(orderId: string, limit?: number): Promise<IMessage[]>;
  getConversations(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<IMessageRoom[]>;
  markConversationAsRead(
    orderId: string,
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<void>;
  initializeChatRoom(
    orderId: string,
    userId: string,
    technicianId: string
  ): Promise<IMessageRoom>;
  closeChatRoom(orderId: string): Promise<void>;
  getUnreadCount(
    userId: string,
    userType: 'user' | 'technician'
  ): Promise<number>;
  syncOrderStatusWithRoom(orderId: string): Promise<void>;
}
