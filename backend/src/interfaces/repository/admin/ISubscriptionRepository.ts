import { FilterQuery, Types } from 'mongoose';
import { ISubscription } from '../../../models/SubscriptionSchema';

export interface ISubscriptionCreate {
  name: string;
  price: number;
  durationMonths: number;
  commissionRate: number;
  features?: string[];
  status?: 'active' | 'inactive';
}

export interface ISubscriptionUpdate {
  name?: string;
  price?: number;
  durationMonths?: number;
  commissionRate?: number;
  features?: string[];
  status?: 'active' | 'inactive';
  slug?: string;
}

export interface ISubscriptionRepository {
  create(subscriptionData: ISubscriptionCreate): Promise<ISubscription>;
  findById(
    subscriptionId: string | Types.ObjectId
  ): Promise<ISubscription | null>;
  findBySlug(slug: string): Promise<ISubscription | null>;
  findByName(name: string): Promise<ISubscription | null>;
  findAll(
    filter?: FilterQuery<ISubscription>,
    skip?: number,
    limit?: number
  ): Promise<ISubscription[]>;
  update(
    subscriptionId: string | Types.ObjectId,
    updateData: ISubscriptionUpdate
  ): Promise<ISubscription | null>;
  delete(subscriptionId: string | Types.ObjectId): Promise<boolean>;
  count(filter?: FilterQuery<ISubscription>): Promise<number>;
  search(query: string, limit?: number): Promise<ISubscription[]>;
}
