import { IReportRepository } from '../../interfaces/repository/admin/IReportRepository';
import OrderSchema from '../../models/OrderSchema';
import UserSchema from '../../models/UserSchema';
import { Technician } from '../../models/technician/TechnicianSchema';
import ReviewSchema from '../../models/ReviewSchema';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createObjectCsvWriter } from 'csv-writer';
import { PassThrough } from 'stream';

export class ReportRepository implements IReportRepository {
  async getDashboardReportData(startDate?: Date, endDate?: Date): Promise<any> {
    // ... (keep the same implementation as before)
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const [
      totalRevenue,
      totalBookings,
      totalUsers,
      totalTechnicians,
      revenueTrend,
      topTechnicians,
      customerSatisfaction,
      paymentMethods,
    ] = await Promise.all([
      this.getTotalRevenue(dateFilter),
      this.getTotalBookings(dateFilter),
      this.getTotalUsers(dateFilter),
      this.getTotalTechnicians(dateFilter),
      this.getRevenueTrend(dateFilter),
      this.getTopTechnicians(dateFilter),
      this.getCustomerSatisfaction(dateFilter),
      this.getPaymentMethods(dateFilter),
    ]);

    return {
      overview: {
        totalRevenue,
        totalBookings,
        totalUsers,
        totalTechnicians,
      },
      revenueTrend,
      topTechnicians,
      customerSatisfaction,
      paymentMethods,
      dateRange: {
        start: startDate,
        end: endDate,
      },
      generatedAt: new Date(),
    };
  }

