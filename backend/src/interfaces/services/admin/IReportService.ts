export interface ReportRequest {
  startDate?: Date;
  endDate?: Date;
  format: 'pdf' | 'csv' | 'excel';
  reportType?: 'dashboard' | 'financial' | 'customer' | 'technician';
  data?: any;
}

export interface ReportResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  data?: any;
}

export interface IReportService {
  generateReport(request: ReportRequest): Promise<ReportResponse>;
  generateFinancialReport(startDate: Date, endDate: Date): Promise<any>;
  generateCustomerReport(startDate: Date, endDate: Date): Promise<any>;
  generateTechnicianReport(startDate: Date, endDate: Date): Promise<any>;
}
