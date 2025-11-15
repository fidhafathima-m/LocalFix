import {
  IReportService,
  ReportRequest,
  ReportResponse,
} from '../interfaces/services/admin/IReportService';
import { IReportRepository } from '../interfaces/repository/admin/IReportRepository';
import { ILogger } from '@/interfaces/utils/ILogger';

export class ReportService implements IReportService {
  private _reportRepository: IReportRepository;
  private _logger: ILogger;

  constructor(reportRepository: IReportRepository, logger: ILogger) {
    this._reportRepository = reportRepository;
    this._logger = logger;
  }

  async generateReport(request: ReportRequest): Promise<ReportResponse> {
    const context = {
      operation: 'generateReport',
      format: request.format,
      startDate: request.startDate,
      endDate: request.endDate,
    };

    try {
      this._logger.info('Generating report', context);

      let reportData: any;

      switch (request.reportType) {
        case 'financial':
          if (!request.startDate || !request.endDate) {
            throw new Error(
              'Start date and end date are required for financial reports'
            );
          }
          reportData = await this.generateFinancialReport(
            request.startDate,
            request.endDate
          );
          break;
        case 'customer':
          if (!request.startDate || !request.endDate) {
            throw new Error(
              'Start date and end date are required for customer reports'
            );
          }
          reportData = await this.generateCustomerReport(
            request.startDate,
            request.endDate
          );
          break;
        case 'technician':
          if (!request.startDate || !request.endDate) {
            throw new Error(
              'Start date and end date are required for technician reports'
            );
          }
          reportData = await this.generateTechnicianReport(
            request.startDate,
            request.endDate
          );
          break;
        default:
          // Dashboard report - use current data with optional date filtering
          reportData = await this._reportRepository.getDashboardReportData(
            request.startDate,
            request.endDate
          );
      }

      const result = await this._reportRepository.exportReport(
        reportData,
        request.format
      );

      this._logger.info('Report generated successfully', {
        ...context,
        dataSize: reportData ? Object.keys(reportData).length : 0,
      });

      return {
        success: true,
        message: 'Report generated successfully',
        downloadUrl: result.downloadUrl,
        data: reportData,
      };
    } catch (error) {
      this._logger.error('Failed to generate report', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to generate report',
      };
    }
  }

  async generateFinancialReport(startDate: Date, endDate: Date): Promise<any> {
    const context = {
      operation: 'generateFinancialReport',
      startDate,
      endDate,
    };

    try {
      this._logger.info('Generating financial report', context);

      const financialData = await this._reportRepository.getFinancialReportData(
        startDate,
        endDate
      );

      this._logger.info('Financial report generated successfully', context);

      return financialData;
    } catch (error) {
      this._logger.error('Failed to generate financial report', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async generateCustomerReport(startDate: Date, endDate: Date): Promise<any> {
    const context = { operation: 'generateCustomerReport', startDate, endDate };

    try {
      this._logger.info('Generating customer report', context);

      const customerData = await this._reportRepository.getCustomerReportData(
        startDate,
        endDate
      );

      this._logger.info('Customer report generated successfully', context);

      return customerData;
    } catch (error) {
      this._logger.error('Failed to generate customer report', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async generateTechnicianReport(startDate: Date, endDate: Date): Promise<any> {
    const context = {
      operation: 'generateTechnicianReport',
      startDate,
      endDate,
    };

    try {
      this._logger.info('Generating technician report', context);

      const technicianData =
        await this._reportRepository.getTechnicianReportData(
          startDate,
          endDate
        );

      this._logger.info('Technician report generated successfully', context);

      return technicianData;
    } catch (error) {
      this._logger.error('Failed to generate technician report', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
