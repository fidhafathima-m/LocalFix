import { Types } from 'mongoose';
import { IDashboardRepository } from '../../interfaces/repository/admin/IDashboardRepository';
import OrderSchema from '../../models/OrderSchema';
import UserSchema from '../../models/UserSchema';
import { Technician } from '../../models/technician/TechnicianSchema';
import ReviewSchema from '../../models/ReviewSchema';

export class DashboardRepository implements IDashboardRepository {
  async getTotalRevenue(): Promise<number> {
    const result = await OrderSchema.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  async getTotalBookings(): Promise<number> {
    return await OrderSchema.countDocuments({
      status: { $in: ['completed', 'confirmed', 'in_progress'] },
    });
  }

  async getTotalUsers(): Promise<number> {
    return await UserSchema.countDocuments({
      roles: 'user',
      status: 'Active',
      isDeleted: false,
    });
  }

  async getTotalTechnicians(): Promise<number> {
    // Only count approved and active technicians
    return await Technician.countDocuments({
      status: 'approved', // Only approved technicians
      // Add any additional active status checks if needed
    });
  }

  async getRevenueGrowth(): Promise<number> {
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentRevenue, previousRevenue] = await Promise.all([
      this.getMonthlyRevenue(currentMonth),
      this.getMonthlyRevenue(previousMonth),
    ]);

    if (previousRevenue === 0) return 100;
    return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
  }

