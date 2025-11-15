export interface IReportRepository {
  getDashboardReportData(startDate?: Date, endDate?: Date): Promise<any>;
  getFinancialReportData(startDate: Date, endDate: Date): Promise<any>;
  getCustomerReportData(startDate: Date, endDate: Date): Promise<any>;
  getTechnicianReportData(startDate: Date, endDate: Date): Promise<any>;
  exportReport(
    data: any,
    format: 'pdf' | 'csv' | 'excel'
  ): Promise<{ downloadUrl: string }>;
}
