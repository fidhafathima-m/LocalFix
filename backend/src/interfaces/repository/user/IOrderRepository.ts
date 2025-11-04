import { IOrder } from "@/interfaces/user/IOrder";

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
  createFromBooking(bookingId: string, paymentData: any): Promise<IOrder | null>;
}
