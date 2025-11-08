import React from "react";
import { CalendarTodayOutlined } from "@mui/icons-material";
import type { TabProps } from "../types";
import { formatCurrency, formatDate, getCustomerInfo } from "../utils/helpers";

const EarningsTab: React.FC<TabProps> = ({ orders }) => {
  const calculateEarningsData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter completed orders
    const completedOrders = orders?.filter((order) => order.status === "completed") || [];

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

    // Calculate total earnings (all time)
    const totalEarnings = completedOrders.reduce(
      (total, order) => total + (order.totalAmount || 0),
      0
    );

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

    // Get recent earnings (last 5 completed orders)
    const recentEarnings = completedOrders
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      )
      .slice(0, 5);

    // Calculate earnings by service type
    const earningsByService = completedOrders.reduce((acc, order) => {
      const serviceName = order.serviceName || "Other";
      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName] += order.totalAmount || 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      monthlyEarnings,
      totalEarnings,
      weeklyEarnings,
      recentEarnings,
      earningsByService,
      completedOrdersCount: completedOrders.length,
    };
  };

  const earningsData = calculateEarningsData();

  return (
    <div className="space-y-6">
      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              Current
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Earnings from completed orders this month
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
              7 Days
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Earnings from last 7 days
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
              Total
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {earningsData.completedOrdersCount} completed orders
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Earnings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Earnings</h3>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Last 5 orders
            </span>
          </div>

          {earningsData.recentEarnings.length > 0 ? (
            <div className="space-y-4">
              {earningsData.recentEarnings.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm text-gray-900">
                        {order.serviceName}
                      </p>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarTodayOutlined className="h-3 w-3 mr-1" />
                      <span>{formatDate(order.updatedAt || order.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>Order: {order.orderCode}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Customer: {getCustomerInfo(order).name}
                    </p>
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

        {/* Earnings by Service */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Earnings by Service</h3>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Breakdown
            </span>
          </div>

          {Object.keys(earningsData.earningsByService).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(earningsData.earningsByService)
                .sort(([, a], [, b]) => b - a)
                .map(([serviceName, amount]) => (
                  <div
                    key={serviceName}
                    className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
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
            Overview
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
            <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {earningsData.completedOrdersCount > 0
                ? formatCurrency(
                    earningsData.totalEarnings / earningsData.completedOrdersCount
                  )
                : formatCurrency(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Average per Order</p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {Object.keys(earningsData.earningsByService).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Services Offered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsTab;