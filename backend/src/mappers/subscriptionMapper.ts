import {
  SubscriptionResponseDto,
  SubscriptionListResponseDto,
} from '../interfaces/dtos/subscriptionDtos';
import { ISubscription } from '../models/SubscriptionSchema';

export class SubscriptionMapper {
  toSubscriptionResponseDto(
    subscription: ISubscription
  ): SubscriptionResponseDto {
    return {
      id: subscription._id.toString(),
      name: subscription.name,
      slug: subscription.slug,
      price: subscription.price,
      durationMonths: subscription.durationMonths,
      commissionRate: subscription.commissionRate,
      features: subscription.features || [],
      status: subscription.status,
      createdAt: subscription.createdAt.toISOString(),
      updatedAt: subscription.updatedAt.toISOString(),
    };
  }

  toSubscriptionListResponseDto(
    subscriptions: ISubscription[],
    total: number,
    page: number,
    limit: number
  ): SubscriptionListResponseDto {
    return {
      subscriptions: subscriptions.map(subscription =>
        this.toSubscriptionResponseDto(subscription)
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
