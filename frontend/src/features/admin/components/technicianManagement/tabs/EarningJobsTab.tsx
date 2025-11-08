import React, { useState, useEffect } from "react";
import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";
import { formatCurrency } from "../utils/dateUtils";
import { OrderManagementService } from "../../../../../services/admin/OrderManagementService";

interface EarningsJobsTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

interface EarningsData {
  totalEarnings: number;
  totalJobs: number;
  completedJobs: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  averageEarningPerJob: number;
  earningsByService: Record<string, number>;
  recentEarnings: Array<{
    _id: string;
    serviceName: string;
    totalAmount: number;
    createdAt: string;
    orderCode: string;
    status: string;
  }>;
}

const EarningsJobsTab: React.FC<EarningsJobsTabProps> = ({
  technician,
  isSuspended,
}) => {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!technician?._id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all orders for this technician
       const response = await OrderManagementService.getOrdersByTechnician(technician._id, 1, 100);
        const orders = response.orders || [];

        // Calculate earnings data from orders
        const calculatedData = calculateEarningsData(orders);
        setEarningsData(calculatedData);
      } catch (err) {
        console.error('Error fetching earnings data:', err);
        setError('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };

    if (!isSuspended) {
      fetchEarningsData();
    }
  }, [technician?._id, isSuspended]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateEarningsData = (orders: any[]): EarningsData => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter completed orders
    const completedOrders = orders.filter((order) => order.status === "completed");
    
    // Filter pending/accepted orders (active jobs)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const activeOrders = orders.filter((order) => 
      ["pending", "accepted", "in_progress", "on_the_way"].includes(order.status)
    );

    // Calculate monthly earnings
    const monthlyEarnings = completedOrders.reduce((total, order) => {
      try {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        if (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        ) {
          return total + (order.totalAmount || 0);
        }
      } catch (error) {
        console.error("Error processing order date:", error);
      }
      return total;
    }, 0);

    // Calculate weekly earnings (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyEarnings = completedOrders.reduce((total, order) => {
      try {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        if (orderDate >= oneWeekAgo) {
          return total + (order.totalAmount || 0);
        }
      } catch (error) {
        console.error("Error processing order date:", error);
      }
      return total;
    }, 0);

    // Calculate total earnings
    const totalEarnings = completedOrders.reduce(
      (total, order) => total + (order.totalAmount || 0),
      0
    );

    // Calculate earnings by service type
    const earningsByService = completedOrders.reduce((acc, order) => {
      const serviceName = order.serviceName || "Other";
      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName] += order.totalAmount || 0;
      return acc;
    }, {} as Record<string, number>);

    // Get recent earnings (last 5 completed orders)
    const recentEarnings = completedOrders
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 5)
      .map(order => ({
        _id: order._id,
        serviceName: order.serviceName,
        totalAmount: order.totalAmount || 0,
        createdAt: order.updatedAt || order.createdAt,
        orderCode: order.orderCode,
        status: order.status
      }));

    return {
      totalEarnings,
      totalJobs: orders.length,
      completedJobs: completedOrders.length,
      monthlyEarnings,
      weeklyEarnings,
      averageEarningPerJob: completedOrders.length > 0 ? totalEarnings / completedOrders.length : 0,
      earningsByService,
      recentEarnings
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-6">Earnings & Jobs</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading earnings data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-6">Earnings & Jobs</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> No new earnings while technician is suspended.
          </p>
        </div>
      )}
      
      <h2 className="text-lg font-medium mb-6">Earnings & Jobs</h2>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-800">
            {formatCurrency(earningsData?.totalEarnings || 0)}
          </p>
          <p className="text-green-600 text-sm">Total Earnings</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-800">
            {earningsData?.totalJobs || 0}
          </p>
          <p className="text-blue-600 text-sm">Total Jobs</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-800">
            {earningsData?.completedJobs || 0}
          </p>
          <p className="text-purple-600 text-sm">Completed Jobs</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(earningsData?.monthlyEarnings || 0)}
          </p>
          <p className="text-gray-600 text-xs">This Month</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(earningsData?.weeklyEarnings || 0)}
          </p>
          <p className="text-gray-600 text-xs">This Week</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(earningsData?.averageEarningPerJob || 0)}
          </p>
          <p className="text-gray-600 text-xs">Avg per Job</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-lg font-bold text-gray-800">
            {earningsData?.totalJobs && earningsData.completedJobs > 0 
              ? Math.round((earningsData.completedJobs / earningsData.totalJobs) * 100) 
              : 0}%
          </p>
          <p className="text-gray-600 text-xs">Completion Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Earnings */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Recent Earnings</h3>
          {earningsData?.recentEarnings && earningsData.recentEarnings.length > 0 ? (
            <div className="space-y-3">
              {earningsData.recentEarnings.map((earning) => (
                <div
                  key={earning._id}
                  className="flex justify-between items-center p-3 bg-white rounded border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {earning.serviceName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order: {earning.orderCode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-green-600">
                      {formatCurrency(earning.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No recent earnings</p>
            </div>
          )}
        </div>

        {/* Earnings by Service */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Earnings by Service</h3>
          {earningsData?.earningsByService && Object.keys(earningsData.earningsByService).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(earningsData.earningsByService)
                .sort(([, a], [, b]) => b - a)
                .map(([serviceName, amount]) => (
                  <div
                    key={serviceName}
                    className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {serviceName}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No service data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Status Breakdown */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4">Job Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded border border-gray-200">
            <p className="text-lg font-bold text-blue-600">{earningsData?.completedJobs || 0}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div className="text-center p-3 bg-white rounded border border-gray-200">
            <p className="text-lg font-bold text-yellow-600">
              {earningsData ? earningsData.totalJobs - earningsData.completedJobs : 0}
            </p>
            <p className="text-xs text-gray-600">Active/Pending</p>
          </div>
          <div className="text-center p-3 bg-white rounded border border-gray-200">
            <p className="text-lg font-bold text-green-600">
              {earningsData?.totalJobs || 0}
            </p>
            <p className="text-xs text-gray-600">Total Assigned</p>
          </div>
          <div className="text-center p-3 bg-white rounded border border-gray-200">
            <p className="text-lg font-bold text-purple-600">
              {earningsData?.totalJobs && earningsData.completedJobs > 0 
                ? Math.round((earningsData.completedJobs / earningsData.totalJobs) * 100) 
                : 0}%
            </p>
            <p className="text-xs text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsJobsTab;