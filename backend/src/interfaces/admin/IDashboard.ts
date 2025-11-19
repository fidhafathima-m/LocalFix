import {
  CustomerSatisfactionDto,
  PaymentMethodDto,
} from '../dtos/dashboardDtos';
import { IDashboardRepository } from '../repository/admin/IDashboardRepository';

// Extended repository interface with optional enhanced methods
export interface IEnhancedDashboardRepository extends IDashboardRepository {
  getDetailedCustomerSatisfaction?: () => Promise<{
    ratingDistribution: CustomerSatisfactionDto[];
    averageRating: number;
    totalReviews: number;
  }>;
  getPaymentMethodsWithPercentages?: () => Promise<PaymentMethodDto[]>;
}

// Type guard for enhanced repository methods
export const hasDetailedCustomerSatisfaction = (
  repo: IDashboardRepository
): repo is IEnhancedDashboardRepository => {
  return (
    typeof (repo as IEnhancedDashboardRepository)
      .getDetailedCustomerSatisfaction === 'function'
  );
};

export const hasPaymentMethodsWithPercentages = (
  repo: IDashboardRepository
): repo is IEnhancedDashboardRepository => {
  return (
    typeof (repo as IEnhancedDashboardRepository)
      .getPaymentMethodsWithPercentages === 'function'
  );
};
