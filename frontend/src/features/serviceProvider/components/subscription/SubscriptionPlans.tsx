import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../../../../components/common/Header";
import { InfoOutline } from "@mui/icons-material";
import { PlanCard } from "./sections/PlanCard";
import Footer from "../../../../components/common/Footer";
import type { Subscription } from "../../../../interface/technician/ISubscription";
import toast from "react-hot-toast";
import { TechnicianSubscriptionService } from "../../../../services/technician/subscriptionService";

export function SubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TechnicianSubscriptionService.getSubscriptions();
      setPlans(response.subscriptions);
    } catch (err) {
      console.error("Error fetching subscriptions:", err);
      setError("Failed to load subscription plans. Please try again later.");
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (plan: Subscription) => {
    // Navigate to checkout with plan ID
    navigate(`/technician/subscription-plan/${plan.id}/checkout`);
  };

  const formatPlanData = (plan: Subscription) => {
    return {
      id: plan.id,
      name: plan.name,
      price: `₹ ${plan.price}`,
      duration: getDurationDisplay(plan.durationMonths),
      commission: `${plan.commissionRate}%`,
      features:
        plan.features.length > 0 ? plan.features : getDefaultFeatures(plan),
      isPopular:
        plan.name.toLowerCase().includes("standard") ||
        plan.name.toLowerCase().includes("pro"),
    };
  };

  const getDurationDisplay = (durationMonths: number) => {
    if (durationMonths === 1) return "/1 month";
    if (durationMonths < 12) return `/${durationMonths} months`;
    if (durationMonths === 12) return "/1 year";
    return `/${durationMonths / 12} years`;
  };

  const getDefaultFeatures = (plan: Subscription) => {
    const baseFeatures = [
      "Access to all service categories",
      "Basic customer support",
    ];

    if (plan.commissionRate <= 2) {
      baseFeatures.push("Priority in search results");
      baseFeatures.push("Monthly performance reports");
    }

    if (plan.commissionRate === 0) {
      baseFeatures.push("Featured badge on your profile");
      baseFeatures.push("Dedicated account manager");
    }

    baseFeatures.push(`Reduced commission rate (${plan.commissionRate}%)`);

    return baseFeatures;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header userType="serviceProvider" isApproved={true} />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Plans
              </h3>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={fetchSubscriptions}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose a Subscription Plan
          </h1>
          <p className="text-gray-600">
            Subscribe to reduce or eliminate commission fees and get more
            visibility
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-12 flex gap-4">
          <InfoOutline className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Why Subscribe?</h3>
            <p className="text-sm text-gray-600">
              By default, unsubscribed technicians pay 10% commission on each
              booking. Subscribe to a plan to reduce or eliminate commission
              fees and get more visibility to customers.
            </p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                No Plans Available
              </h3>
              <p className="text-yellow-600 text-sm">
                There are no active subscription plans available at the moment.
                Please check back later.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  {...formatPlanData(plan)}
                  onSubscribe={() => handleSubscribe(plan)}
                />
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Subscription FAQs
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    What happens when my subscription expires?
                  </h3>
                  <p className="text-sm text-gray-600">
                    When your subscription expires, you'll revert to the default
                    10% commission rate. You can renew anytime to continue
                    enjoying reduced rates.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Can I upgrade my plan?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Yes, you can upgrade to a higher plan at any time. The
                    remaining value of your current plan will be prorated and
                    applied to your new plan.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Is there automatic renewal?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Yes, plans are set to auto-renew by default to ensure
                    uninterrupted service. You can disable auto-renewal in your
                    subscription settings.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
