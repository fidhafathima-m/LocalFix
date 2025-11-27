import { IReportService } from '../../interfaces/services/admin/IReportService';
import { ResponseHelper } from '../../utils/responseHelper';
import { ILogger } from '../../interfaces/utils/ILogger';
import { AuthRequest, Response } from '../../types/express';

export class ReportController {
  private _reportService: IReportService;
  private _logger: ILogger;

  constructor(reportService: IReportService, logger: ILogger) {
    this._reportService = reportService;
    this._logger = logger;
  }

  generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
    const context = {
      operation: 'generateReport',
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Generating report', context);

      const { startDate, endDate, format, reportType } = req.body;

      // Validate format
      const validFormats = ['pdf', 'csv', 'excel'];
      if (!validFormats.includes(format)) {
        const response = ResponseHelper.badRequest(
          'Invalid format. Must be one of: pdf, csv, excel'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      // Parse dates if provided
      const parsedStartDate = startDate ? new Date(startDate) : undefined;
      const parsedEndDate = endDate ? new Date(endDate) : undefined;

      // Validate date range if both dates are provided
      if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
        const response = ResponseHelper.badRequest(
          'Start date cannot be after end date'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const reportRequest = {
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        format,
        reportType: reportType || 'dashboard',
      };

      const result = await this._reportService.generateReport(reportRequest);

      this._logger.info('Report generated successfully', {
        ...context,
        reportType: reportType || 'dashboard',
        format,
      });

      const response = ResponseHelper.success(
        'Report generated successfully',
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate report';

      this._logger.error('Generate report controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  generateFinancialReport = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'generateFinancialReport',
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Generating financial report', context);

      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        const response = ResponseHelper.badRequest(
          'Start date and end date are required'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (parsedStartDate > parsedEndDate) {
        const response = ResponseHelper.badRequest(
          'Start date cannot be after end date'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const result = await this._reportService.generateFinancialReport(
        parsedStartDate,
        parsedEndDate
      );

      this._logger.info('Financial report generated successfully', {
        ...context,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });

      const response = ResponseHelper.success(
        'Financial report generated successfully',
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate financial report';

      this._logger.error('Generate financial report controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  generateCustomerReport = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'generateCustomerReport',
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Generating customer report', context);

      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        const response = ResponseHelper.badRequest(
          'Start date and end date are required'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (parsedStartDate > parsedEndDate) {
        const response = ResponseHelper.badRequest(
          'Start date cannot be after end date'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const result = await this._reportService.generateCustomerReport(
        parsedStartDate,
        parsedEndDate
      );

      this._logger.info('Customer report generated successfully', {
        ...context,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });

      const response = ResponseHelper.success(
        'Customer report generated successfully',
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate customer report';

      this._logger.error('Generate customer report controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  generateTechnicianReport = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'generateTechnicianReport',
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Generating technician report', context);

      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        const response = ResponseHelper.badRequest(
          'Start date and end date are required'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);

      if (parsedStartDate > parsedEndDate) {
        const response = ResponseHelper.badRequest(
          'Start date cannot be after end date'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const result = await this._reportService.generateTechnicianReport(
        parsedStartDate,
        parsedEndDate
      );

      this._logger.info('Technician report generated successfully', {
        ...context,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      });

      const response = ResponseHelper.success(
        'Technician report generated successfully',
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to generate technician report';

      this._logger.error('Generate technician report controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  exportReport = async (req: AuthRequest, res: Response): Promise<void> => {
    const context = {
      operation: 'exportReport',
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Exporting report', context);

      const { data, format } = req.body;

      if (!data) {
        const response = ResponseHelper.badRequest('Report data is required');
        res.status(response.statusCode).json(response);
        return;
      }

      // Generate the actual file
      const result = await this._reportService.generateReport({
        data,
        format,
        reportType: 'dashboard',
      });

      if (!result.success || !result.downloadUrl) {
        throw new Error(result.message || 'Failed to generate report');
      }

      // Extract filename from download URL or create one
      const filename = `report-${new Date().toISOString().split('T')[0]}.${format}`;

      // Set headers for file download
      res.setHeader('Content-Type', this.getContentType(format));
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );

      // For base64 data URLs, extract and send the actual data
      if (result.downloadUrl.startsWith('data:')) {
        const base64Data = result.downloadUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        res.send(buffer);
      } else {
        // If it's a regular URL (unlikely in this implementation)
        res.json({ downloadUrl: result.downloadUrl });
      }

      this._logger.info('Report exported successfully', {
        ...context,
        format,
        filename,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to export report';

      this._logger.error('Export report controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  private getContentType(format: string): string {
    switch (format) {
      case 'pdf':
        return 'application/pdf';
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/json';
    }
  }
}
