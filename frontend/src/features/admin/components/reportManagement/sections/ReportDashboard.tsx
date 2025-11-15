import type { DashboardResponse } from "../../../../../interface/admin/IDashboard";
import { DashboardService } from "../../../../../services/admin/DashboardService";
import { ReportService } from "../../../../../services/admin/ReportService";
import AnalyticsSection from "../charts/AnalaticsSection";
import GrowthChart from "../charts/GrowthChart";
import PerformanceTable from "../charts/PerformanceTable";
import VisualizationChart from "../charts/VisualizationChart";
import ReportCards from "./ReportCards";
import ReportHeader from "./ReportHeader";
import { useEffect, useState } from "react";

const ReportDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getCompleteDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (
    startDate: Date | null,
    endDate: Date | null
  ) => {
    setDateRange({ start: startDate, end: endDate });
  };

  const handleExport = async (format: "pdf" | "csv" | "excel") => {
    try {
      setExportLoading(true);

      const reportData = {
        startDate: dateRange.start,
        endDate: dateRange.end,
        format: format,
        data: dashboardData,
      };

      const result = await ReportService.generateReport(reportData);

      if (result.success && result.downloadUrl) {
        // Create download link
        const link = document.createElement("a");
        link.href = result.downloadUrl;
        link.download = `report-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke the object URL
        URL.revokeObjectURL(result.downloadUrl);
      } else {
        throw new Error(result.message || "Export failed");
      }
    } catch (err) {
      console.error("Export error:", err);
      alert(
        `Export failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setExportLoading(false);
    }
  };

  const getCustomerSatisfactionData = () => {
    if (!dashboardData?.customerSatisfaction) return [];

    return dashboardData.customerSatisfaction.map((item) => ({
      label: `${item.stars} Star${item.stars !== 1 ? "s" : ""}`,
      value: `${item.percentage.toFixed(1)}%`,
      stars: item.stars,
    }));
  };

  const getPaymentMethodsData = () => {
    if (!dashboardData?.paymentMethods) return [];

    return dashboardData.paymentMethods.map((item) => ({
      label: item.method.charAt(0).toUpperCase() + item.method.slice(1),
      value: `${item.percentage.toFixed(1)}%`,
    }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ReportHeader
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
          isLoading={true}
        />
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm animate-pulse h-64"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse h-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ReportHeader
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
        />
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <div className="text-red-600 text-lg mb-2">
            Error Loading Dashboard
          </div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => fetchDashboardData()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportHeader
        onDateRangeChange={handleDateRangeChange}
        onExport={handleExport}
        isLoading={exportLoading}
      />

      <ReportCards />
      <div className="mt-8">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium mb-4">Revenue & Profit Trend</h2>
          <VisualizationChart />
        </div>
      </div>
      <div className="mt-6">
        <PerformanceTable />
      </div>
      <div className="mt-6">
        <GrowthChart />
      </div>
      <div className="mt-6 space-y-6">
        <AnalyticsSection
          title="Customer Satisfaction"
          data={getCustomerSatisfactionData()}
          showStars={true}
        />
        <AnalyticsSection
          title="Payment Methods"
          data={getPaymentMethodsData()}
        />
      </div>
    </div>
  );
};

export default ReportDashboard;
