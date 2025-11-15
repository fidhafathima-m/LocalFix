import { DownloadOutlined } from "@mui/icons-material";
import { useState } from "react";

interface ReportHeaderProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  onExport: (format: "pdf" | "csv" | "excel") => void;
  isLoading?: boolean;
}

const ReportHeader = ({
  onDateRangeChange,
  onExport,
  isLoading = false,
}: ReportHeaderProps) => {
  const [selectedRange, setSelectedRange] = useState<string>("1month");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);

    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case "1month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "custom":
        // Custom dates will be handled separately
        return;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    onDateRangeChange(startDate, endDate);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleExport = (format: "pdf" | "csv" | "excel") => {
    onExport(format);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Reports & Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View and analyze business metrics
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Date Range Selector */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="date-range"
            className="text-sm font-medium text-gray-700"
          >
            Date Range:
          </label>
          <select
            id="date-range"
            value={selectedRange}
            onChange={(e) => handleRangeChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="1month">Last 1 Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last 1 Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {selectedRange === "custom" && (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCustomDateApply}
              disabled={!customStartDate || !customEndDate || isLoading}
              className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        )}

        {/* Export Dropdown */}
        <div className="relative group">
          <button
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <DownloadOutlined className="mr-1" fontSize="small" />
            Export
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="py-1">
              <button
                onClick={() => handleExport("pdf")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📄 Export as PDF
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📊 Export as CSV
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                📈 Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
