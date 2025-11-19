import React from "react";
import { CalendarTodayOutlined } from "@mui/icons-material";
import type { TabProps } from "../types";
import { formatCurrency, formatDate, getCustomerInfo } from "../utils/helpers";

interface EarningsTabProps extends TabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentSubscription?: any;
  commissionRate?: number;
}

const EarningsTab: React.FC<EarningsTabProps> = ({
  orders,
  currentSubscription,
  commissionRate = 10, // Default 10% for unsubscribed
}) => {
  const calculateNetEarnings = (totalAmount: number) => {
    if (!currentSubscription) {
      // Unsubscribed - 10% commission
      return totalAmount * 0.9; // Technician gets 90%
    }

    // Subscribed - use their commission rate
    const commission = currentSubscription.commissionRate || commissionRate;
    return totalAmount * (1 - commission / 100);
  };

  const calculateEarningsData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter completed orders
    const completedOrders =
      orders?.filter((order) => order.status === "completed") || [];

    // Calculate earnings with commission
    const monthlyEarnings = completedOrders.reduce((total, order) => {
      try {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        if (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        ) {
          const netEarnings = calculateNetEarnings(order.totalAmount || 0);
          return total + netEarnings;
        }
      } catch (error) {
        console.error("Error processing order date:", error);
      }
      return total;
    }, 0);

    const totalEarnings = completedOrders.reduce((total, order) => {
      const netEarnings = calculateNetEarnings(order.totalAmount || 0);
      return total + netEarnings;
    }, 0);

    // Calculate weekly earnings (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const weeklyEarnings = completedOrders.reduce((total, order) => {
      try {
        const orderDate = new Date(order.updatedAt || order.createdAt);
        // Check if order is within the last 7 days (including today)
        if (orderDate >= oneWeekAgo) {
          const netEarnings = calculateNetEarnings(order.totalAmount || 0);
          return total + netEarnings;
        }
      } catch (error) {
        console.error("Error processing order date:", error);
      }
      return total;
    }, 0);

    // Get recent earnings with commission breakdown
    const recentEarnings = completedOrders
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((order) => {
        const netEarnings = calculateNetEarnings(order.totalAmount || 0);
        const commissionAmount = (order.totalAmount || 0) - netEarnings;
        return {
          ...order,
          netEarnings,
          commissionAmount,
          commissionRate: currentSubscription?.commissionRate || 10,
        };
      });

    // Calculate earnings by service type with commission
    const earningsByService = completedOrders.reduce((acc, order) => {
      const serviceName = order.serviceName || "Other";
      const netEarnings = calculateNetEarnings(order.totalAmount || 0);

      if (!acc[serviceName]) {
        acc[serviceName] = {
          netEarnings: 0,
          totalAmount: 0,
          commission: 0,
        };
      }
      acc[serviceName].netEarnings += netEarnings;
      acc[serviceName].totalAmount += order.totalAmount || 0;
      acc[serviceName].commission += (order.totalAmount || 0) - netEarnings;
      return acc;
    }, {} as Record<string, { netEarnings: number; totalAmount: number; commission: number }>);

    // Calculate commission totals
    const totalCommission = completedOrders.reduce((total, order) => {
      const netEarnings = calculateNetEarnings(order.totalAmount || 0);
      return total + ((order.totalAmount || 0) - netEarnings);
    }, 0);

    return {
      monthlyEarnings,
      totalEarnings,
      weeklyEarnings,
      recentEarnings,
      earningsByService,
      completedOrdersCount: completedOrders.length,
      totalCommission,
      currentCommissionRate: currentSubscription?.commissionRate || 10,
      isSubscribed: !!currentSubscription,
    };
  };

  const earningsData = calculateEarningsData();

  return (
    <div className="space-y-6">
      {/* Subscription Status Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">
              {earningsData.isSubscribed
                ? "Premium Subscription"
                : "Basic Plan"}
            </h3>
            <p className="text-sm opacity-90">
              Commission Rate: {earningsData.currentCommissionRate}%
              {!earningsData.isSubscribed && " (Default)"}
            </p>
          </div>
          {!earningsData.isSubscribed && (
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-green-500 text-2xl mr-2">₹</span>
              <div>
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.monthlyEarnings)}
                </p>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Net
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            After {earningsData.currentCommissionRate}% commission
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-500 text-2xl mr-2">₹</span>
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.weeklyEarnings)}
                </p>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Net
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            After {earningsData.currentCommissionRate}% commission
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-purple-500 text-2xl mr-2">₹</span>
              <div>
                <p className="text-sm text-gray-500">All Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.totalEarnings)}
                </p>
              </div>
            </div>
            <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              Net
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {earningsData.completedOrdersCount} completed orders
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-orange-500 text-2xl mr-2">₹</span>
              <div>
                <p className="text-sm text-gray-500">Total Commission</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.totalCommission)}
                </p>
              </div>
            </div>
            <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
              Platform
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Paid to platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Earnings with Commission Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Earnings</h3>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Commission: {earningsData.currentCommissionRate}%
            </span>
          </div>

          {earningsData.recentEarnings.length > 0 ? (
            <div className="space-y-4">
              {earningsData.recentEarnings.map((order) => (
                <div
                  key={order._id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm text-gray-900">
                      {order.serviceName}
                    </p>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600 block">
                        {formatCurrency(order.netEarnings)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Gross: {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarTodayOutlined className="h-3 w-3 mr-1" />
                    <span>
                      {formatDate(order.updatedAt || order.createdAt)}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Order: {order.orderCode}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      Customer: {getCustomerInfo(order).name}
                    </p>
                    <span className="text-xs text-red-500">
                      -{formatCurrency(order.commissionAmount)} commission
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-green-500 text-4xl mx-auto mb-3">₹</span>
              <p className="text-gray-500 text-sm">No earnings yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Complete orders to see earnings
              </p>
            </div>
          )}
        </div>

        {/* Earnings by Service with Commission */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Earnings by Service</h3>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Net Amount
            </span>
          </div>

          {Object.keys(earningsData.earningsByService).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(earningsData.earningsByService)
                .sort(([, a], [, b]) => b.netEarnings - a.netEarnings)
                .map(([serviceName, data]) => (
                  <div
                    key={serviceName}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {serviceName}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(data.netEarnings)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Gross: {formatCurrency(data.totalAmount)}</span>
                      <span className="text-red-500">
                        Commission: -{formatCurrency(data.commission)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-gray-400 text-4xl mx-auto mb-3">📊</span>
              <p className="text-gray-500 text-sm">No service data available</p>
              <p className="text-gray-400 text-xs mt-1">
                Complete orders to see service breakdown
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Earnings Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Earnings Summary</h3>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {earningsData.currentCommissionRate}% Commission
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {earningsData.completedOrdersCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">Completed Orders</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(earningsData.totalEarnings)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Net Earnings</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {earningsData.completedOrdersCount > 0
                ? formatCurrency(
                    earningsData.totalEarnings /
                      earningsData.completedOrdersCount
                  )
                : formatCurrency(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg Net per Order</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(earningsData.totalCommission)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Commission</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsTab;