  async getFinancialReportData(startDate: Date, endDate: Date): Promise<any> {
    // ... (keep the same implementation as before)
    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const financialData = await OrderSchema.aggregate([
      {
        $match: {
          ...dateFilter,
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          averageOrderValue: { $avg: '$totalAmount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return {
      financialData,
      dateRange: { startDate, endDate },
      summary: {
        totalRevenue: financialData.reduce(
          (sum, item) => sum + item.revenue,
          0
        ),
        totalBookings: financialData.reduce(
          (sum, item) => sum + item.bookings,
          0
        ),
        period: `${startDate.toDateString()} to ${endDate.toDateString()}`,
      },
    };
  }

  async getCustomerReportData(startDate: Date, endDate: Date): Promise<any> {
    // ... (keep the same implementation as before)
    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const customerData = await UserSchema.aggregate([
      {
        $match: {
          ...dateFilter,
          roles: 'user',
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders',
        },
      },
      {
        $project: {
          name: { $concat: ['$firstName', ' ', '$lastName'] },
          email: 1,
          phone: 1,
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.totalAmount' },
          joinedAt: '$createdAt',
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ]);

    return {
      customers: customerData,
      summary: {
        totalCustomers: customerData.length,
        newCustomers: customerData.filter(c => c.joinedAt >= startDate).length,
        period: `${startDate.toDateString()} to ${endDate.toDateString()}`,
      },
    };
  }

  async getTechnicianReportData(startDate: Date, endDate: Date): Promise<any> {
    // ... (keep the same implementation as before)
    const dateFilter = {
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const technicianData = await Technician.aggregate([
      {
        $match: {
          status: 'approved',
        },
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'technicianId',
          as: 'orders',
          pipeline: [
            {
              $match: {
                ...dateFilter,
                status: 'completed',
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'technicianId',
          as: 'reviews',
        },
      },
      {
        $project: {
          name: '$displayName',
          email: 1,
          phone: 1,
          totalJobs: { $size: '$orders' },
          totalRevenue: { $sum: '$orders.totalAmount' },
          averageRating: { $avg: '$reviews.rating' },
          joinedAt: '$createdAt',
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);

    return {
      technicians: technicianData,
      summary: {
        totalTechnicians: technicianData.length,
        activeTechnicians: technicianData.filter(t => t.totalJobs > 0).length,
        period: `${startDate.toDateString()} to ${endDate.toDateString()}`,
      },
    };
  }

  async exportReport(
    data: any,
    format: 'pdf' | 'csv' | 'excel'
  ): Promise<{ downloadUrl: string }> {
    try {
      let buffer: Buffer;
      let filename: string;

      switch (format) {
        case 'pdf':
          const pdfResult = await this.generatePDF(data);
          buffer = pdfResult.buffer;
          filename = pdfResult.filename;
          break;
        case 'csv':
          const csvResult = await this.generateCSV(data);
          buffer = csvResult.buffer;
          filename = csvResult.filename;
          break;
        case 'excel':
          const excelResult = await this.generateExcel(data);
          buffer = excelResult.buffer;
          filename = excelResult.filename;
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Convert buffer to base64 for download URL
      const base64Data = buffer.toString('base64');
      const downloadUrl = `data:${this.getMimeType(format)};base64,${base64Data}`;

      return { downloadUrl };
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error(
        `Failed to generate ${format.toUpperCase()} report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async generatePDF(
    data: any
  ): Promise<{ buffer: Buffer; filename: string }> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const buffer = Buffer.concat(buffers);
          resolve({
            buffer,
            filename: `report-${new Date().toISOString().split('T')[0]}.pdf`,
          });
        });

        // Add content to PDF
        this.addPDFContent(doc, data);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addPDFContent(doc: PDFKit.PDFDocument, data: any): void {
    // Title
    doc.fontSize(20).text('Business Analytics Report', { align: 'center' });
    doc.moveDown();

    // Date Range
    if (data.dateRange) {
      doc
        .fontSize(12)
        .text(
          `Period: ${data.dateRange.start ? new Date(data.dateRange.start).toLocaleDateString() : 'N/A'} - ${data.dateRange.end ? new Date(data.dateRange.end).toLocaleDateString() : 'N/A'}`,
          { align: 'center' }
        );
    }
    doc.moveDown();

    // Overview Section
    if (data.overview) {
      doc.fontSize(16).text('Overview', { underline: true });
      doc.moveDown(0.5);

      const overview = data.overview;
      doc
        .fontSize(12)
        .text(`Total Revenue: ₹${overview.totalRevenue?.toLocaleString() || 0}`)
        .text(
          `Total Bookings: ${overview.totalBookings?.toLocaleString() || 0}`
        )
        .text(`Total Users: ${overview.totalUsers?.toLocaleString() || 0}`)
        .text(
          `Total Technicians: ${overview.totalTechnicians?.toLocaleString() || 0}`
        );
      doc.moveDown();
    }

    // Revenue Trend
    if (data.revenueTrend && data.revenueTrend.length > 0) {
      doc.fontSize(16).text('Revenue Trend', { underline: true });
      doc.moveDown(0.5);

      data.revenueTrend.forEach((item: any) => {
        doc
          .fontSize(10)
          .text(
            `${item.period}: ₹${item.revenue?.toLocaleString() || 0} (Profit: ₹${item.profit?.toLocaleString() || 0})`
          );
      });
      doc.moveDown();
    }

    // Top Technicians
    if (data.topTechnicians && data.topTechnicians.length > 0) {
      doc.fontSize(16).text('Top Performing Technicians', { underline: true });
      doc.moveDown(0.5);

      data.topTechnicians.forEach((tech: any, index: number) => {
        doc
          .fontSize(10)
          .text(`${index + 1}. ${tech.name || 'Unknown'}`)
          .text(
            `   Rating: ${tech.rating?.toFixed(1) || 'N/A'} | Jobs: ${tech.jobs || 0} | Revenue: ₹${tech.revenue?.toLocaleString() || 0}`
          );
      });
      doc.moveDown();
    }

    // Customer Satisfaction
    if (data.customerSatisfaction && data.customerSatisfaction.length > 0) {
      doc.fontSize(16).text('Customer Satisfaction', { underline: true });
      doc.moveDown(0.5);

      data.customerSatisfaction.forEach((item: any) => {
        doc
          .fontSize(10)
          .text(
            `${item.stars} Stars: ${item.count} reviews (${item.percentage?.toFixed(1)}%)`
          );
      });
      doc.moveDown();
    }

    // Payment Methods
    if (data.paymentMethods && data.paymentMethods.length > 0) {
      doc.fontSize(16).text('Payment Methods', { underline: true });
      doc.moveDown(0.5);

      const totalAmount = data.paymentMethods.reduce(
        (sum: number, method: any) => sum + method.amount,
        0
      );
      data.paymentMethods.forEach((method: any) => {
        const percentage =
          totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0;
        doc
          .fontSize(10)
          .text(
            `${method.method.toUpperCase()}: ₹${method.amount?.toLocaleString() || 0} (${percentage.toFixed(1)}%)`
          );
      });
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text(`Generated on: ${new Date().toLocaleString()}`, {
      align: 'center',
    });
  }

  private async generateCSV(
    data: any
  ): Promise<{ buffer: Buffer; filename: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        let csvContent = '';

        // Overview Section
        if (data.overview) {
          csvContent += 'OVERVIEW\n';
          csvContent += 'Metric,Value\n';
          csvContent += `Total Revenue,${data.overview.totalRevenue || 0}\n`;
          csvContent += `Total Bookings,${data.overview.totalBookings || 0}\n`;
          csvContent += `Total Users,${data.overview.totalUsers || 0}\n`;
          csvContent += `Total Technicians,${data.overview.totalTechnicians || 0}\n\n`;
        }

        // Revenue Trend
        if (data.revenueTrend && data.revenueTrend.length > 0) {
          csvContent += 'REVENUE TREND\n';
          csvContent += 'Period,Revenue,Profit\n';
          data.revenueTrend.forEach((item: any) => {
            csvContent += `${item.period},${item.revenue || 0},${item.profit || 0}\n`;
          });
          csvContent += '\n';
        }

        // Top Technicians
        if (data.topTechnicians && data.topTechnicians.length > 0) {
          csvContent += 'TOP TECHNICIANS\n';
          csvContent += 'Rank,Name,Rating,Jobs,Revenue\n';
          data.topTechnicians.forEach((tech: any, index: number) => {
            csvContent += `${index + 1},${tech.name || 'Unknown'},${tech.rating?.toFixed(1) || 'N/A'},${tech.jobs || 0},${tech.revenue || 0}\n`;
          });
          csvContent += '\n';
        }

        // Customer Satisfaction
        if (data.customerSatisfaction && data.customerSatisfaction.length > 0) {
          csvContent += 'CUSTOMER SATISFACTION\n';
          csvContent += 'Stars,Count,Percentage\n';
          data.customerSatisfaction.forEach((item: any) => {
            csvContent += `${item.stars},${item.count},${item.percentage?.toFixed(1)}%\n`;
          });
          csvContent += '\n';
        }

        // Payment Methods
        if (data.paymentMethods && data.paymentMethods.length > 0) {
          csvContent += 'PAYMENT METHODS\n';
          csvContent += 'Method,Amount,Percentage\n';
          const totalAmount = data.paymentMethods.reduce(
            (sum: number, method: any) => sum + method.amount,
            0
          );
          data.paymentMethods.forEach((method: any) => {
            const percentage =
              totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0;
            csvContent += `${method.method},${method.amount},${percentage.toFixed(1)}%\n`;
          });
        }

        resolve({
          buffer: Buffer.from(csvContent, 'utf-8'),
          filename: `report-${new Date().toISOString().split('T')[0]}.csv`,
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateExcel(
    data: any
  ): Promise<{ buffer: Buffer; filename: string }> {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Service App';
      workbook.created = new Date();

      // Overview Sheet
      const overviewSheet = workbook.addWorksheet('Overview');
      overviewSheet.columns = [
        { header: 'Metric', key: 'metric', width: 20 },
        { header: 'Value', key: 'value', width: 15 },
      ];

      if (data.overview) {
        overviewSheet.addRow({
          metric: 'Total Revenue',
          value: data.overview.totalRevenue || 0,
        });
        overviewSheet.addRow({
          metric: 'Total Bookings',
          value: data.overview.totalBookings || 0,
        });
        overviewSheet.addRow({
          metric: 'Total Users',
          value: data.overview.totalUsers || 0,
        });
        overviewSheet.addRow({
          metric: 'Total Technicians',
          value: data.overview.totalTechnicians || 0,
        });
      }

      // Revenue Trend Sheet
      if (data.revenueTrend && data.revenueTrend.length > 0) {
        const revenueSheet = workbook.addWorksheet('Revenue Trend');
        revenueSheet.columns = [
          { header: 'Period', key: 'period', width: 15 },
          { header: 'Revenue', key: 'revenue', width: 15 },
          { header: 'Profit', key: 'profit', width: 15 },
        ];

        data.revenueTrend.forEach((item: any) => {
          revenueSheet.addRow({
            period: item.period,
            revenue: item.revenue || 0,
            profit: item.profit || 0,
          });
        });
      }

      // Top Technicians Sheet
      if (data.topTechnicians && data.topTechnicians.length > 0) {
        const techniciansSheet = workbook.addWorksheet('Top Technicians');
        techniciansSheet.columns = [
          { header: 'Rank', key: 'rank', width: 10 },
          { header: 'Name', key: 'name', width: 25 },
          { header: 'Rating', key: 'rating', width: 10 },
          { header: 'Jobs', key: 'jobs', width: 10 },
          { header: 'Revenue', key: 'revenue', width: 15 },
        ];

        data.topTechnicians.forEach((tech: any, index: number) => {
          techniciansSheet.addRow({
            rank: index + 1,
            name: tech.name || 'Unknown',
            rating: tech.rating?.toFixed(1) || 'N/A',
            jobs: tech.jobs || 0,
            revenue: tech.revenue || 0,
          });
        });
      }

      // Customer Satisfaction Sheet
      if (data.customerSatisfaction && data.customerSatisfaction.length > 0) {
        const satisfactionSheet = workbook.addWorksheet(
          'Customer Satisfaction'
        );
        satisfactionSheet.columns = [
          { header: 'Stars', key: 'stars', width: 10 },
          { header: 'Count', key: 'count', width: 10 },
          { header: 'Percentage', key: 'percentage', width: 15 },
        ];

        data.customerSatisfaction.forEach((item: any) => {
          satisfactionSheet.addRow({
            stars: item.stars,
            count: item.count,
            percentage: `${item.percentage?.toFixed(1)}%`,
          });
        });
      }

      // Payment Methods Sheet
      if (data.paymentMethods && data.paymentMethods.length > 0) {
        const paymentSheet = workbook.addWorksheet('Payment Methods');
        paymentSheet.columns = [
          { header: 'Method', key: 'method', width: 15 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Percentage', key: 'percentage', width: 15 },
        ];

        const totalAmount = data.paymentMethods.reduce(
          (sum: number, method: any) => sum + method.amount,
          0
        );
        data.paymentMethods.forEach((method: any) => {
          const percentage =
            totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0;
          paymentSheet.addRow({
            method: method.method.toUpperCase(),
            amount: method.amount,
            percentage: `${percentage.toFixed(1)}%`,
          });
        });
      }

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      return {
        buffer: Buffer.from(buffer),
        filename: `report-${new Date().toISOString().split('T')[0]}.xlsx`,
      };
    } catch (error) {
      throw error;
    }
  }

  private getMimeType(format: string): string {
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

  // ... (keep all the helper methods the same as before)
  private async getTotalRevenue(dateFilter: any): Promise<number> {
    const result = await OrderSchema.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'completed',
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  private async getTotalBookings(dateFilter: any): Promise<number> {
    return await OrderSchema.countDocuments({
      ...dateFilter,
      status: { $in: ['completed', 'confirmed', 'in_progress'] },
    });
  }

  private async getTotalUsers(dateFilter: any): Promise<number> {
    return await UserSchema.countDocuments({
      ...dateFilter,
      roles: 'user',
      status: 'Active',
      isDeleted: false,
    });
  }

  private async getTotalTechnicians(dateFilter: any): Promise<number> {
    return await Technician.countDocuments({
      status: 'approved',
    });
  }

  private async getRevenueTrend(dateFilter: any): Promise<any[]> {
    const months = 6;
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthName = date.toLocaleString('default', { month: 'short' });
      const revenue = await this.getMonthlyRevenue(date, dateFilter);
      const profit = revenue * 0.4;

      result.push({
        period: monthName,
        revenue,
        profit,
      });
    }

    return result;
  }

  private async getTopTechnicians(dateFilter: any): Promise<any[]> {
    return await OrderSchema.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'completed',
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: '$technicianId',
          jobs: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      {
        $lookup: {
          from: 'technicians',
          localField: '_id',
          foreignField: '_id',
          as: 'technician',
        },
      },
      {
        $unwind: {
          path: '$technician',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          technicianId: '$_id',
          name: '$technician.displayName',
          rating: '$technician.averageRating',
          jobs: 1,
          revenue: 1,
        },
      },
      {
        $sort: { revenue: -1 },
      },
      {
        $limit: 5,
      },
    ]);
  }

  private async getCustomerSatisfaction(dateFilter: any): Promise<any[]> {
    const ratings = await ReviewSchema.aggregate([
      {
        $match: {
          ...dateFilter,
          status: { $in: ['published', 'pending'] },
          rating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const total = ratings.reduce((sum, item) => sum + item.count, 0);

    return [5, 4, 3, 2, 1].map(star => {
      const existing = ratings.find(r => r._id === star);
      const count = existing?.count || 0;
      return {
        stars: star,
        count: count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      };
    });
  }

  private async getPaymentMethods(dateFilter: any): Promise<any[]> {
    const paymentMethods = await OrderSchema.aggregate([
      {
        $match: {
          ...dateFilter,
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: '$payment.method',
          amount: { $sum: '$totalAmount' },
        },
      },
      {
        $project: {
          method: '$_id',
          amount: 1,
          _id: 0,
        },
      },
    ]);

    const allMethods = ['online', 'cod', 'wallet'];
    return allMethods.map(method => {
      const existing = paymentMethods.find(pm => pm.method === method);
      return {
        method: method,
        amount: existing?.amount || 0,
      };
    });
  }

  private async getMonthlyRevenue(
    date: Date,
    additionalFilter: any
  ): Promise<number> {
    const monthFilter = {
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      },
    };

    const result = await OrderSchema.aggregate([
      {
        $match: {
          ...monthFilter,
          ...additionalFilter,
          status: 'completed',
          'payment.status': 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }
}
