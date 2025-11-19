import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import type { RevenueTrend } from "../../../../../interface/admin/IDashboard";
import { DashboardService } from "../../../../../services/admin/DashboardService";

const VisualizationChart = () => {
  const [revenueData, setRevenueData] = useState<RevenueTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRevenueTrend = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getRevenueTrend();
        setRevenueData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch revenue data"
        );
        console.error("Error fetching revenue trend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueTrend();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-gray-500">Loading revenue data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={revenueData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip
            formatter={(value) => [`₹${value}`, "Amount"]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            activeDot={{
              r: 6,
            }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#10b981"
            strokeWidth={2}
            name="Profit"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisualizationChart;
