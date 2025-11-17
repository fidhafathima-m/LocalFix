import { FilterQuery, Types } from 'mongoose';
import {
  ISubscriptionCreate,
  ISubscriptionRepository,
  ISubscriptionUpdate,
} from '../../interfaces/repository/admin/ISubscriptionRepository';

import slugify from 'slugify';
import SubscriptionSchema, {
  ISubscription,
} from '../../models/SubscriptionSchema';

export class SubscriptionRepository implements ISubscriptionRepository {
  async create(subscriptionData: ISubscriptionCreate): Promise<ISubscription> {
    const slug = slugify(subscriptionData.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const subscription = new SubscriptionSchema({
      ...subscriptionData,
      slug,
    });

    return await subscription.save();
  }

  async findById(
    subscriptionId: string | Types.ObjectId
  ): Promise<ISubscription | null> {
    return await SubscriptionSchema.findById(subscriptionId);
  }

  async findBySlug(slug: string): Promise<ISubscription | null> {
    return await SubscriptionSchema.findOne({ slug });
  }

  async findByName(name: string): Promise<ISubscription | null> {
    return await SubscriptionSchema.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
  }

  async findAll(
    filter: FilterQuery<ISubscription> = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<ISubscription[]> {
    return await SubscriptionSchema.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async update(
    subscriptionId: string | Types.ObjectId,
    updateData: ISubscriptionUpdate
  ): Promise<ISubscription | null> {
    if (updateData.name) {
      updateData.slug = slugify(updateData.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    return await SubscriptionSchema.findByIdAndUpdate(
      subscriptionId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(subscriptionId: string | Types.ObjectId): Promise<boolean> {
    const result = await SubscriptionSchema.findByIdAndDelete(subscriptionId);
    return result !== null;
  }

  async count(filter: FilterQuery<ISubscription> = {}): Promise<number> {
    return await SubscriptionSchema.countDocuments(filter);
  }

  async search(query: string, limit: number = 10): Promise<ISubscription[]> {
    return await SubscriptionSchema.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ],
    })
      .limit(limit)
      .sort({ createdAt: -1 });
  }
}
