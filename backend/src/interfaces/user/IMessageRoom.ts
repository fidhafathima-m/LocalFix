export interface IMessageRoom {
  _id: string;
  orderId: string;
  userId: string;
  technicianId: string;

  userSnapshot?: {
    fullName: string;
    profilePictureUrl: string;
    phone: string;
  };

  technicianSnapshot?: {
    displayName: string;
    profilePictureUrl: string;
    serviceName: string;
    orderStatus?: string;
  };

  isActive: boolean;
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
  orderStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageRoomCreate {
  orderId: string;
  userId: string;
  technicianId: string;

  userSnapshot?: {
    fullName: string;
    profilePictureUrl: string;
    phone: string;
  };

  technicianSnapshot?: {
    displayName: string;
    profilePictureUrl: string;
    serviceName: string;
    orderStatus?: string;
  };

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
}

export interface IMessageRoomUpdate {
  userSnapshot?: {
    fullName?: string;
    profilePictureUrl?: string;
    phone?: string;
  };

  technicianSnapshot?: {
    displayName?: string;
    profilePictureUrl?: string;
    serviceName?: string;
    orderStatus?: string;
  };

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
  orderStatus?: string;
}
