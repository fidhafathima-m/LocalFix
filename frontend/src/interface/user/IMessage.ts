export interface IMessage {
  _id?: string;
  orderId: string;
  senderId: string;
  senderType: "user" | "technician";
  receiverId: string;
  receiverType: "user" | "technician";
  message: string;
  messageType: "text" | "image" | "file" | "system";
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface IMessageCreate {
  orderId: string;
  senderId: string;
  senderType: "user" | "technician";
  receiverId: string;
  receiverType: "user" | "technician";
  message: string;
  messageType?: "text" | "image" | "file" | "system";
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface IMessageUpdate {
  isRead?: boolean;
  readAt?: Date;
}
