/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./actions/AdminSidebar";
import { StatsCard } from "./actions/StatsCard";
import { ApprovalCard } from "./actions/ApprovalCard";
import { ActivityItem } from "./actions/ActivityItem";
import {
  PeopleAltOutlined,
  CalendarMonthOutlined,
  ManageAccountsOutlined,
  CurrencyRupeeOutlined,
  CheckCircleOutlined,
  QueryBuilderOutlined,
} from "@mui/icons-material";
import { useAppSelector } from "../../../../hooks/redux";
import { adminAPI } from "../../../../services/common/adminApi";
import type {
  TechnicianApplication,
  Order,
} from "../../../../interface/admin/IAdminApi";
import type {
  IPayment,
  PaymentStats,
} from "../../../../interface/admin/IPayment";

interface DashboardStats {
  totalUsers: number;
  activeOrders: number;
  totalTechnicians: number;
  monthlyRevenue: number;
  pendingApplications: number;
  pendingPayments: number;
}

interface RecentActivity {
  _id: string;
  name: string;
  action: string;
  time: string;
  type: string;
  rating?: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeOrders: 0,
    totalTechnicians: 0,
    monthlyRevenue: 0,
    pendingApplications: 0,
    pendingPayments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to extract data from API responses
  const extractDataFromResponse = (
    response: any,
    dataKey: string,
    fallbackKey?: string
  ) => {
    if (!response || !response.data) return [];

    // Try multiple possible response structures
    return (
      response.data.data?.[dataKey] ||
      response.data[dataKey] ||
      response.data.data ||
      response.data ||
      (fallbackKey ? response.data[fallbackKey] : []) ||
      []
    );
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        usersResponse,
        techniciansResponse,
        applicationsResponse,
        ordersResponse,
        paymentsResponse,
        paymentStatsResponse,
      ] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getTechnicians(),
        adminAPI.getPendingApplications(),
        adminAPI.getOrders(1, 1000),
        adminAPI.getPayments(1, 100, "", "pending"),
        adminAPI.getPaymentStats(),
      ]);

      console.log("📊 Dashboard API Responses:", {
        users: usersResponse.data,
        technicians: techniciansResponse.data,
        applications: applicationsResponse.data,
        orders: ordersResponse.data,
        payments: paymentsResponse.data,
        paymentStats: paymentStatsResponse.data,
      });

      // Process stats with proper data extraction
      const usersData = extractDataFromResponse(usersResponse, "users");
      const techniciansData = extractDataFromResponse(
        techniciansResponse,
        "technicians"
      );
      const applicationsData = extractDataFromResponse(
        applicationsResponse,
        "applications"
      );

      // Extract orders data - handle nested structure
      const ordersData = extractOrdersData(ordersResponse);
      console.log("📦 Extracted orders data:", ordersData);

      // Extract payments data - handle nested structure
      const paymentsData = extractPaymentsData(paymentsResponse);
      console.log("💳 Extracted payments data:", paymentsData);

      // Extract payment stats
      const paymentStats = extractPaymentStats(paymentStatsResponse);
      console.log("💰 Payment stats:", paymentStats);

      // Calculate active orders (pending, confirmed, in_progress)
      const activeOrders = Array.isArray(ordersData)
        ? ordersData.filter((order: Order) =>
            ["pending", "confirmed", "in_progress"].includes(order.status)
          ).length
        : 0;

      console.log("🔄 Active orders count:", activeOrders);

      // Get revenue from payment stats or calculate from completed payments
      let monthlyRevenue = 0;
      if (paymentStats?.totalRevenue) {
        monthlyRevenue = paymentStats.totalRevenue;
      } else {
        // Fallback: calculate from completed payments
        monthlyRevenue = calculateMonthlyRevenueFromPayments(paymentsData);
      }

      console.log("💵 Monthly revenue:", monthlyRevenue);

      setStats({
        totalUsers: usersData.length,
        activeOrders: activeOrders,
        totalTechnicians: techniciansData.length,
        monthlyRevenue: monthlyRevenue,
        pendingApplications: applicationsData.length,
        pendingPayments: paymentsData.length,
      });

      // Generate recent activity from various sources
      const activity = generateRecentActivity(
        usersData,
        ordersData,
        applicationsData
      );
      setRecentActivity(activity);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Extract orders data from various possible response structures
  const extractOrdersData = (ordersResponse: any): Order[] => {
    if (!ordersResponse?.data) return [];

    const response = ordersResponse.data;

    // Try different possible response structures
    if (response.data?.orders && Array.isArray(response.data.orders)) {
      return response.data.orders;
    }
    if (response.orders && Array.isArray(response.orders)) {
      return response.orders;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }

    console.warn("Unexpected orders response structure:", response);
    return [];
  };

  // Extract payments data from various possible response structures
  const extractPaymentsData = (paymentsResponse: any): IPayment[] => {
    if (!paymentsResponse?.data) return [];

    const response = paymentsResponse.data;

    // Try different possible response structures
    if (response.data?.payments && Array.isArray(response.data.payments)) {
      return response.data.payments;
    }
    if (response.payments && Array.isArray(response.payments)) {
      return response.payments;
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }

    console.warn("Unexpected payments response structure:", response);
    return [];
  };

  // Extract payment stats from response
  const extractPaymentStats = (
    paymentStatsResponse: any
  ): PaymentStats | null => {
    if (!paymentStatsResponse?.data) return null;

    const response = paymentStatsResponse.data;

    // Try different possible response structures
    if (response.data?.stats) {
      return response.data.stats;
    }
    if (response.stats) {
      return response.stats;
    }
    if (response.data) {
      return response.data;
    }

    console.warn("Unexpected payment stats structure:", response);
    return null;
  };

  // More accurate revenue calculation from completed payments
  const calculateMonthlyRevenueFromPayments = (
    payments: IPayment[]
  ): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    console.log("📈 Calculating revenue from payments:", payments.length);

    const monthlyRevenue = payments
      .filter((payment) => {
        if (!payment.createdAt || payment.status !== "success") {
          return false;
        }

        try {
          const paymentDate = new Date(payment.createdAt);
          const isValidDate = !isNaN(paymentDate.getTime());

          if (!isValidDate) {
            console.warn("Invalid payment date:", payment.createdAt);
            return false;
          }

          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        } catch (error) {
          console.error("Error processing payment date:", error);
          return false;
        }
      })
      .reduce((total, payment) => {
        const amount = Number(payment.amount) || 0;
        console.log(`💰 Payment amount: ${amount}`);
        return total + amount;
      }, 0);

    console.log("🎯 Final monthly revenue:", monthlyRevenue);
    return monthlyRevenue;
  };

  const generateRecentActivity = (
    users: any[],
    orders: Order[],
    applications: TechnicianApplication[]
  ): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Add recent orders (all statuses)
    if (Array.isArray(orders)) {
      orders.slice(0, 3).forEach((order) => {
        activities.push({
          _id: order._id,
          name: order.userId?.fullName || "Customer",
          action: `booked ${order.serviceName || "a service"} (${
            order.status
          })`,
          time: formatTimeAgo(order.createdAt),
          type: "booking",
        });
      });
    }

    // Add recent applications
    if (Array.isArray(applications)) {
      applications.slice(0, 2).forEach((application) => {
        activities.push({
          _id: application._id,
          name: application.personal?.fullName || "Applicant",
          action: "applied as a technician",
          time: formatTimeAgo(application.createdAt),
          type: "application",
        });
      });
    }

    // Add recent user registrations
    if (Array.isArray(users)) {
      users.slice(0, 2).forEach((user) => {
        activities.push({
          _id: user._id,
          name: user.fullName,
          action: "joined the platform",
          time: formatTimeAgo(user.createdAt),
          type: "registration",
        });
      });
    }

    // Sort by time (newest first) and take top 5
    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  };

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";

      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      return `${Math.floor(diffInHours / 24)} days ago`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Recently";
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <CalendarMonthOutlined className="h-5 w-5 text-blue-500" />;
      case "application":
        return <ManageAccountsOutlined className="h-5 w-5 text-yellow-500" />;
      case "registration":
        return <PeopleAltOutlined className="h-5 w-5 text-green-500" />;
      case "payment":
        return <CurrencyRupeeOutlined className="h-5 w-5 text-purple-500" />;
      case "cancellation":
        return <QueryBuilderOutlined className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircleOutlined className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityIconBg = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-blue-100";
      case "application":
        return "bg-yellow-100";
      case "registration":
        return "bg-green-100";
      case "payment":
        return "bg-purple-100";
      case "cancellation":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Dashboard" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Dashboard" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage="Dashboard" />
      <div className="flex-1 overflow-y-auto ml-[240px]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome back, {user?.fullName || "Admin"}!
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={<PeopleAltOutlined className="h-6 w-6 text-blue-500" />}
              linkText="View all users"
              linkUrl="/admin/user-management"
              color="blue"
            />
            <StatsCard
              title="Active Orders"
              value={stats.activeOrders.toString()}
              icon={
                <CalendarMonthOutlined className="h-6 w-6 text-green-500" />
              }
              linkText="View active orders"
              linkUrl="/admin/order-management?status=pending"
              color="green"
            />
            <StatsCard
              title="Technicians"
              value={stats.totalTechnicians.toString()}
              icon={
                <ManageAccountsOutlined className="h-6 w-6 text-yellow-500" />
              }
              linkText="View all technicians"
              linkUrl="/admin/technician-management"
              color="yellow"
            />
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(stats.monthlyRevenue)}
              icon={
                <CurrencyRupeeOutlined className="h-6 w-6 text-purple-500" />
              }
              linkText="View financial reports"
              linkUrl="/admin/payments-management"
              color="purple"
            />
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ApprovalCard
                title="Technician Applications"
                count={stats.pendingApplications}
                countLabel="pending approvals"
                actionText="Review applications"
                actionUrl="/admin/technician-management"
                icon={
                  <ManageAccountsOutlined className="h-5 w-5 text-yellow-500" />
                }
                color="yellow"
              />
              <ApprovalCard
                title="Payment Verifications"
                count={stats.pendingPayments}
                countLabel="pending verifications"
                actionText="Process payments"
                actionUrl="/admin/payments-management?status=pending"
                icon={
                  <CurrencyRupeeOutlined className="h-5 w-5 text-green-500" />
                }
                color="green"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <button
                onClick={fetchDashboardData}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <ActivityItem
                    key={activity._id}
                    name={activity.name}
                    action={activity.action}
                    time={activity.time}
                    icon={getActivityIcon(activity.type)}
                    iconBg={getActivityIconBg(activity.type)}
                    rating={activity.rating}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent activity found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
