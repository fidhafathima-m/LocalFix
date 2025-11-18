import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../../components/common/Header";
import {
  ArrowLeftOutlined,
  CalendarMonthOutlined,
  CheckCircleOutline,
} from "@mui/icons-material";
import { Card } from "./sections/Card";
import { Badge } from "./sections/Badge";
import Footer from "../../../../components/common/Footer";
import { TechnicianSubscriptionService } from "../../../../services/technician/subscriptionService";
import type { SubscriptionPurchase } from "../../../../interface/technician/ISubscription";
import toast from "react-hot-toast";

export function SubscriptionDetails() {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] =
    useState<SubscriptionPurchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      const response =
        await TechnicianSubscriptionService.getCurrentSubscription();
      console.log("Full subscription response:", response);

      // Extract the subscription from the response structure { subscription: {...} }
      const subscriptionData = response.subscription;
      console.log("Extracted subscription data:", subscriptionData);

      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error("Error fetching current subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  // Get actual features from the subscription plan
  const getFeatures = () => {
    if (!currentSubscription) return [];

    const plan = currentSubscription.subscriptionPlanId;
    if (
      typeof plan === "object" &&
      plan.features &&
      Array.isArray(plan.features)
    ) {
      return plan.features;
    }

    return [];
  };

  const getPlanName = () => {
    if (!currentSubscription) return "";

    const plan = currentSubscription.subscriptionPlanId;
    if (typeof plan === "object" && plan.name) {
      return plan.name;
    }
    return "";
  };

  const getCommissionRate = () => {
    if (!currentSubscription) return 0;

    // Use the commissionRate from the subscription purchase
    if (currentSubscription.commissionRate !== undefined) {
      return currentSubscription.commissionRate;
    }

    // Fallback to plan commission rate
    const plan = currentSubscription.subscriptionPlanId;
    if (typeof plan === "object" && plan.commissionRate !== undefined) {
      return plan.commissionRate;
    }

    return 0;
  };

  const getPrice = () => {
    if (!currentSubscription) return "₹0";
    return `₹${currentSubscription.amount || 0}`;
  };

  const getDuration = () => {
    if (!currentSubscription) return "";

    const plan = currentSubscription.subscriptionPlanId;
    const months =
      currentSubscription.durationMonths ||
      (typeof plan === "object" ? plan.durationMonths : 0);

    if (months === 1) return "1 month";
    if (months === 3) return "3 months";
    if (months === 6) return "6 months";
    if (months === 12) return "1 year";
    return `${months} months`;
  };

  const getStartDate = () => {
    if (!currentSubscription?.startDate) return "";

    return new Date(currentSubscription.startDate).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExpiryDate = () => {
    if (currentSubscription?.endDate) {
      return new Date(currentSubscription.endDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    // Calculate expiry date based on start date and duration
    if (currentSubscription?.startDate) {
      const plan = currentSubscription.subscriptionPlanId;
      const months =
        currentSubscription.durationMonths ||
        (typeof plan === "object" ? plan.durationMonths : 0);

      if (months > 0) {
        const startDate = new Date(currentSubscription.startDate);
        const expiryDate = new Date(startDate);
        expiryDate.setMonth(expiryDate.getMonth() + months);

        return expiryDate.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
    }

    return "";
  };

  const getPaymentMethod = () => {
    if (!currentSubscription?.paymentMethod) return "";

    switch (currentSubscription.paymentMethod) {
      case "card":
        return "Credit/Debit Card";
      case "wallet":
        return "Wallet";
      case "razorpay":
        return "Razorpay";
      default:
        return currentSubscription.paymentMethod;
    }
  };

  const getPaymentDate = () => {
    if (!currentSubscription?.createdAt) return "";

    return new Date(currentSubscription.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSubscriptionStatus = () => {
    if (!currentSubscription) return "";

    if (currentSubscription.status) {
      return (
        currentSubscription.status.charAt(0).toUpperCase() +
        currentSubscription.status.slice(1)
      );
    }

    // Check if subscription is expired
    if (currentSubscription.endDate) {
      const now = new Date();
      const endDate = new Date(currentSubscription.endDate);
      return endDate < now ? "Expired" : "Active";
    }

    return "Active";
  };

  const getStatusBadgeVariant = () => {
    const status = getSubscriptionStatus().toLowerCase();
    switch (status) {
      case "active":
        return "success";
      case "expired":
        return "error";
      case "cancelled":
        return "warning";
      default:
        return "success";
    }
  };

  const handleContactSupport = () => {
    toast.success("Redirecting to support...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i}>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show empty state if no subscription found
  if (!currentSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate("/technician/dashboard")}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
          >
            <ArrowLeftOutlined className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                No Active Subscription
              </h2>
              <p className="text-yellow-600 mb-6">
                You don't have an active subscription. Subscribe to enjoy
                reduced commission rates and premium features.
              </p>
              <button
                onClick={() => navigate("/technician/subscription-plans")}
                className="bg-blue-500 text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Browse Subscription Plans
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const features = getFeatures();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header userType="serviceProvider" isApproved={true} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate("/technician/dashboard")}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeftOutlined className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription Details
          </h1>
          <p className="text-gray-600">
            View and manage your current subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Plan Summary
                </h2>
                <Badge variant={getStatusBadgeVariant()}>
                  {getSubscriptionStatus()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plan</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getPlanName()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getPrice()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">{getDuration()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                  <Badge
                    variant={getCommissionRate() === 0 ? "success" : "info"}
                  >
                    {getCommissionRate()}%
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Start Date</p>
                  <p className="font-semibold text-gray-900">
                    {getStartDate()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    Expiry Date
                    <CalendarMonthOutlined className="w-4 h-4 text-gray-400" />
                  </p>
                  <p className="font-semibold text-gray-900">
                    {getExpiryDate()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Features Included
                </p>
                {features.length > 0 ? (
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <CheckCircleOutline className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No features listed</p>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Information
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900">
                    {getPaymentMethod()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                  <p className="font-semibold text-gray-900">
                    {getPaymentDate()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-semibold text-gray-900">
                    {currentSubscription.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Subscription ID</p>
                  <p className="font-semibold text-gray-900">
                    {currentSubscription._id}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Actions</h2>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/technician/subscription-plans")}
                  className="w-full px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
                >
                  Upgrade Plan
                </button>
                <button
                  onClick={() => navigate("/technician/subscription-plans")}
                  className="w-full px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-500 hover:text-blue-600 focus:ring-blue-500"
                >
                  Renew Plan
                </button>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>

              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your subscription, please
                contact our support team.
              </p>

              <button
                onClick={handleContactSupport}
                className="text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Contact Support
              </button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
