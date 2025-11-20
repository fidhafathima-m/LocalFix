export interface IMessageRoom {
  _id?: string;
  orderId: string;
  userId: string;
  technicianId: string;
  technicianSnapshot?: {
    displayName: string;
    profilePictureUrl: string;
    serviceName: string;
    orderStatus?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: {
    message: string;
    timestamp: Date;
    senderId: string;
    senderType: 'user' | 'technician';
  };
  unreadCount: {
    user: number;
    technician: number;
  };
}

export interface IMessageRoomCreate {
  orderId: string;
  userId: string;
  technicianId: string;
  technicianSnapshot?: {
    displayName: string;
    profilePictureUrl: string;
    serviceName: string;
    orderStatus?: string;
  };
  isActive: boolean;
}

export interface IMessageRoomUpdate {
  isActive?: boolean;
  lastMessage?: {
    message: string;
    timestamp: Date;
    senderId: string;
    senderType: 'user' | 'technician';
  };
  unreadCount?: {
    user: number;
    technician: number;
  };
  technicianSnapshot?: {
    displayName?: string | undefined;
    profilePictureUrl?: string | undefined;
    serviceName?: string | undefined;
    orderStatus?: string;
  };
  orderStatus?: string;
}
