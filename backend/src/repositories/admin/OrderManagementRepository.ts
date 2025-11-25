import { FilterQuery, Types } from 'mongoose';
import { IOrderRepository } from '../../interfaces/repository/admin/IOrderRepository';
import { IOrder } from '../../interfaces/user/IOrder';
import OrderSchema from '../../models/OrderSchema';

export class OrderManagementRepository implements IOrderRepository {
  async findAll(
    filter: FilterQuery<IOrder> = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<IOrder[]> {
    try {
      console.time('findAll-query');

      const orders = await OrderSchema.find(filter)
        .populate('userId', 'fullName email phone')
        .populate('technicianId', 'displayName profilePictureUrl')
        .select(
          'orderCode userId technicianId serviceName scheduledAt timeSlot status totalAmount payment createdAt'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .maxTimeMS(10000)
        .exec();

      console.timeEnd('findAll-query');

      return orders.map(order => this.convertToIOrder(order));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    try {
      console.time('getOrderStats');

      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        revenueData,
      ] = await Promise.all([
        OrderSchema.countDocuments().maxTimeMS(5000).exec(),
        OrderSchema.countDocuments({ status: 'pending' })
          .maxTimeMS(5000)
          .exec(),
        OrderSchema.countDocuments({ status: 'confirmed' })
          .maxTimeMS(5000)
          .exec(),
        OrderSchema.countDocuments({ status: 'in_progress' })
          .maxTimeMS(5000)
          .exec(),
        OrderSchema.countDocuments({ status: 'completed' })
          .maxTimeMS(5000)
          .exec(),
        OrderSchema.countDocuments({ status: 'cancelled' })
          .maxTimeMS(5000)
          .exec(),
        OrderSchema.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1
                ),
              },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
              monthlyRevenue: { $sum: '$totalAmount' },
            },
          },
        ]).exec(),
      ]);

      console.timeEnd('getOrderStats');

      return {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        monthlyRevenue: revenueData[0]?.monthlyRevenue || 0,
      };
    } catch (error) {
      console.error('Error in getOrderStats:', error);
      // Return default values instead of failing
      return {
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      };
    }
  }

  async search(
    query: string,
    limit: number = 10,
    status?: string
  ): Promise<IOrder[]> {
    try {
      console.time('search-query');

      // Build search filter
      const searchFilter: FilterQuery<IOrder> = {
        $or: [
          { orderCode: { $regex: query, $options: 'i' } },
          { serviceName: { $regex: query, $options: 'i' } },
          { 'userId.fullName': { $regex: query, $options: 'i' } },
          { 'technicianId.displayName': { $regex: query, $options: 'i' } },
        ],
      };

      // Add status filter if provided
      if (status && status !== 'all') {
        searchFilter.status = status;
      }

      const orders = await OrderSchema.find(searchFilter)
        .populate('userId', 'fullName email phone')
        .populate('technicianId', 'displayName profilePictureUrl')
        .select(
          'orderCode userId technicianId serviceName scheduledAt timeSlot status totalAmount payment createdAt'
        )
        .limit(limit)
        .sort({ createdAt: -1 })
        .maxTimeMS(10000)
        .lean()
        .exec();

      console.timeEnd('search-query');

      return orders.map(order => this.convertToIOrder(order));
    } catch (error) {
      console.error('Error in search:', error);
      return [];
    }
  }

  async findById(orderId: string | Types.ObjectId): Promise<IOrder | null> {
    const order = await OrderSchema.findById(orderId)
      .populate('userId', 'fullName email phone')
      .populate('technicianId', 'displayName profilePictureUrl')
      .lean()
      .exec();

    return order ? this.convertToIOrder(order) : null;
  }

  async count(filter: FilterQuery<IOrder> = {}): Promise<number> {
    return await OrderSchema.countDocuments(filter).exec();
  }

  async update(
    orderId: string | Types.ObjectId,
    updateData: Partial<IOrder>
  ): Promise<IOrder | null> {
    const order = await OrderSchema.findByIdAndUpdate(
      orderId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('userId', 'fullName email phone')
      .populate('technicianId', 'displayName profilePictureUrl')
      .lean()
      .exec();

    return order ? this.convertToIOrder(order) : null;
  }

  // Helper method to convert LeanDocument to IOrder
  private convertToIOrder(leanOrder: any): IOrder {
    const convertDate = (date: any): Date => {
      if (!date) return new Date();
      return date instanceof Date ? date : new Date(date);
    };

    return {
      _id: leanOrder._id?.toString() || '',
      bookingId: leanOrder.bookingId?.toString(),
      userId: leanOrder.userId,
      technicianId: leanOrder.technicianId,
      orderCode: leanOrder.orderCode,
      serviceName: leanOrder.serviceName,
      problemDescription: leanOrder.problemDescription,
      scheduledAt: convertDate(leanOrder.scheduledAt),
      timeSlot: leanOrder.timeSlot,
      address: leanOrder.address,
      status: leanOrder.status,
      payment: leanOrder.payment
        ? {
            ...leanOrder.payment,
            paidAt: leanOrder.payment.paidAt
              ? convertDate(leanOrder.payment.paidAt)
              : undefined,
          }
        : {
            method: '',
            amount: 0,
            status: 'pending',
            transactionId: '',
          },
      orderItems: (leanOrder.orderItems || []).map((item: any) => ({
        ...item,
        _id: item._id?.toString() || '',
      })),
      totalAmount: leanOrder.totalAmount || 0,
      technicianRating: leanOrder.technicianRating,
      userReview: leanOrder.userReview,
      history: (leanOrder.history || []).map((history: any) => ({
        ...history,
        timestamp: convertDate(history.timestamp),
      })),
      cancellation: leanOrder.cancellation,
      createdAt: convertDate(leanOrder.createdAt),
      updatedAt: convertDate(leanOrder.updatedAt),
    } as IOrder;
  }
}
