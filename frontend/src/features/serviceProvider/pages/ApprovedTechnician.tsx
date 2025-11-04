/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  CalendarTodayOutlined,
  FmdGoodOutlined,
  StarBorderOutlined,
  Star,
  WarningOutlined,
  BlockOutlined,
  AccessTime,
  CheckCircle,
  Cancel,
  DirectionsCar,
  Build,
} from "@mui/icons-material";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { type TechnicianProfile } from "../../../services/common/technicianApi";
import { TechnicianService } from "../../../services/technician/technicianService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  technicianOrderService,
  type TechnicianOrder,
} from "../../../services/technician/technicianOrderService";

interface DashboardData {
  overview: {
    upcomingOrders: number;
    monthlyEarnings: number;
    totalJobs: number;
    averageRating: number;
  };
  orders: {
    orders: unknown[];
    isNewTechnician?: boolean;
  };
  earnings: {
    earnings: unknown[];
    isNewTechnician?: boolean;
  };
  reviews: {
    reviews: unknown[];
    isNewTechnician?: boolean;
  };
  profile: TechnicianProfile;
  suspensionReason?: string;
  suspendedAt?: string;
}

// Type guard to check if value is a valid string array for languages
function isValidStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

// Safe array filter helper
const safeArrayFilter = <T,>(
  array: T[] | undefined | null,
  predicate: (item: T) => boolean
): T[] => {
  return array?.filter(predicate) || [];
};

// Safe array map helper
const safeArrayMap = <T, U>(
  array: T[] | undefined | null,
  mapper: (item: T) => U
): U[] => {
  return array?.map(mapper) || [];
};

// Safe array slice helper
const safeArraySlice = <T,>(
  array: T[] | undefined | null,
  start?: number,
  end?: number
): T[] => {
  return array?.slice(start, end) || [];
};

const ApprovedTechnicianDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSuspended, setIsSuspended] = useState(false);
  const [orders, setOrders] = useState<TechnicianOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [suspensionInfo, setSuspensionInfo] = useState<{
    reason?: string;
    suspendedAt?: string;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadTechnicianData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await TechnicianService.getProfile();

        if (!response.success) {
          throw new Error("Failed to fetch profile: API returned unsuccessful");
        }

        const profile =
          response.data?.data?.profile ||
          response.data?.profile ||
          response.data?.data;

        if (!profile) {
          throw new Error("Profile data not found in response");
        }

        // Check if technician is suspended
        const suspended = profile.status === "suspended";
        setIsSuspended(suspended);

        // Extract suspension info if available
        if (suspended) {
          setSuspensionInfo({
            reason: profile.suspensionReason || "Violation of terms of service",
            suspendedAt: profile.suspendedAt || new Date().toISOString(),
          });
        }

        setDashboardData({
          overview: {
            upcomingOrders: 0,
            monthlyEarnings: 0,
            totalJobs: 0,
            averageRating: profile.averageRating || 0,
          },
          orders: {
            orders: [],
            isNewTechnician: true,
          },
          earnings: {
            earnings: [],
            isNewTechnician: true,
          },
          reviews: {
            reviews: [],
            isNewTechnician: true,
          },
          profile: {
            ...profile,
            personalInfo: {
              fullName: profile.personalInfo?.fullName,
              gender: profile.personalInfo?.gender || "Not specified",
              phoneNumber:
                profile.personalInfo?.phoneNumber ||
                profile.phone ||
                "Not provided",
              dateOfBirth: profile.personalInfo?.dateOfBirth || "Not specified",
              address: profile.personalInfo?.address || {
                street: "Not specified",
                city: "Not specified",
                state: "Not specified",
                pincode: "Not specified",
              },
              languages: profile.personalInfo?.languages || [],
            },
          },
          suspensionReason: profile.suspensionReason,
          suspendedAt: profile.suspendedAt,
        });
      } catch (err) {
        console.error("Failed to load technician data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load technician profile"
        );
        setDashboardData(getEmptyDashboardData());
      } finally {
        setLoading(false);
      }
    };
    loadTechnicianData();
  }, []);

  // Load orders when tab changes
  // Load orders when tab changes
  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab === "overview" || activeTab === "orders") {
        try {
          setOrdersLoading(true);
          const response = await technicianOrderService.getTechnicianOrders(
            1,
            10
          );

          if (response.success) {
            const loadedOrders = response.data.orders || [];
            setOrders(loadedOrders);

            // Calculate stats from loaded orders
            const newStats = calculateStats(loadedOrders);

            // Update dashboard data with calculated stats
            setDashboardData((prev) =>
              prev
                ? {
                    ...prev,
                    overview: {
                      ...prev.overview,
                      ...newStats,
                    },
                  }
                : null
            );
          }
        } catch (error) {
          console.error("Failed to load orders:", error);
          toast.error("Failed to load orders");
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    if (!isSuspended) {
      loadOrders();
    }
  }, [activeTab, isSuspended]);

  const getEmptyDashboardData = (): DashboardData => {
    return {
      overview: {
        upcomingOrders: 0,
        monthlyEarnings: 0,
        totalJobs: 0,
        averageRating: 0,
      },
      orders: {
        orders: [],
        isNewTechnician: true,
      },
      earnings: {
        earnings: [],
        isNewTechnician: true,
      },
      reviews: {
        reviews: [],
        isNewTechnician: true,
      },
      profile: {
        _id: "",
        userId: "",
        displayName: "",
        email: "",
        phone: "",
        services: [],
        experienceYears: 0,
        workAreas: [],
        averageRating: 0,
        ratingCount: 0,
        profilePictureUrl: "",
        isVerified: false,
        status: "active",
        isApproved: true,
        createdAt: "",
        updatedAt: "",
        personalInfo: {
          fullName: "",
          gender: "Not specified",
          phoneNumber: "",
          dateOfBirth: "",
          address: {
            street: "Not specified",
            city: "Not specified",
            state: "Not specified",
            pincode: "Not specified",
          },
          languages: [],
        },
      },
    };
  };

  // Calculate stats from orders
  const calculateStats = (orders: TechnicianOrder[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const completedOrders = safeArrayFilter(
      orders,
      (order) => order.status === "completed"
    );

    // Filter completed orders for current month
    const monthlyCompletedOrders = safeArrayFilter(completedOrders, (order) => {
      try {
        const orderDate = new Date(order.scheduledAt || order.createdAt);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      } catch {
        return false;
      }
    });

    return {
      upcomingOrders: safeArrayFilter(orders, (order) =>
        ["pending", "accepted", "in_progress", "on_the_way"].includes(
          order.status
        )
      ).length,
      totalJobs: completedOrders.length,
      monthlyEarnings: monthlyCompletedOrders.reduce(
        (total, order) => total + order.totalAmount,
        0
      ),
      averageRating: dashboardData?.overview.averageRating || 0,
    };
  };

  const getCustomerInfo = (order: TechnicianOrder) => {
    try {
      // Handle both object and string cases
      if (order.userId && typeof order.userId === "object") {
        console.log("User object:", order.userId); // Debug log
        return {
          name: order.userId.fullName || "Customer",
          phone: order.userId.phone || "Not provided",
          email: order.userId.email || "Not provided",
        };
      } else if (typeof order.userId === "string") {
        console.log("User string:", order.userId); // Debug log to see if fullName exists

        // Check if fullName exists in the string
        const fullNameMatch = order.userId.match(/fullName:\s*'([^']+)'/);
        const phoneMatch = order.userId.match(/phone:\s*'([^']+)'/);
        const emailMatch = order.userId.match(/email:\s*'([^']+)'/);

        return {
          name: fullNameMatch ? fullNameMatch[1] : "Customer",
          phone: phoneMatch ? phoneMatch[1] : "Not provided",
          email: emailMatch ? emailMatch[1] : "Not provided",
        };
      }
    } catch (error) {
      console.error("Error getting customer info:", error);
    }

    // Final fallback
    return {
      name: "Customer",
      phone: "Not provided",
      email: "Not provided",
    };
  };

  // Helper function to get languages as array
  const getLanguagesArray = (languages: unknown): string[] => {
    if (!languages) return [];

    if (isValidStringArray(languages)) {
      return languages.filter((lang) => lang && String(lang).trim() !== "");
    }

    if (typeof languages === "string") {
      if (languages.trim() === "") return [];

      try {
        const parsed = JSON.parse(languages);
        if (isValidStringArray(parsed)) {
          return parsed.filter((lang) => lang && String(lang).trim() !== "");
        }
      } catch {
        if (languages.includes(",")) {
          return languages
            .split(",")
            .map((lang) => lang.trim())
            .filter((lang) => lang !== "");
        }
        return [languages.trim()];
      }
    }

    return [];
  };

  // Order status management
  // Order status management
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: string,
    reason?: string
  ) => {
    try {
      await technicianOrderService.updateOrderStatus(orderId, status, reason);

      // Update local state
      setOrders((prev) => {
        const updatedOrders = prev.map((order) =>
          order._id === orderId ? { ...order, status: status as any } : order
        );

        // Recalculate stats after status update
        const newStats = calculateStats(updatedOrders);
        setDashboardData((prevData) =>
          prevData
            ? {
                ...prevData,
                overview: {
                  ...prevData.overview,
                  ...newStats,
                },
              }
            : null
        );

        return updatedOrders;
      });

      toast.success(`Order status updated to ${status.replace("_", " ")}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "on_the_way":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AccessTime className="h-4 w-4" />;
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Build className="h-4 w-4" />;
      case "on_the_way":
        return <DirectionsCar className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <Cancel className="h-4 w-4" />;
      default:
        return <AccessTime className="h-4 w-4" />;
    }
  };

  // Suspension Banner Component
  const SuspensionBanner = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <BlockOutlined className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium text-sm">
            Account Suspended
          </h3>
          <p className="text-red-700 text-sm mt-1">
            Your technician account has been suspended by the administrator.
          </p>
          {suspensionInfo.reason && (
            <div className="mt-2">
              <p className="text-red-600 text-xs font-medium">Reason:</p>
              <p className="text-red-600 text-xs mt-1">
                {suspensionInfo.reason}
              </p>
            </div>
          )}
          {suspensionInfo.suspendedAt && (
            <p className="text-red-600 text-xs mt-2">
              Suspended on: {formatDate(suspensionInfo.suspendedAt)}
            </p>
          )}
          <div className="mt-3">
            <p className="text-red-600 text-xs">
              <strong>What this means:</strong>
            </p>
            <ul className="text-red-600 text-xs list-disc list-inside mt-1 space-y-1">
              <li>You cannot accept new orders</li>
              <li>Your profile is not visible to customers</li>
              <li>You cannot access earnings or order features</li>
              <li>You can still view your profile and contact support</li>
            </ul>
          </div>
          <div className="mt-3">
            <button className="bg-red-600 text-white px-4 py-2 rounded text-xs font-medium hover:bg-red-700 mr-2">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Disabled State Overlay for suspended technicians
  const DisabledOverlay = ({
    children,
    tab,
  }: {
    children: React.ReactNode;
    tab: string;
  }) => {
    if (!isSuspended || tab === "profile") return <>{children}</>;

    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <BlockOutlined className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Feature Unavailable
            </h3>
            <p className="text-gray-500 mb-4">
              This feature is temporarily disabled due to account suspension.
            </p>
            <p className="text-gray-400 text-sm">
              Please contact support to resolve this issue.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStars = (rating: number, filled = false) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const StarIcon =
            filled && i < Math.floor(rating) ? Star : StarBorderOutlined;
          return (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          );
        })}
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Not specified") return "Not specified";

    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime())
        ? date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Not specified";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Not specified";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime())
        ? date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Invalid date";
    } catch (error) {
      console.error(error);
      return "Invalid date";
    }
  };

  const getLocation = (profile: TechnicianProfile) => {
    const address = profile.personalInfo?.address;
    if (
      address?.city &&
      address?.state &&
      address.city !== "Not specified" &&
      address.state !== "Not specified"
    ) {
      return `${address.city}, ${address.state}`;
    }
    if (profile.workAreas && profile.workAreas.length > 0) {
      return profile.workAreas[0];
    }
    return "Location not set";
  };

  // Add this function to calculate earnings data
  const calculateEarningsData = (orders: TechnicianOrder[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter completed orders
    const completedOrders = safeArrayFilter(
      orders,
      (order) => order.status === "completed"
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
    const recentEarnings = safeArraySlice(
      completedOrders.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      ),
      0,
      5
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

    return {
      monthlyEarnings,
      totalEarnings,
      weeklyEarnings,
      recentEarnings,
      earningsByService,
      completedOrdersCount: completedOrders.length,
    };
  };

  // Update the earnings tab render function
  const renderEarningsTab = () => {
    if (ordersLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings data...</p>
        </div>
      );
    }

    const earningsData = calculateEarningsData(orders);

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
                        <span>
                          {formatDate(order.updatedAt || order.createdAt)}
                        </span>
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
                <p className="text-gray-500 text-sm">
                  No service data available
                </p>
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
                      earningsData.totalEarnings /
                        earningsData.completedOrdersCount
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

  // Render Orders Section for Overview Tab
  const renderOrdersSection = () => {
    if (ordersLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading orders...</p>
        </div>
      );
    }

    const upcomingOrders = safeArrayFilter(orders, (order) =>
      ["pending", "accepted", "in_progress", "on_the_way"].includes(
        order.status
      )
    );

    if (upcomingOrders.length === 0) {
      return (
        <div className="text-center py-8">
          <CalendarTodayOutlined className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No upcoming orders</p>
          <p className="text-gray-400 text-xs mt-1">
            New orders will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {safeArraySlice(upcomingOrders, 0, 3).map((order) => (
          <div
            key={order._id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-gray-900">
                  {order.serviceName}
                </h4>
                <span
                  className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{}</p>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <CalendarTodayOutlined className="h-3 w-3 mr-1" />
                <span>{formatDateTime(order.scheduledAt)}</span>
                <span className="mx-2">•</span>
                <span>{order.timeSlot}</span>
              </div>
              <p className="text-xs text-gray-500">
                <FmdGoodOutlined className="h-3 w-3 mr-1 inline" />
                {order.address.street}, {order.address.city}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Customer: {getCustomerInfo(order).name} •{" "}
                {getCustomerInfo(order).phone}
              </p>
            </div>
            <div className="flex flex-col gap-2 ml-3">
              {order.status === "pending" && (
                <button
                  onClick={() => handleUpdateOrderStatus(order._id, "accepted")}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"
                >
                  Accept
                </button>
              )}
              {order.status === "accepted" && (
                <button
                  onClick={() =>
                    handleUpdateOrderStatus(order._id, "in_progress")
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700"
                >
                  Start Job
                </button>
              )}
              {order.status === "in_progress" && (
                <button
                  onClick={() =>
                    handleUpdateOrderStatus(order._id, "completed")
                  }
                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-700"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => setActiveTab("orders")}
                className="text-blue-600 text-xs font-medium hover:text-blue-700"
              >
                View
              </button>
            </div>
          </div>
        ))}
        {upcomingOrders.length > 3 && (
          <button
            onClick={() => setActiveTab("orders")}
            className="w-full text-center text-blue-600 text-sm font-medium hover:text-blue-700 py-2 border border-gray-200 rounded-lg hover:bg-blue-50"
          >
            View all {upcomingOrders.length} orders
          </button>
        )}
      </div>
    );
  };

  // Render Orders Tab
  const renderOrdersTab = () => {
    if (ordersLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <CalendarTodayOutlined className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Orders Yet
          </h3>
          <p className="text-gray-500 mb-4">
            You don't have any orders at the moment.
          </p>
          <p className="text-gray-400 text-sm">
            New orders will appear here when customers book your services.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">All Orders</h3>
            <div className="flex gap-2">
              <select className="text-sm border border-gray-300 rounded px-3 py-1">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="on_the_way">On the Way</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {safeArrayMap(orders, (order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {order.serviceName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.replace("_", " ")}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">
                      <strong>Customer:</strong> {getCustomerInfo(order).name}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Phone:</strong> {getCustomerInfo(order).phone}
                    </p>
                    <p className="text-gray-600">
                      <strong>Email:</strong> {getCustomerInfo(order).email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">
                      <strong>When:</strong> {formatDateTime(order.scheduledAt)}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Time Slot:</strong> {order.timeSlot}
                    </p>
                    <p className="text-gray-600">
                      <strong>Address:</strong> {order.address.street},{" "}
                      {order.address.city}
                    </p>
                  </div>
                </div>

                {order.problemDescription && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {order.problemDescription}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Order ID: {order.orderCode}
                  </div>
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(order._id, "accepted")
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              order._id,
                              "cancelled",
                              "Technician unavailable"
                            )
                          }
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {order.status === "accepted" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "in_progress")
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
                      >
                        Start Service
                      </button>
                    )}
                    {order.status === "in_progress" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "completed")
                        }
                        className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    {order.status === "on_the_way" && (
                      <button
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "in_progress")
                        }
                        className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700"
                      >
                        Arrived at Location
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Profile Information</h3>
        {!isSuspended && (
          <button
            className="text-blue-600 text-sm font-medium hover:text-blue-700 cursor-pointer"
            onClick={() => navigate("/technician/profile")}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Account Status Warning for suspended technicians */}
      {isSuspended && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <WarningOutlined className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-yellow-800 font-medium text-sm">
                Profile Editing Disabled
              </h4>
              <p className="text-yellow-700 text-sm">
                You cannot edit your profile while your account is suspended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bio Section */}
      {dashboardData?.profile.bio && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">About Me</h4>
          <p className="text-gray-600 text-sm">{dashboardData.profile.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Personal Details</h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Full Name</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile.personalInfo?.fullName ||
                  "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile.personalInfo?.phoneNumber ||
                  dashboardData?.profile.phone ||
                  "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Gender</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile.personalInfo?.gender || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Date of Birth</dt>
              <dd className="text-sm font-medium">
                {formatDate(
                  dashboardData?.profile.personalInfo?.dateOfBirth || ""
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Languages</dt>
              <dd className="text-sm font-medium">
                {(() => {
                  const languagesArray = getLanguagesArray(
                    dashboardData?.profile.personalInfo?.languages
                  );

                  return languagesArray.length > 0
                    ? languagesArray.join(", ")
                    : "Not specified";
                })()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Professional Details */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">
            Professional Details
          </h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Experience</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile.experienceYears} years
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Services</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile?.services &&
                dashboardData.profile.services.length > 0
                  ? dashboardData?.profile.services.join(", ")
                  : "No services specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Work Areas</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile?.workAreas &&
                dashboardData?.profile.workAreas.length > 0
                  ? dashboardData?.profile.workAreas.join(", ")
                  : "No work areas specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Rating</dt>
              <dd className="text-sm font-medium">
                {dashboardData?.profile.averageRating.toFixed(1)} (
                {dashboardData?.profile.ratingCount} reviews)
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Address Section*/}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Street</dt>
            <dd className="text-sm font-medium">
              {dashboardData?.profile.personalInfo?.address?.street ||
                "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">City</dt>
            <dd className="text-sm font-medium">
              {dashboardData?.profile.personalInfo?.address?.city ||
                "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">State</dt>
            <dd className="text-sm font-medium">
              {dashboardData?.profile.personalInfo?.address?.state ||
                "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Pincode</dt>
            <dd className="text-sm font-medium">
              {dashboardData?.profile.personalInfo?.address?.pincode ||
                "Not specified"}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <DisabledOverlay tab="overview">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarTodayOutlined className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-xs text-gray-500">Upcoming</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {overview.upcomingOrders}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Active orders</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-500 text-lg mr-1">₹</span>
                      <span className="text-xs text-gray-500">This Month</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(overview.monthlyEarnings)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total earnings</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-purple-500 mr-2" />
                      <span className="text-xs text-gray-500">Completed</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {overview.totalJobs}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total jobs</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StarBorderOutlined className="h-5 w-5 text-yellow-500 mr-1" />
                      <span className="text-xs text-gray-500">Rating</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {overview.averageRating.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Average rating</p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <CalendarTodayOutlined className="h-5 w-5 text-blue-500 mr-2" />
                      Upcoming Orders
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {
                        safeArrayFilter(orders, (b) =>
                          [
                            "pending",
                            "accepted",
                            "in_progress",
                            "on_the_way",
                          ].includes(b.status)
                        ).length
                      }
                    </span>
                  </div>
                  {renderOrdersSection()}
                </div>

                {/* Recent Earnings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium flex items-center">
                      <span className="text-green-500 text-xl mr-2">₹</span>
                      Recent Earnings
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {safeArraySlice(
                      safeArrayFilter(orders, (b) => b.status === "completed"),
                      0,
                      5
                    ).map((order) => (
                      <div
                        key={order._id}
                        className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {order.serviceName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.scheduledAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm text-green-600">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </div>
                      </div>
                    ))}
                    {safeArrayFilter(orders, (b) => b.status === "completed")
                      .length === 0 && (
                      <div className="text-center py-8">
                        <span className="text-green-500 text-2xl mx-auto mb-3">
                          ₹
                        </span>
                        <p className="text-gray-500 text-sm">No earnings yet</p>
                        <p className="text-gray-400 text-xs mt-1">
                          Complete orders to see earnings
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {safeArraySlice(orders, 0, 5).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full mr-3 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {order.serviceName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.status.replace("_", " ")} •{" "}
                            {formatDateTime(order.scheduledAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.orderCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DisabledOverlay>
          </div>
        );

      case "orders":
        return (
          <DisabledOverlay tab="orders">{renderOrdersTab()}</DisabledOverlay>
        );

      case "earnings":
        return (
          <DisabledOverlay tab="earnings">
            {renderEarningsTab()}
          </DisabledOverlay>
        );

      case "profile":
        return renderProfileTab();

      default:
        return (
          <DisabledOverlay tab={activeTab}>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">
                This section is under development.
              </p>
            </div>
          </DisabledOverlay>
        );
    }
  };

  if (loading) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading technician profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && (!dashboardData || !dashboardData.profile.displayName)) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!dashboardData) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Failed to load dashboard data</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { overview, profile } = dashboardData;

  return (
    <>
      <Header userType="serviceProvider" isApproved={!isSuspended} />
      <div className="min-h-screen bg-gray-50">
        {/* Suspension Banner - Show at the top if suspended */}
        {isSuspended && <SuspensionBanner />}

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  {profile.profilePictureUrl ? (
                    <img
                      src={profile.profilePictureUrl}
                      alt={profile.personalInfo?.fullName || "Technician"}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-yellow-700 text-xl font-medium">
                      {(
                        profile.personalInfo?.fullName?.charAt(0) || "T"
                      ).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h1 className="text-xl font-semibold mr-2">
                      {profile.personalInfo?.fullName || "Technician"}
                    </h1>
                    {profile.isVerified && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {renderStars(profile.averageRating, true)}
                      <span className="ml-1 text-sm text-gray-600">
                        {profile.averageRating.toFixed(1)} (
                        {profile.ratingCount} reviews)
                      </span>
                    </div>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-600 flex items-center">
                      <FmdGoodOutlined className="h-3 w-3 mr-1" />
                      {getLocation(profile)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Technician ID</p>
                <p className="text-sm font-medium">
                  {profile._id?.slice(-8) || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "orders", label: "Orders" },
                { id: "earnings", label: "Earnings" },
                { id: "profile", label: "Profile" },
                { id: "settings", label: "Settings" },
                { id: "messages", label: "Messages" },
                { id: "notifications", label: "Notifications" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  } ${
                    isSuspended && tab.id !== "profile"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isSuspended && tab.id !== "profile"}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">{renderTabContent()}</div>
      </div>
      <Footer />
    </>
  );
};

export default ApprovedTechnicianDashboard;
