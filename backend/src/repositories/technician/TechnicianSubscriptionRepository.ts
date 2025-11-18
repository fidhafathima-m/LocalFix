import { Types } from 'mongoose';
import TechnicianSubscription, {
  ITechnicianSubscription,
} from '../../models/technician/TechnicianSubscriptionSchema';
import {
  CreateSubscriptionData,
  ITechnicianSubscriptionRepository,
} from '../../interfaces/repository/technician/ISubscriptionRepository';

export class TechnicianSubscriptionRepository
  implements ITechnicianSubscriptionRepository
{
  async create(
    subscriptionData: CreateSubscriptionData
  ): Promise<ITechnicianSubscription> {
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + subscriptionData.durationMonths);

    const subscription = new TechnicianSubscription({
      ...subscriptionData,
      startDate,
      endDate,
    });

    return await subscription.save();
  }

  async findById(
    subscriptionId: string | Types.ObjectId
  ): Promise<ITechnicianSubscription | null> {
    return await TechnicianSubscription.findById(subscriptionId)
      .populate('subscriptionPlanId')
      .populate('technicianId');
  }

  async findByTechnicianId(
    technicianId: string | Types.ObjectId
  ): Promise<ITechnicianSubscription[]> {
    return await TechnicianSubscription.find({ technicianId })
      .populate('subscriptionPlanId')
      .sort({ createdAt: -1 });
  }

  async findActiveSubscription(
    technicianId: string | Types.ObjectId
  ): Promise<ITechnicianSubscription | null> {
    const now = new Date();
    return await TechnicianSubscription.findOne({
      technicianId,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('subscriptionPlanId')
      .sort({ createdAt: -1 });
  }

  async updateStatus(
    subscriptionId: string | Types.ObjectId,
    status: 'active' | 'expired' | 'cancelled'
  ): Promise<ITechnicianSubscription | null> {
    return await TechnicianSubscription.findByIdAndUpdate(
      subscriptionId,
      { status },
      { new: true }
    );
  }

  async findByTransactionId(
    transactionId: string
  ): Promise<ITechnicianSubscription | null> {
    return await TechnicianSubscription.findOne({ transactionId })
      .populate('subscriptionPlanId')
      .populate('technicianId');
  }

  async countActiveSubscriptions(): Promise<number> {
    const now = new Date();
    return await TechnicianSubscription.countDocuments({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
  }

  async findExpiringSubscriptions(
    days: number
  ): Promise<ITechnicianSubscription[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return await TechnicianSubscription.find({
      status: 'active',
      endDate: {
        $lte: targetDate,
        $gte: new Date(),
      },
    })
      .populate('subscriptionPlanId')
      .populate('technicianId');
  }
}
