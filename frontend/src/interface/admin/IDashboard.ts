export interface DashboardOverview {
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

export interface RevenueTrend {
  period: string;
  revenue: number;
  profit: number;
}

export interface TopTechnician {
  technicianId: string;
  name: string;
  rating: number;
  jobs: number;
  revenue: number;
}

export interface CustomerSatisfaction {
  stars: number;
  percentage: number;
  count: number;
}

export interface PaymentMethod {
  method: string;
  percentage: number;
  amount: number;
}

export interface GrowthMetrics {
  name: string;
  growth: number;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  revenueTrend: RevenueTrend[];
  topTechnicians: TopTechnician[];
  customerSatisfaction: CustomerSatisfaction[];
  paymentMethods: PaymentMethod[];
  growthMetrics: GrowthMetrics[];
}

export interface ReportRequest {
  startDate?: Date;
  endDate?: Date;
  format: "pdf" | "csv" | "excel";
  reportType?: "dashboard" | "financial" | "customer" | "technician";
}

export interface ReportResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}
