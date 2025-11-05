import { Types } from "mongoose";

export interface IOrderItem {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  serviceItemId?: Types.ObjectId;
  customName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  addedBy: Types.ObjectId;
  status: "requested" | "accepted" | "approved" | "rejected" | "purchased";
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  orderCode: string;
  serviceName: string;
  problemDescription?: string;
  scheduledAt: Date;
  timeSlot: string;
  address: {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  status:
    | "pending"
    | "accepted"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "refunded";
  payment: {
    method: "online" | "cod";
    amount: number;
    status: "pending" | "paid" | "failed" | "refunded";
    transactionId?: string;
    paidAt?: Date;
  };
  orderItems: IOrderItem[];
  totalAmount: number;
  technicianRating?: number;
  userReview?: string;
  cancellation?: {
    reason: string;
    cancelledBy: "user" | "technician" | "admin";
    cancelledAt: Date;
    refundAmount?: number;
  };
  history: Array<{
    status: string;
    description: string;
    updatedBy: "user" | "technician" | "system";
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderResponseDto {
  _id: string;
  orderCode: string;
  bookingId: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  technicianId: {
    _id: string;
    displayName: string;
    profilePictureUrl?: string;
    averageRating: number;
    ratingCount: number;
    skills: string[];
  };
  serviceName: string;
  problemDescription?: string;
  scheduledAt: string;
  timeSlot: string;
  address: {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  status: string;
  payment: {
    method: string;
    amount: number;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  orderItems: Array<{
    _id: string;
    customName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    status: string;
  }>;
  totalAmount: number;
  technicianRating?: number;
  userReview?: string;
  history: Array<{
    status: string;
    description: string;
    updatedBy: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponseDto {
  orders: OrderResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
