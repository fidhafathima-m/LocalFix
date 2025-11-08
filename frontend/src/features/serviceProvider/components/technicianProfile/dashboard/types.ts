// types.ts
import type { TechnicianProfile } from "../../../../../interface/technician/ITechnicianApi";
import type { TechnicianOrder } from "../../../../../interface/technician/IOrderService";

export interface DashboardData {
  overview: {
    upcomingOrders: number;
    monthlyEarnings: number;
    totalJobs: number;
    averageRating: number;
  };
  orders: {
    orders: unknown[];
    isNewTechnician?: boolean;
  };
  earnings: {
    earnings: unknown[];
    isNewTechnician?: boolean;
  };
  reviews: {
    reviews: unknown[];
    isNewTechnician?: boolean;
  };
  profile: TechnicianProfile;
  suspensionReason?: string;
  suspendedAt?: string;
}

export interface TabProps {
  dashboardData: DashboardData;
  orders: TechnicianOrder[];
  ordersLoading: boolean;
  isSuspended: boolean;
  onUpdateOrderStatus: (orderId: string, status: string, reason?: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
}

export interface ProfileTabProps extends TabProps {
  navigate: (path: string) => void;
}

export interface SuspensionBannerProps {
  suspensionInfo: {
    reason?: string;
    suspendedAt?: string;
  };
}

export interface DisabledOverlayProps {
  children: React.ReactNode;
  tab: string;
  isSuspended: boolean;
}

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

export interface OrderItem {
  _id: string;
  customName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderHistory {
  status: string;
  description: string;
  updatedBy: string;
  timestamp: string;
  reason?: string;
}

export interface PaymentInfo {
  method: 'online' | 'cod';
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
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