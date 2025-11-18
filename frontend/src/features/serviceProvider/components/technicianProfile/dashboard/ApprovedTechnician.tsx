/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import tab components
import OverviewTab from "./tabs/OverviewTab";
import OrdersTab from "./tabs/OrdersTab";
import EarningsTab from "./tabs/EarningsTab";
import ProfileTab from "./tabs/ProfileTab";
import SuspensionBanner from "./components/SuspensionBanner";
import DisabledOverlay from "./components/DisabledOverlay";
import type { TechnicianProfile } from "../../../../../interface/technician/ITechnicianApi";
import type { TechnicianOrder } from "../../../../../interface/technician/IOrderService";
import { TechnicianService } from "../../../../../services/technician/technicianService";
import { technicianOrderService } from "../../../../../services/technician/technicianOrderService";
import Header from "../../../../../components/common/Header";
import Footer from "../../../../../components/common/Footer";
import RatingsTab from "./tabs/RatingsTab";
import NotificationSection from "./tabs/NotificationsTab";
import { NotificationService } from "../../../../../services/notificationService";
import SubscriptionBanner from "../../subscription/SubscriptionBanner";
import { TechnicianSubscriptionService } from "../../../../../services/technician/subscriptionService";

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
  subscription?: {
    isSubscribed: boolean;
    subscriptionPlan?: string;
    commissionRate?: number;
    expiryDate?: string;
    planId?: string;
  };
}

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
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate();

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");

    if (
      tabParam &&
      [
        "overview",
        "orders",
        "earnings",
        "profile",
        "ratings",
        "notifications",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // Update URL without page reload
    const newUrl = `${window.location.pathname}?tab=${tabId}`;
    window.history.pushState({}, "", newUrl);

    // If switching to notifications tab and there are unread notifications, mark them as read
    if (tabId === "notifications" && unreadNotificationCount > 0) {
      markNotificationsAsRead();
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      if (dashboardData?.profile?._id) {
        await NotificationService.markAllAsRead(dashboardData.profile._id);
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  useEffect(() => {
    const loadTechnicianData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load profile data first
        const profileResponse = await TechnicianService.getProfile();

        if (!profileResponse.success) {
          throw new Error("Failed to fetch profile: API returned unsuccessful");
        }

        const profile =
          profileResponse.data?.data?.profile ||
          profileResponse.data?.profile ||
          profileResponse.data?.data;

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

        // Load subscription data using the technician ID
        let subscriptionData = {
          isSubscribed: false,
          subscriptionPlan: "Free Plan",
          commissionRate: 10, // Default commission for unsubscribed
          expiryDate: undefined as string | undefined,
          planId: undefined,
        };

        try {
          const subscriptionResponse =
            await TechnicianSubscriptionService.getCurrentSubscription();
          console.log("Subscription API Response:", subscriptionResponse);

          // Check if subscription data exists and is active
          const currentSubscription = subscriptionResponse.subscription;
          console.log("Current subscription:", currentSubscription);

          if (currentSubscription && currentSubscription.status === "active") {
            subscriptionData = {
              isSubscribed: true,
              subscriptionPlan: getPlanName(currentSubscription),
              commissionRate: currentSubscription.commissionRate || 0,
              expiryDate: currentSubscription.endDate,
              planId: currentSubscription._id,
            };
            console.log(
              "✅ Subscription data successfully set:",
              subscriptionData
            );
          }
        } catch (subscriptionError) {
          console.error("No active subscription found:", subscriptionError);
          // This is normal - technician might not have a subscription
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
          subscription: subscriptionData,
        });

        // Load unread notification count
        if (profile._id) {
          loadUnreadNotificationCount(profile._id);
        }
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

  // Helper function to get plan name from subscription data
  const getPlanName = (subscription: any): string => {
    if (!subscription) return "Free Plan";

    // If subscriptionPlanId is populated with name
    if (subscription.subscriptionPlanId?.name) {
      return subscription.subscriptionPlanId.name;
    }

    // Determine plan name based on price or duration
    const price = subscription.amount;
    const duration = subscription.durationMonths;

    if (price === 499 && duration === 1) return "Basic Plan";
    if (price === 999 && duration === 3) return "Standard Plan";
    if (price === 4999 && duration === 12) return "Premium Plan";

    return "Subscription Plan";
  };

  const loadUnreadNotificationCount = async (technicianId: string) => {
    try {
      const count = await NotificationService.getUnreadCount(technicianId);
      setUnreadNotificationCount(count);
    } catch (error) {
      console.error("Failed to load unread notification count:", error);
    }
  };

  // Refresh notification count when tab changes or when orders are updated
  useEffect(() => {
    if (dashboardData?.profile?._id) {
      loadUnreadNotificationCount(dashboardData.profile._id);
    }
  }, [activeTab, dashboardData?.profile?._id]);

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

            // Calculate stats from loaded orders - use profile from dashboardData
            if (dashboardData) {
              const newStats = calculateStats(
                loadedOrders,
                dashboardData.profile
              );

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
          }
        } catch (error) {
          console.error("Failed to load orders:", error);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    if (!isSuspended && dashboardData?.profile?._id) {
      // Only load if we have a profile ID
      loadOrders();
    }
  }, [activeTab, isSuspended, dashboardData?.profile?._id]); // Only depend on profile ID, not entire dashboardData

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
      subscription: {
        isSubscribed: false,
        subscriptionPlan: "Free Plan",
        commissionRate: 10,
        expiryDate: undefined,
        planId: undefined,
      },
    };
  };

  const calculateStats = (
    orders: TechnicianOrder[],
    profile: TechnicianProfile
  ) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const completedOrders =
      orders?.filter((order) => order.status === "completed") || [];

    // Filter completed orders for current month
    const monthlyCompletedOrders = completedOrders.filter((order) => {
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
      upcomingOrders:
        orders?.filter((order) =>
          ["pending", "accepted", "in_progress", "on_the_way"].includes(
            order.status
          )
        ).length || 0,
      totalJobs: completedOrders.length,
      monthlyEarnings: monthlyCompletedOrders.reduce(
        (total, order) => total + (order.totalAmount || 0),
        0
      ),
      averageRating: profile?.averageRating || 0, // Use profile rating as fallback
    };
  };

  const renderTabContent = () => {
    if (!dashboardData) return null;

    const { profile } = dashboardData;

    const tabProps = {
      dashboardData,
      orders,
      ordersLoading,
      isSuspended,
      onUpdateOrderStatus: async (
        orderId: string,
        status: string,
        reason?: string
      ) => {
        try {
          await technicianOrderService.updateOrderStatus(
            orderId,
            status,
            reason
          );

          // Update local state
          setOrders((prev) => {
            const updatedOrders = prev.map((order) =>
              order._id === orderId
                ? { ...order, status: status as any }
                : order
            );

            // Recalculate stats after status update
            const newStats = calculateStats(updatedOrders, profile);
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
        } catch (error) {
          console.error("Failed to update order status:", error);
          throw error;
        }
      },
      setActiveTab: handleTabChange,
    };

    switch (activeTab) {
      case "overview":
        return (
          <DisabledOverlay tab="overview" isSuspended={isSuspended}>
            <OverviewTab {...tabProps} />
          </DisabledOverlay>
        );

      case "orders":
        return (
          <DisabledOverlay tab="orders" isSuspended={isSuspended}>
            <OrdersTab {...tabProps} />
          </DisabledOverlay>
        );

      case "earnings":
        return (
          <DisabledOverlay tab="earnings" isSuspended={isSuspended}>
            <EarningsTab
              {...tabProps}
              currentSubscription={dashboardData.subscription}
              commissionRate={dashboardData.subscription?.commissionRate}
            />
          </DisabledOverlay>
        );

      case "profile":
        return <ProfileTab {...tabProps} navigate={navigate} />;

      case "ratings":
        return (
          <DisabledOverlay tab="ratings" isSuspended={isSuspended}>
            <RatingsTab {...tabProps} />
          </DisabledOverlay>
        );

      case "notifications":
        return (
          <DisabledOverlay tab="notifications" isSuspended={isSuspended}>
            <NotificationSection
              technicianId={profile._id}
              isSuspended={isSuspended}
            />
          </DisabledOverlay>
        );

      default:
        return (
          <DisabledOverlay tab={activeTab} isSuspended={isSuspended}>
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

  const { profile } = dashboardData;

  return (
    <>
      <Header userType="serviceProvider" isApproved={!isSuspended} />
      <div className="min-h-screen bg-gray-50">
        {/* Suspension Banner - Show at the top if suspended */}
        {isSuspended && <SuspensionBanner suspensionInfo={suspensionInfo} />}

        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div>
            <SubscriptionBanner
              techId={profile._id}
              planId={dashboardData.subscription?.planId}
              techName={profile.personalInfo?.fullName}
              rating={profile.averageRating || 0} // Use averageRating instead of ratingCount
              services={profile.services}
              profilePictureUrl={profile.profilePictureUrl}
              isSubscribed={dashboardData.subscription?.isSubscribed || false}
              subscriptionPlan={dashboardData.subscription?.subscriptionPlan}
              commissionRate={dashboardData.subscription?.commissionRate}
              expiryDate={dashboardData.subscription?.expiryDate}
            />
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
                { id: "ratings", label: "Ratings" },
                { id: "settings", label: "Settings" },
                { id: "messages", label: "Messages" },
                {
                  id: "notifications",
                  label: "Notifications",
                  badge:
                    unreadNotificationCount > 0
                      ? unreadNotificationCount
                      : null,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-4 text-sm font-medium whitespace-nowrap relative ${
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
                  <span className="flex items-center">
                    {tab.label}
                    {tab.badge && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                        {tab.badge > 9 ? "9+" : tab.badge}
                      </span>
                    )}
                  </span>
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
