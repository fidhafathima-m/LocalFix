import {
  CreateSubscriptionDto,
  SubscriptionListResponseDto,
  SubscriptionResponseDto,
  UpdateSubscriptionDto,
} from '../../dtos/subscriptionDtos';

export interface ISubscriptionService {
  createSubscription(
    createDto: CreateSubscriptionDto
  ): Promise<SubscriptionResponseDto>;
  getSubscriptionById(subscriptionId: string): Promise<SubscriptionResponseDto>;
  getSubscriptionBySlug(slug: string): Promise<SubscriptionResponseDto>;
  getAllSubscriptions(
    page?: number,
    limit?: number,
    search?: string
  ): Promise<SubscriptionListResponseDto>;
  updateSubscription(
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto
  ): Promise<SubscriptionResponseDto>;
  deleteSubscription(subscriptionId: string): Promise<void>;
  searchSubscriptions(
    query: string,
    limit?: number
  ): Promise<SubscriptionResponseDto[]>;
}
