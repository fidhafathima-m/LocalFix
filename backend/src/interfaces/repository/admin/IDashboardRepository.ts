export interface IDashboardRepository {
  // Overview
  getTotalRevenue(): Promise<number>;
  getTotalBookings(): Promise<number>;
  getTotalUsers(): Promise<number>;
  getTotalTechnicians(): Promise<number>;

  // Growth calculations
  getRevenueGrowth(): Promise<number>;
  getBookingsGrowth(): Promise<number>;
  getUsersGrowth(): Promise<number>;
  getTechniciansGrowth(): Promise<number>;
  getAverageOrderValueGrowth(): Promise<number>;

  // Revenue trend
  getRevenueTrend(
    period: string
  ): Promise<Array<{ period: string; revenue: number; profit: number }>>;

  // Top performers
  getTopTechnicians(limit: number): Promise<
    Array<{
      technicianId: string;
      name: string;
      rating: number;
      jobs: number;
      revenue: number;
    }>
  >;

  // Customer satisfaction
  getCustomerSatisfaction(): Promise<Array<{ stars: number; count: number }>>;

  // Payment methods
  getPaymentMethods(): Promise<Array<{ method: string; amount: number }>>;
}
