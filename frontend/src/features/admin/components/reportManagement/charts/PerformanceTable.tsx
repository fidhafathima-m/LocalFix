import { StarBorderOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import type { TopTechnician } from "../../../../../interface/admin/IDashboard";
import { DashboardService } from "../../../../../services/admin/DashboardService";
import { useNavigate } from "react-router-dom";

const PerformanceTable = () => {
  const [technicians, setTechnicians] = useState<TopTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopTechnicians = async () => {
      try {
        setLoading(true);
        const data = await DashboardService.getTopTechnicians(5);

        if (Array.isArray(data)) {
          setTechnicians(data);
        } else {
          setTechnicians([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch technicians data";
        setError(errorMessage);
        console.error("Error fetching top technicians:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTechnicians();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-medium">Top Performing Technicians</h2>
          <button
            onClick={() => navigate("/admin/technician-management")}
            className="text-blue-600 text-sm font-medium cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-lg font-medium">Top Performing Technicians</h2>
          <button
            onClick={() => navigate("/admin/technician-management")}
            className="text-blue-600 text-sm font-medium cursor-pointer"
          >
            View All
          </button>
        </div>
        <div className="p-5 text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <h2 className="text-lg font-medium">Top Performing Technicians</h2>
        <button
          onClick={() => navigate("/admin/technician-management")}
          className="text-blue-600 text-sm font-medium cursor-pointer"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technician
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jobs
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {technicians.map((technician, index) => (
              <tr key={technician.technicianId || `tech-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {technician.name || "Unknown Technician"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <StarBorderOutlined className="text-yellow-500 mr-1" />
                    {technician.rating ? technician.rating.toFixed(1) : "0.0"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {technician.jobs ? formatNumber(technician.jobs) : "0"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {technician.revenue
                    ? formatCurrency(technician.revenue)
                    : "₹0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {technicians.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No technician data available
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTable;
