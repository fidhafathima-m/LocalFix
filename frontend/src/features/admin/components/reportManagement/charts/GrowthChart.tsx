import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import type { GrowthMetrics } from "../../../../../interface/admin/IDashboard";
import { DashboardService } from "../../../../../services/admin/DashboardService";

const GrowthChart = () => {
  const [growthData, setGrowthData] = useState<GrowthMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrowthMetrics = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getGrowthMetrics();
        console.log("Growth metrics data:", data);
        setGrowthData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch growth data"
        );
        console.error("Error fetching growth metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-medium">Month-over-Month Growth</h2>
        </div>
        <div className="p-5 h-64 flex items-center justify-center">
          <div className="text-gray-500">Loading growth data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-medium">Month-over-Month Growth</h2>
        </div>
        <div className="p-5 h-64 flex items-center justify-center">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="text-lg font-medium">Month-over-Month Growth</h2>
      </div>
      <div className="p-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={growthData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[0, "dataMax + 10"]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Growth"]}
              labelFormatter={(label) => `Metric: ${label}`}
            />
            <Bar
              dataKey="growth"
              fill="#3b82f6"
              barSize={20}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GrowthChart;
