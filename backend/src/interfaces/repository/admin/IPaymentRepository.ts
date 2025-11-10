import { FilterQuery, Types } from "mongoose";
import { IPayment, IPaymentCreate, IPaymentUpdate } from "../../admin/IPaymentManagement";

export interface IPaymentRepository {
  create(paymentData: IPaymentCreate): Promise<IPayment>;
  findById(paymentId: string | Types.ObjectId): Promise<IPayment | null>;
  findByProviderOrderId(providerOrderId: string): Promise<IPayment | null>;
  findByUserId(userId: string | Types.ObjectId): Promise<IPayment[]>;
  findByBookingId(bookingId: string | Types.ObjectId): Promise<IPayment | null>;
  findAll(
    filter: FilterQuery<IPayment>,
    skip?: number,
    limit?: number
  ): Promise<IPayment[]>;
  update(
    paymentId: string | Types.ObjectId,
    updateData: IPaymentUpdate
  ): Promise<IPayment | null>;
  delete(paymentId: string | Types.ObjectId): Promise<boolean>;
  count(filter: FilterQuery<IPayment>): Promise<number>;
  search(query: string, limit?: number, filters?: any): Promise<IPayment[]>;
  getPaymentStats(): Promise<{
    totalRevenue: number;
    platformCommission: number;
    pendingPayments: number;
    failedPayments: number;
    totalPayments: number;
  }>;
}