  async getBookingsGrowth(): Promise<number> {
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentBookings, previousBookings] = await Promise.all([
      OrderSchema.countDocuments({
        createdAt: {
          $gte: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
          ),
          $lt: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            1
          ),
        },
      }),
      OrderSchema.countDocuments({
        createdAt: {
          $gte: new Date(
            previousMonth.getFullYear(),
            previousMonth.getMonth(),
            1
          ),
          $lt: new Date(
            previousMonth.getFullYear(),
            previousMonth.getMonth() + 1,
            1
          ),
        },
      }),
    ]);

    if (previousBookings === 0) return 100;
    return ((currentBookings - previousBookings) / previousBookings) * 100;
  }

  async getUsersGrowth(): Promise<number> {
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentUsers, previousUsers] = await Promise.all([
      UserSchema.countDocuments({
        createdAt: {
          $gte: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
          ),
          $lt: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            1
          ),
        },
        roles: 'user',
      }),
      UserSchema.countDocuments({
        createdAt: {
          $gte: new Date(
            previousMonth.getFullYear(),
            previousMonth.getMonth(),
            1
          ),
          $lt: new Date(
            previousMonth.getFullYear(),
            previousMonth.getMonth() + 1,
            1
          ),
        },
        roles: 'user',
      }),
    ]);

    if (previousUsers === 0) return 100;
    return ((currentUsers - previousUsers) / previousUsers) * 100;
  }

  async getTechniciansGrowth(): Promise<number> {
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentTechs, previousTechs] = await Promise.all([
      Technician.countDocuments({
        createdAt: {
          $gte: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
          ),
          $lt: new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            1
          ),
        },
        status: 'approved', // Only approved technicians
      }),
      Technician.countDocuments({
        createdAt: {
          $gte: new Date(
            previousMonth.getFullYear(),
            previousMonth.getMonth(),
            1
          ),
          $lt: new Date(
            previousMonth.getFullYear(),
            previousMonth.getMonth() + 1,
            1
          ),
        },
        status: 'approved', // Only approved technicians
      }),
    ]);

    if (previousTechs === 0) return 100;
    return ((currentTechs - previousTechs) / previousTechs) * 100;
  }

  async getAverageOrderValueGrowth(): Promise<number> {
    const currentMonth = new Date();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const [currentAOV, previousAOV] = await Promise.all([
      this.getAverageOrderValue(currentMonth),
      this.getAverageOrderValue(previousMonth),
    ]);

    if (previousAOV === 0) return 100;
    return ((currentAOV - previousAOV) / previousAOV) * 100;
  }

  async getRevenueTrend(
    period: string = 'monthly'
  ): Promise<Array<{ period: string; revenue: number; profit: number }>> {
    const months = 6;
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthName = date.toLocaleString('default', { month: 'short' });
      const revenue = await this.getMonthlyRevenue(date);
      const profit = revenue * 0.4; // Assuming 40% profit margin

      result.push({
        period: monthName,
        revenue,
        profit,
      });
    }

    return result;
  }

  async getTopTechnicians(limit: number = 5): Promise<
    Array<{
      technicianId: string;
      name: string;
      rating: number;
      jobs: number;
      revenue: number;
    }>
  > {
    return await OrderSchema.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: '$technicianId',
          jobs: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'technicians',
          localField: '_id',
          foreignField: '_id',
          as: 'technician',
        },
      },
      {
        $unwind: {
          path: '$technician',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'technician.status': 'approved', // Only include approved technicians
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'technicianId',
          as: 'reviews',
        },
      },
      {
        $project: {
          technicianId: '$_id',
          name: {
            $ifNull: [
              '$technician.displayName',
              { $concat: ['Technician ', { $toString: '$_id' }] },
            ],
          },
          rating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: { $ifNull: ['$technician.averageRating', 0] },
            },
          },
          jobs: 1,
          revenue: 1,
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: limit,
      },
    ]);
  }

  async getCustomerSatisfaction(): Promise<
    Array<{ stars: number; count: number; percentage: number }>
  > {
    // Get ratings from Review schema - include all reviews except flagged ones
    const ratings = await ReviewSchema.aggregate([
      {
        $match: {
          status: { $in: ['published', 'pending'] },
          rating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    console.log('Raw ratings from reviews:', ratings);

    const total = ratings.reduce((sum, item) => sum + item.count, 0);
    console.log('Total reviews:', total);

    // Create complete rating distribution for all stars 1-5
    const completeRatings = [5, 4, 3, 2, 1].map(star => {
      const existing = ratings.find(r => r._id === star);
      const count = existing?.count || 0;
      const percentage = total > 0 ? (count / total) * 100 : 0;

      console.log(
        `Star ${star}: count=${count}, percentage=${percentage.toFixed(2)}%`
      );

      return {
        stars: star,
        count: count,
        percentage: percentage,
      };
    });

    console.log('Complete ratings distribution:', completeRatings);

    return completeRatings;
  }

  async getPaymentMethods(): Promise<
    Array<{ method: string; amount: number }>
  > {
    const paymentMethods = await OrderSchema.aggregate([
      {
        $match: {
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: '$payment.method',
          amount: { $sum: '$totalAmount' },
        },
      },
      {
        $project: {
          method: '$_id',
          amount: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Raw payment methods data:', paymentMethods);

    // Ensure we have all payment methods, even if they have 0 amount
    const allMethods = ['online', 'cod', 'wallet'];
    const completePaymentMethods = allMethods.map(method => {
      const existing = paymentMethods.find(pm => pm.method === method);
      return {
        method: method,
        amount: existing?.amount || 0,
      };
    });

    console.log('Complete payment methods:', completePaymentMethods);

    return completePaymentMethods;
  }

  // Enhanced payment methods with percentages
  async getPaymentMethodsWithPercentages(): Promise<
    Array<{ method: string; amount: number; percentage: number }>
  > {
    const paymentMethods = await this.getPaymentMethods();

    const totalAmount = paymentMethods.reduce(
      (sum, method) => sum + method.amount,
      0
    );

    const paymentMethodsWithPercentages = paymentMethods.map(method => ({
      ...method,
      percentage: totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0,
    }));

    console.log(
      'Payment methods with percentages:',
      paymentMethodsWithPercentages
    );

    return paymentMethodsWithPercentages;
  }

  private async getMonthlyRevenue(date: Date): Promise<number> {
    const result = await OrderSchema.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': 'paid',
          createdAt: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  private async getAverageOrderValue(date: Date): Promise<number> {
    const result = await OrderSchema.aggregate([
      {
        $match: {
          status: 'completed',
          'payment.status': 'paid',
          createdAt: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$totalAmount' },
        },
      },
    ]);

    return result[0]?.average || 0;
  }
}
