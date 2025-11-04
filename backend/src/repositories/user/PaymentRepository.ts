import { IPaymentRepository } from "../../interfaces/repository/user/IPaymentRepository";
import Payment, { IPayment } from "../../models/PaymentSchema";
import { Types } from "mongoose";

export class PaymentRepository implements IPaymentRepository {
  async create(paymentData: Partial<IPayment>): Promise<IPayment> {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async findById(paymentId: string): Promise<IPayment | null> {
    return await Payment.findById(paymentId)
      .populate('bookingId')
      .populate('userId')
      .exec();
  }

  async findByOrderId(orderId: string): Promise<IPayment | null> {
    return await Payment.findOne({ providerOrderId: orderId })
      .populate('bookingId')
      .populate('userId')
      .exec();
  }

  async findByBookingId(bookingId: string): Promise<IPayment | null> {
    return await Payment.findOne({ bookingId: new Types.ObjectId(bookingId) })
      .populate('userId')
      .exec();
  }

  async update(paymentId: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    return await Payment.findByIdAndUpdate(
      new Types.ObjectId(paymentId),
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async updateByOrderId(orderId: string, updateData: Partial<IPayment>): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { providerOrderId: orderId },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ payments: IPayment[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
      Payment.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('bookingId')
        .exec(),
      Payment.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return { payments, total };
  }
}