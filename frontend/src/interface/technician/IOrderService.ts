import type { OrderHistory, OrderItem, PaymentInfo } from "../../features/serviceProvider/components/technicianProfile/dashboard/types";

export interface TechnicianOrderUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface TechnicianOrderAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}


export interface TechnicianOrder {
  _id: string;
  orderCode: string;
  userId: TechnicianOrderUser | string;
  serviceName: string;
  problemDescription: string;
  address: TechnicianOrderAddress;
  scheduledAt: string;
  timeSlot: string;
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "refunded"
    | "accepted"
    | "on_the_way";
  totalAmount: number;
  payment: PaymentInfo;
  orderItems?: OrderItem[];
  history: OrderHistory[];
  createdAt: string;
  updatedAt: string;
  cancellation?: {
    reason: string;
    cancelledBy: string;
    cancelledAt: string;
    refundAmount?: number;
  };
  rescheduleInfo?: {
    rescheduledAt: string;
    rescheduledBy: string;
    previousScheduledAt: string;
    previousTimeSlot: string;
    rescheduleCount: number;
    reason?: string;
  };
}

export interface TechnicianOrderListResponse {
  success: boolean;
  message: string;
  data: {
    orders: TechnicianOrder[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface TechnicianOrderStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  monthlyEarnings: number;
}

export interface TechnicianOrderStatsResponse {
  success: boolean;
  message: string;
  data: TechnicianOrderStats;
}

export interface UpdateOrderStatusRequest {
  status: string;
  reason?: string;
}
