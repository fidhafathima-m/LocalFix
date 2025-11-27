import { IPayment } from '../../../models/PaymentSchema';

export interface IPaymentRepository {
  create(paymentData: Partial<IPayment>): Promise<IPayment>;
  findById(paymentId: string): Promise<IPayment | null>;
  findByOrderId(orderId: string): Promise<IPayment | null>;
  findByBookingId(bookingId: string): Promise<IPayment | null>;
  update(
    paymentId: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment | null>;
  updateByOrderId(
    orderId: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment | null>;
  findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ payments: IPayment[]; total: number }>;
}
