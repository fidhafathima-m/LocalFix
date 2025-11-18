/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../../components/common/Header";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  AccountBalanceWalletOutlined,
} from "@mui/icons-material";
import { Card } from "./sections/Card";
import { Badge } from "./sections/Badge";
import Footer from "../../../../components/common/Footer";
import { walletService } from "../../../../services/user/walletService";
import type { Subscription } from "../../../../interface/technician/ISubscription";
import toast from "react-hot-toast";
import { TechnicianSubscriptionService } from "../../../../services/technician/subscriptionService";
import { technicianSubscriptionAPI } from "../../../../services/common/subscriptionApi";

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SubscriptionCheckout() {
  const navigate = useNavigate();
  const { planId } = useParams();

  const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  console.log("PLanId: ", planId);

  useEffect(() => {
    if (planId) {
      fetchPlanDetails();
      fetchWalletBalance();
    } else {
      toast.error("No plan selected");
      navigate("/technician/subscription-plans");
    }
  }, [planId, navigate]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await TechnicianSubscriptionService.getSubscriptionById(
        planId!
      );
      setSelectedPlan(response.subscription);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      toast.error("Failed to load plan details");
      navigate("/technician/subscription-plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getWalletBalance();
      if (response.success && response.data) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const getDurationDisplay = (durationMonths: number) => {
    if (durationMonths === 1) return "1 month";
    if (durationMonths < 12) return `${durationMonths} months`;
    if (durationMonths === 12) return "1 year";
    return `${durationMonths / 12} years`;
  };

  const hasSufficientBalance = walletBalance >= (selectedPlan?.price || 0);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handleRazorpayPayment = async () => {
    if (!selectedPlan || !planId) return;

    try {
      setProcessingPayment(true);

      // Create Razorpay order
      const orderResponse = await technicianSubscriptionAPI.createRazorpayOrder(
        planId
      );

      if (!orderResponse.success || !orderResponse.data) {
        throw new Error("Failed to create payment order");
      }

      const { razorpayOrder, subscription } = orderResponse.data;

      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount.toString(),
        currency: razorpayOrder.currency,
        name: "Localfix",
        description: `Subscription: ${subscription.name}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResponse =
              await technicianSubscriptionAPI.verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                subscriptionId: planId,
                userId: "current-user-id", // You'll need to get this from your auth context
              });

            if (verificationResponse.success) {
              toast.success("Subscription activated successfully!");
              navigate("/technician/subscription-plan/payment-success", {
                state: {
                  plan: selectedPlan,
                  paymentId: response.razorpay_payment_id,
                  paymentMethod: "card",
                  amount: selectedPlan.price,
                  transactionId: response.razorpay_payment_id,
                },
              });
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            navigate("/technician/subscription-plan/payment-failed");
          }
        },
        prefill: {},
        notes: {
          subscriptionId: planId,
          planName: selectedPlan.name,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        setProcessingPayment(false);
        toast.error(`Payment failed: ${response.error.description}`);
        navigate("/technician/subscription-plan/payment-failed");
      });

      razorpayInstance.open();
    } catch (error: any) {
      console.error("Razorpay payment error:", error);
      toast.error(error.message || "Payment processing failed");
      setProcessingPayment(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!selectedPlan || !planId) return;

    try {
      setProcessingPayment(true);

      const response = await technicianSubscriptionAPI.processWalletPayment(
        planId
      );

      if (response.success) {
        toast.success("Subscription activated successfully using wallet!");
        navigate("/technician/subscription-plan/payment-success", {
          state: {
            plan: selectedPlan,
            paymentMethod: "wallet",
            amount: selectedPlan.price,
            newBalance: response.data.newBalance,
            transactionId: response.data.transaction?.transactionId,
          },
        });
      } else {
        throw new Error(response.message || "Wallet payment failed");
      }
    } catch (error: any) {
      console.error("Wallet payment error:", error);
      toast.error(error.message || "Wallet payment failed");
      setProcessingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (paymentMethod === "card") {
      await handleRazorpayPayment();
    } else if (paymentMethod === "wallet") {
      await handleWalletPayment();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Plan Not Found
              </h3>
              <p className="text-red-600 text-sm">
                The selected subscription plan could not be found.
              </p>
              <button
                onClick={() => navigate("/technician/subscription-plans")}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Plans
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header userType="serviceProvider" isApproved={true} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate("/technician/subscription-plans")}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeftOutlined className="w-4 h-4" />
          Back to Plans
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription Checkout
          </h1>
          <p className="text-gray-600">Review your plan and complete payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border-2 border-blue-500 rounded-lg bg-blue-50 cursor-pointer">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <CreditCardOutlined className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    Credit/Debit Card
                  </span>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    paymentMethod === "wallet"
                      ? "border-blue-500 bg-blue-50"
                      : hasSufficientBalance
                      ? "border-gray-200 hover:border-gray-300"
                      : "border-gray-200 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    disabled={!hasSufficientBalance}
                    className="w-4 h-4 text-blue-500"
                  />
                  <AccountBalanceWalletOutlined className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-900">Wallet</span>
                    <div className="text-sm text-gray-600">
                      {hasSufficientBalance
                        ? `Balance: ₹${walletBalance}`
                        : `Insufficient balance (₹${walletBalance})`}
                    </div>
                  </div>
                </label>

                {paymentMethod === "wallet" && !hasSufficientBalance && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">
                      Your wallet balance is insufficient for this payment.
                      Please add money to your wallet or use another payment
                      method.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-500 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{" "}
                    <button className="text-blue-500 hover:underline">
                      Terms and Conditions
                    </button>{" "}
                    and{" "}
                    <button className="text-blue-500 hover:underline">
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>
            </Card>
          </div>

          <div>
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium text-gray-900">
                    {selectedPlan.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">
                    {getDurationDisplay(selectedPlan.durationMonths)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Commission Rate</span>
                  <Badge variant="info">{selectedPlan.commissionRate}%</Badge>
                </div>
                {selectedPlan.features.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Features:</span>
                    <ul className="mt-2 space-y-1">
                      {selectedPlan.features
                        .slice(0, 3)
                        .map((feature, index) => (
                          <li
                            key={index}
                            className="text-xs text-gray-600 flex items-start"
                          >
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            {feature}
                          </li>
                        ))}
                      {selectedPlan.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{selectedPlan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-gray-900">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{selectedPlan.price}
                    </div>
                    <div className="text-xs text-gray-500">
                      Inclusive of all taxes
                    </div>
                  </div>
                </div>
              </div>

              <button
                disabled={
                  !agreedToTerms ||
                  processingPayment ||
                  (paymentMethod === "wallet" && !hasSufficientBalance)
                }
                onClick={handlePayment}
                className="w-full px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment
                  ? "Processing..."
                  : paymentMethod === "wallet"
                  ? `Pay ₹${selectedPlan.price} from Wallet`
                  : `Pay ₹${selectedPlan.price}`}
              </button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
