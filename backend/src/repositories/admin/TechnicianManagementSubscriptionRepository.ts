import { Types } from 'mongoose';
import {
  CreateSubscriptionData,
  ITechnicianSubscriptionRepository,
  SubscriptionFilters,
  SubscriptionStats,
} from '../../interfaces/repository/admin/ITechnicianSubscriptionRepository';
import TechnicianSubscriptionSchema, {
  ITechnicianSubscription,
} from '../../models/technician/TechnicianSubscriptionSchema';
import SubscriptionSchema from '../../models/SubscriptionSchema';
import { Technician } from '../../models/technician/TechnicianSchema';

export class TechnicianManagementSubscriptionRepository
  implements ITechnicianSubscriptionRepository
{
  async findSubscriptions(
    filters: SubscriptionFilters
  ): Promise<{ subscriptions: ITechnicianSubscription[]; total: number }> {
    try {
      const query: any = {};

      // Build filter query
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.technicianId) {
        query.technicianId = new Types.ObjectId(filters.technicianId);
      }

      if (filters.subscriptionPlanId) {
        query.subscriptionPlanId = new Types.ObjectId(
          filters.subscriptionPlanId
        );
      }

      const skip = (filters.page - 1) * filters.limit;

      const [subscriptions, total] = await Promise.all([
        TechnicianSubscriptionSchema.find(query)
          .populate('technicianId', 'displayName email phone')
          .populate(
            'subscriptionPlanId',
            'name description price durationMonths'
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(filters.limit)
          .exec(),
        TechnicianSubscriptionSchema.countDocuments(query),
      ]);

      return { subscriptions, total };
    } catch (error) {
      console.error('Error finding subscriptions:', error);
      throw new Error('Failed to retrieve subscriptions');
    }
  }

  async findSubscriptionById(
    id: string
  ): Promise<ITechnicianSubscription | null> {
    try {
      const subscription = await TechnicianSubscriptionSchema.findById(id)
        .populate('technicianId', 'displayName email phone profilePictureUrl')
        .populate(
          'subscriptionPlanId',
          'name description price durationMonths features'
        )
        .exec();

      return subscription;
    } catch (error) {
      console.error('Error finding subscription by ID:', error);
      throw new Error('Failed to retrieve subscription');
    }
  }

  async findCurrentSubscription(
    userId: string | Types.ObjectId
  ): Promise<ITechnicianSubscription | null> {
    try {
      const currentDate = new Date();

      // Convert to ObjectId if it's a string
      const userIdObj =
        typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

      // First, find the technician document to get the userId
      const technician = await Technician.findOne({ _id: userIdObj });

      if (!technician) {
        return null;
      }

      if (!technician.userId) {
        return null;
      }

      const subscription = await TechnicianSubscriptionSchema.findOne({
        technicianId: technician.userId,
        status: 'active',
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      })
        .populate(
          'subscriptionPlanId',
          'name description price durationMonths features'
        )
        .sort({ createdAt: -1 })
        .exec();

      return subscription;
    } catch (error) {
      console.error('[REPO DEBUG] Error finding current subscription:', error);
      throw new Error('Failed to retrieve current subscription');
    }
  }

  async findSubscriptionsByTechnician(
    userId: string | Types.ObjectId,
    page: number,
    limit: number
  ): Promise<{ subscriptions: ITechnicianSubscription[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      // Convert to ObjectId if it's a string
      const userIdObj =
        typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

      // First, find the technician document to get the userId
      const technician = await Technician.findOne({ _id: userIdObj });

      if (!technician) {
        return { subscriptions: [], total: 0 };
      }

      if (!technician.userId) {
        return { subscriptions: [], total: 0 };
      }

      const [subscriptions, total] = await Promise.all([
        TechnicianSubscriptionSchema.find({
          technicianId: technician.userId,
        })
          .populate(
            'subscriptionPlanId',
            'name description price durationMonths'
          )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        TechnicianSubscriptionSchema.countDocuments({
          technicianId: technician.userId,
        }),
      ]);

      return { subscriptions, total };
    } catch (error) {
      console.error(
        '[REPO DEBUG] Error finding subscriptions by technician:',
        error
      );
      throw new Error('Failed to retrieve technician subscriptions');
    }
  }

  async createSubscription(
    data: CreateSubscriptionData
  ): Promise<ITechnicianSubscription> {
    try {
      const subscription = new TechnicianSubscriptionSchema({
        _id: new Types.ObjectId(),
        technicianId: data.technicianId,
        subscriptionPlanId: data.subscriptionPlanId,
        amount: data.amount,
        durationMonths: data.durationMonths,
        commissionRate: data.commissionRate,
        startDate: data.startDate,
        endDate: data.endDate,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        status: data.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedSubscription = await subscription.save();

      // Populate the saved subscription
      const populatedSubscription = await TechnicianSubscriptionSchema.findById(
        savedSubscription._id
      )
        .populate('technicianId', 'displayName email phone')
        .populate(
          'subscriptionPlanId',
          'name description price durationMonths features'
        )
        .exec();

      return populatedSubscription as ITechnicianSubscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async updateSubscriptionStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<ITechnicianSubscription | null> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (reason) {
        updateData.cancellationReason = reason;
      }

      if (status === 'cancelled') {
        updateData.cancelledAt = new Date();
      }

      const subscription = await TechnicianSubscriptionSchema.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
        .populate('technicianId', 'displayName email phone')
        .populate(
          'subscriptionPlanId',
          'name description price durationMonths features'
        )
        .exec();

      return subscription;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw new Error('Failed to update subscription status');
    }
  }

  async findSubscriptionPlanById(id: string): Promise<any | null> {
    try {
      const subscriptionPlan = await SubscriptionSchema.findById(id).exec();
      return subscriptionPlan;
    } catch (error) {
      console.error('Error finding subscription plan by ID:', error);
      throw new Error('Failed to retrieve subscription plan');
    }
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    try {
      const currentDate = new Date();
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const [
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        totalRevenue,
        monthlyRevenue,
      ] = await Promise.all([
        // Total subscriptions
        TechnicianSubscriptionSchema.countDocuments(),

        // Active subscriptions
        TechnicianSubscriptionSchema.countDocuments({
          status: 'active',
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        }),

        // Expired subscriptions
        TechnicianSubscriptionSchema.countDocuments({
          status: 'expired',
        }),

        // Cancelled subscriptions
        TechnicianSubscriptionSchema.countDocuments({
          status: 'cancelled',
        }),

        // Total revenue
        TechnicianSubscriptionSchema.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]),

        // Monthly revenue
        TechnicianSubscriptionSchema.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]),
      ]);

      return {
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw new Error('Failed to retrieve subscription statistics');
    }
  }

  async updateExpiredSubscriptions(): Promise<void> {
    try {
      const currentDate = new Date();

      await TechnicianSubscriptionSchema.updateMany(
        {
          status: 'active',
          endDate: { $lt: currentDate },
        },
        {
          $set: {
            status: 'expired',
            updatedAt: currentDate,
          },
        }
      );
    } catch (error) {
      console.error('Error updating expired subscriptions:', error);
      throw new Error('Failed to update expired subscriptions');
    }
  }
}
