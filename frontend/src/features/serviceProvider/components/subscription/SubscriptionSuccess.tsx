/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../../components/common/Header";
import { Card } from "./sections/Card";
import { CheckCircleOutlineOutlined } from "@mui/icons-material";
import { Badge } from "./sections/Badge";
import Footer from "../../../../components/common/Footer";
import type { Subscription } from "../../../../interface/technician/ISubscription";
import { TechnicianSubscriptionService } from "../../../../services/technician/subscriptionService";
import toast from "react-hot-toast";

interface PaymentSuccessData {
  plan: Subscription;
  paymentId?: string;
  paymentMethod: "card" | "wallet";
  amount: number;
  newBalance?: number;
  transactionId?: string;
}

export function SubscriptionSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    // Get data passed from checkout
    const stateData = location.state as PaymentSuccessData;

    if (stateData) {
      setPaymentData(stateData);
      fetchCurrentSubscription();
    } else {
      // If no data passed, try to get the latest subscription
      fetchLatestSubscription();
    }
  }, [location.state]);

  const fetchCurrentSubscription = async () => {
    try {
      // Get the current active subscription for the technician
      const subscription =
        await TechnicianSubscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error("Error fetching current subscription:", error);
      // If we have payment data, we can still show the success page
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestSubscription = async () => {
    try {
      setLoading(true);
      // Get subscription history and use the latest one
      const history =
        await TechnicianSubscriptionService.getSubscriptionHistory();
      if (history.length > 0) {
        const latestSubscription = history[0];
        setCurrentSubscription(latestSubscription);
        setPaymentData({
          plan: latestSubscription.subscriptionPlanId,
          paymentMethod: latestSubscription.paymentMethod,
          amount: latestSubscription.amount,
          transactionId: latestSubscription.transactionId,
        });
      } else {
        toast.error("No subscription data found");
        navigate("/technician/subscription-plans");
      }
    } catch (error) {
      console.error("Error fetching subscription history:", error);
      toast.error("Failed to load subscription details");
      navigate("/technician/subscription-plans");
    } finally {
      setLoading(false);
    }
  };

  const getExpiryDate = (startDate: string, durationMonths: number): string => {
    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + durationMonths);

    return expiry.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentMethodDisplay = (method: string): string => {
    switch (method) {
      case "card":
        return "Credit/Debit Card";
      case "wallet":
        return "Wallet";
      case "razorpay":
        return "Razorpay";
      default:
        return method;
    }
  };

  const getPlanName = (): string => {
    if (paymentData?.plan?.name) {
      return paymentData.plan.name;
    }
    if (currentSubscription?.subscriptionPlanId?.name) {
      return currentSubscription.subscriptionPlanId.name;
    }
    return "Subscription Plan";
  };

  const getCommissionRate = (): number => {
    if (paymentData?.plan?.commissionRate !== undefined) {
      return paymentData.plan.commissionRate;
    }
    if (currentSubscription?.commissionRate !== undefined) {
      return currentSubscription.commissionRate;
    }
    if (currentSubscription?.subscriptionPlanId?.commissionRate !== undefined) {
      return currentSubscription.subscriptionPlanId.commissionRate;
    }
    return 0;
  };

  const getAmount = (): number => {
    return paymentData?.amount || currentSubscription?.amount || 0;
  };

  const getExpiryDisplay = (): string => {
    if (currentSubscription?.endDate) {
      return new Date(currentSubscription.endDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    if (paymentData?.plan?.durationMonths && currentSubscription?.startDate) {
      return getExpiryDate(
        currentSubscription.startDate,
        paymentData.plan.durationMonths
      );
    }

    // Fallback: calculate from current date
    const expiry = new Date();
    expiry.setMonth(
      expiry.getMonth() + (paymentData?.plan?.durationMonths || 1)
    );
    return expiry.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                </div>
              </div>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!paymentData && !currentSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Subscription Data Not Found
              </h3>
              <p className="text-yellow-600 text-sm mb-4">
                Unable to retrieve subscription details. Please check your
                subscription history.
              </p>
              <button
                onClick={() => navigate("/technician/subscription-plans")}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Back to Subscription Plans
              </button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const planName = getPlanName();
  const commissionRate = getCommissionRate();
  const amount = getAmount();
  const expiryDate = getExpiryDisplay();
  const paymentMethod =
    paymentData?.paymentMethod || currentSubscription?.paymentMethod;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header userType="serviceProvider" isApproved={true} />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleOutlineOutlined className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Subscription Successful!
          </h1>

          <p className="text-gray-600 mb-8">
            🎉 You are now subscribed to{" "}
            <span className="font-semibold">{planName}</span>.{" "}
            {commissionRate === 0
              ? "Enjoy 0% commission on your bookings!"
              : `Enjoy reduced ${commissionRate}% commission on your bookings!`}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Plan Name</p>
                <p className="font-semibold text-gray-900">{planName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                <Badge variant={commissionRate === 0 ? "success" : "info"}>
                  {commissionRate}%
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                <p className="font-semibold text-gray-900">₹{amount}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900">
                  {getPaymentMethodDisplay(paymentMethod)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Subscription Expires
                </p>
                <p className="font-semibold text-gray-900">{expiryDate}</p>
              </div>
            </div>

            {paymentData?.transactionId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="font-mono text-xs text-gray-500 break-all">
                  {paymentData.transactionId}
                </p>
              </div>
            )}

            {paymentData?.paymentId && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                <p className="font-mono text-xs text-gray-500 break-all">
                  {paymentData.paymentId}
                </p>
              </div>
            )}

            {paymentData?.newBalance !== undefined && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">New Wallet Balance</p>
                <p className="font-semibold text-green-600">
                  ₹{paymentData.newBalance}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/technician/dashboard")}
              className="w-full px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() =>
                navigate(`/technician/subscriptions/${paymentData?.plan.id}`)
              }
              className="w-full px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-500 hover:text-blue-600 focus:ring-blue-500"
            >
              View Subscription Details
            </button>
            <button
              onClick={() => navigate("/technician/subscription-plans")}
              className="w-full px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-600 hover:text-gray-700 focus:ring-gray-500"
            >
              Browse More Plans
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Your reduced commission rate is now active</li>
              <li>• All future bookings will use your new commission rate</li>
              <li>
                • You can manage your subscription in your account settings
              </li>
              <li>
                • You'll receive a reminder before your subscription expires
              </li>
            </ul>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
