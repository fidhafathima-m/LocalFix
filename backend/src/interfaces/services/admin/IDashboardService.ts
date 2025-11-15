import {
  DashboardOverviewDto,
  RevenueTrendDto,
  TopTechnicianDto,
  CustomerSatisfactionDto,
  PaymentMethodDto,
  GrowthMetricsDto,
  DashboardResponseDto,
} from '../../dtos/dashboardDtos';

export interface IDashboardService {
  getDashboardOverview(): Promise<DashboardOverviewDto>;
  getRevenueTrend(period: string): Promise<RevenueTrendDto[]>;
  getTopTechnicians(limit?: number): Promise<TopTechnicianDto[]>;
  getCustomerSatisfaction(): Promise<CustomerSatisfactionDto[]>;
  getPaymentMethods(): Promise<PaymentMethodDto[]>;
  getGrowthMetrics(): Promise<GrowthMetricsDto[]>;
  getCompleteDashboard(): Promise<DashboardResponseDto>;
}
