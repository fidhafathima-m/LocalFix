export interface DashboardOverviewDto {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalTechnicians: number;
  growthMetrics: {
    revenueGrowth: number;
    bookingsGrowth: number;
    usersGrowth: number;
    techniciansGrowth: number;
    averageOrderValueGrowth: number;
  };
}

export interface RevenueTrendDto {
  period: string;
  revenue: number;
  profit: number;
}

export interface TopTechnicianDto {
  technicianId: string;
  name: string;
  rating: number;
  jobs: number;
  revenue: number;
}

export interface CustomerSatisfactionDto {
  stars: number;
  percentage?: number;
  count: number;
}

export interface PaymentMethodDto {
  method: string;
  percentage: number;
  amount: number;
}

export interface GrowthMetricsDto {
  name: string;
  growth: number;
}

export interface DashboardResponseDto {
  overview: DashboardOverviewDto;
  revenueTrend: RevenueTrendDto[];
  topTechnicians: TopTechnicianDto[];
  customerSatisfaction: CustomerSatisfactionDto[];
  paymentMethods: PaymentMethodDto[];
  growthMetrics: GrowthMetricsDto[];
}
