import {
  CreateSubscriptionData,
  SubscriptionFilters,
} from '../../repository/admin/ITechnicianSubscriptionRepository';
import {
  SubscriptionListResponseDto,
  SubscriptionResponseDto,
  SubscriptionStatsResponseDto,
  CreateSubscriptionRequestDto,
} from '../../../interfaces/dtos/technicianSubscriptionDtos';

export interface ITechnicianSubscriptionService {
  getTechnicianSubscriptions(
    filters: SubscriptionFilters
  ): Promise<SubscriptionListResponseDto>;

  getSubscriptionStats(): Promise<SubscriptionStatsResponseDto>;

  getSubscriptionById(id: string): Promise<SubscriptionResponseDto>;

  getSubscriptionsByTechnician(
    technicianId: string,
    page: number,
    limit: number
  ): Promise<SubscriptionListResponseDto>;

  getCurrentSubscription(
    technicianId: string
  ): Promise<SubscriptionResponseDto>;

  createSubscription(
    technicianId: string,
    subscriptionData: CreateSubscriptionRequestDto
  ): Promise<SubscriptionResponseDto>;

  updateSubscriptionStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<SubscriptionResponseDto>;

  cancelSubscription(
    technicianId: string,
    subscriptionId: string,
    reason?: string
  ): Promise<SubscriptionResponseDto>;
}
