import { FilterQuery, Types } from 'mongoose';
import {
  IPayment,
  IPaymentCreate,
  IPaymentUpdate,
} from '../../interfaces/admin/IPaymentManagement';
import { IPaymentRepository } from '../../interfaces/repository/admin/IPaymentRepository';
import PaymentSchema from '../../models/PaymentSchema';
import OrderSchema from '../../models/OrderSchema';

export class PaymentManagementRepository implements IPaymentRepository {
  async create(paymentData: IPaymentCreate): Promise<IPayment> {
    const payment = new PaymentSchema(paymentData);
    return await payment.save();
  }

  async findById(paymentId: string | Types.ObjectId): Promise<IPayment | null> {
    return await PaymentSchema.findById(paymentId)
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingCode serviceName addressId',
        populate: {
          path: 'addressId',
          model: 'UserAddress',
          select: 'label street city state pincode landmark',
        },
      })
      .exec();
  }

  async findAll(
    filter: FilterQuery<IPayment> = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<IPayment[]> {
    const payments = await PaymentSchema.find(filter)
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingCode serviceName addressId',
        populate: {
          path: 'addressId',
          model: 'UserAddress',
          select: 'label street city state pincode landmark',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const paymentsWithOrderData = await Promise.all(
      payments.map(async payment => {
        // Find order by bookingId to get orderCode
        const order = await OrderSchema.findOne(
          { bookingId: payment.bookingId },
          { orderCode: 1 }
        ).exec();

        const paymentWithOrder = payment.toObject();
        if (order) {
          paymentWithOrder.orderCode = order.orderCode;
        } else {
          paymentWithOrder.orderCode = 'Booked';
        }

        return paymentWithOrder;
      })
    );

    return paymentsWithOrderData as IPayment[];
  }

  async findByProviderOrderId(
    providerOrderId: string
  ): Promise<IPayment | null> {
    const payment = await PaymentSchema.findOne({ providerOrderId })
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingCode serviceName addressId',
        populate: {
          path: 'addressId',
          model: 'UserAddress',
          select: 'label street city state pincode landmark',
        },
      })
      .exec();

    if (payment && payment.bookingId) {
      const order = await OrderSchema.findOne(
        { bookingId: payment.bookingId },
        { orderCode: 1 }
      ).exec();

      const paymentWithOrder = payment.toObject();
      paymentWithOrder.orderCode = order?.orderCode || 'Booked';
      return paymentWithOrder as IPayment;
    }

    return payment;
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<IPayment[]> {
    const payments = await PaymentSchema.find({ userId })
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingCode serviceName addressId',
        populate: {
          path: 'addressId',
          model: 'UserAddress',
          select: 'label street city state pincode landmark',
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    const paymentsWithOrderData = await Promise.all(
      payments.map(async payment => {
        const order = await OrderSchema.findOne(
          { bookingId: payment.bookingId },
          { orderCode: 1 }
        ).exec();

        const paymentWithOrder = payment.toObject();
        paymentWithOrder.orderCode = order?.orderCode || 'Booked';
        return paymentWithOrder;
      })
    );

    return paymentsWithOrderData as IPayment[];
  }

  async findByBookingId(
    bookingId: string | Types.ObjectId
  ): Promise<IPayment | null> {
    const payment = await PaymentSchema.findOne({ bookingId })
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingCode serviceName addressId',
        populate: {
          path: 'addressId',
          model: 'UserAddress',
          select: 'label street city state pincode landmark',
        },
      })
      .exec();

    if (payment) {
      const order = await OrderSchema.findOne(
        { bookingId },
        { orderCode: 1 }
      ).exec();

      const paymentWithOrder = payment.toObject();
      paymentWithOrder.orderCode = order?.orderCode || 'Booked';
      return paymentWithOrder as IPayment;
    }

    return payment;
  }

  async update(
    paymentId: string | Types.ObjectId,
    updateData: IPaymentUpdate
  ): Promise<IPayment | null> {
    return await PaymentSchema.findByIdAndUpdate(
      paymentId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('userId', 'fullName email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingCode serviceName addressId',
        populate: {
          path: 'addressId',
          model: 'UserAddress',
          select: 'label street city state pincode landmark',
        },
      })
      .exec();
  }

  async delete(paymentId: string | Types.ObjectId): Promise<boolean> {
    const result = await PaymentSchema.findByIdAndDelete(paymentId);
    return result !== null;
  }

  async count(filter: FilterQuery<IPayment>): Promise<number> {
    return await PaymentSchema.countDocuments(filter);
  }

  async search(
    query: string,
    limit: number = 10,
    filters?: any
  ): Promise<IPayment[]> {
    const searchRegex = new RegExp(query, 'i');

    // Build match stage with search and additional filters
    const matchStage: any = {
      $or: [
        { providerOrderId: searchRegex },
        { providerPaymentId: searchRegex },
        { 'user.fullName': searchRegex },
        { 'user.email': searchRegex },
        { 'booking.bookingCode': searchRegex },
        { 'booking.serviceName': searchRegex },
        { 'order.orderCode': searchRegex },
      ],
    };

    // Add status filter if provided
    if (filters?.status) {
      matchStage.status = filters.status;
    }

    // Add date range filter if provided
    if (filters?.createdAt) {
      matchStage.createdAt = filters.createdAt;
    }

    const payments = await PaymentSchema.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'bookingId',
          foreignField: '_id',
          as: 'booking',
        },
      },
      {
        $lookup: {
          from: 'useraddresses',
          localField: 'booking.addressId',
          foreignField: '_id',
          as: 'address',
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'bookingId',
          foreignField: 'bookingId',
          as: 'order',
        },
      },
      {
        $match: matchStage,
      },
      {
        $project: {
          _id: 1,
          bookingId: 1,
          userId: 1,
          paymentProvider: 1,
          providerOrderId: 1,
          providerPaymentId: 1,
          amount: 1,
          currency: 1,
          type: 1,
          status: 1,
          initiatedAt: 1,
          confirmedAt: 1,
          refundedAt: 1,
          rawResponse: 1,
          createdAt: 1,
          updatedAt: 1,
          // extract user data from the array
          userName: { $arrayElemAt: ['$user.fullName', 0] },
          userEmail: { $arrayElemAt: ['$user.email', 0] },
          userPhone: { $arrayElemAt: ['$user.phone', 0] },
          // extract booking data from the array
          bookingCode: { $arrayElemAt: ['$booking.bookingCode', 0] },
          serviceName: { $arrayElemAt: ['$booking.serviceName', 0] },
          // Extract order data
          orderId: {
            $cond: {
              if: { $gt: [{ $size: '$order' }, 0] },
              then: { $arrayElemAt: ['$order.orderCode', 0] },
              else: 'Booked',
            },
          },
          // Extract address data
          address: {
            $cond: {
              if: { $gt: [{ $size: '$address' }, 0] },
              then: { $arrayElemAt: ['$address', 0] },
              else: {
                label: '',
                street: '',
                city: '',
                state: '',
                pincode: '',
                landmark: '',
              },
            },
          },
        },
      },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ]);

    const transformedPayments = payments.map(payment => ({
      ...payment,
      id: payment._id.toString(),
    }));

    return transformedPayments as IPayment[];
  }

  async getPaymentStats(): Promise<{
    totalRevenue: number;
    platformCommission: number;
    pendingPayments: number;
    failedPayments: number;
    totalPayments: number;
  }> {
    const [
      totalRevenueResult,
      pendingPaymentsCount,
      failedPaymentsCount,
      totalPaymentsCount,
    ] = await Promise.all([
      PaymentSchema.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PaymentSchema.countDocuments({ status: 'pending' }),
      PaymentSchema.countDocuments({ status: { $in: ['failed', 'refunded'] } }),
      PaymentSchema.countDocuments(),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const platformCommission = Math.round(totalRevenue * 0.1);

    return {
      totalRevenue,
      platformCommission,
      pendingPayments: pendingPaymentsCount,
      failedPayments: failedPaymentsCount,
      totalPayments: totalPaymentsCount,
    };
  }
}
