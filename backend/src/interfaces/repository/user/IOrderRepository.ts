import { IOrder, IOrderPopulated } from '../../user/IOrder';

export interface IOrderRepository {
  createFromBooking(
    bookingId: string,
    paymentData: any
  ): Promise<IOrder | null>;
  findById(orderId: string): Promise<IOrder | null>;
  findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ orders: IOrder[]; total: number }>;
  updateStatus(
    orderId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<IOrder | null>;
  addOrderItem(orderId: string, itemData: any): Promise<IOrder | null>;
  findByTechnicianId(
    technicianId: string,
    page: number,
    limit: number
  ): Promise<{ orders: any[]; total: number }>;
  getTechnicianStats(technicianId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    monthlyEarnings: number;
  }>;
  rescheduleOrder(
    orderId: string,
    newDate: string,
    newTimeSlot: string,
    updatedBy: string
  ): Promise<IOrder | null>;
  findConflictingOrders(
    technicianId: string,
    date: string,
    timeSlot: string,
    excludeOrderId?: string
  ): Promise<IOrder[]>;
  findByBookingId(bookingId: string): Promise<IOrderPopulated | null>;
  updatePaymentDetails(
    orderId: string,
    paymentData: {
      method: 'online' | 'cod';
      amount: number;
      status: 'pending' | 'paid' | 'failed';
      transactionId?: string;
      paidAt?: Date;
    }
  ): Promise<IOrder | null>;
  getOrdersByTechnicianAndDate(
    technicianId: string,
    date: Date
  ): Promise<IOrder[]>;
}
