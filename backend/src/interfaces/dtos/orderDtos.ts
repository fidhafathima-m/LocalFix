export interface OrderResponseDto {
  _id: string;
  orderCode: string;
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
  };
  serviceName: string;
  problemDescription: string;
  scheduledAt: string;
  timeSlot: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  status: 'pending' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  payment: {
    method: 'online' | 'cod';
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: string;
  };
  totalAmount: number;
  orderItems: Array<{
    _id: string;
    customName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    status: string;
  }>;
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
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStatsDto {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface UpdateOrderStatusDto {
  status: string;
  reason?: string;
}