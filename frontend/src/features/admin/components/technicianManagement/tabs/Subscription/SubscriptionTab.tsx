/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { RefreshOutlined } from "@mui/icons-material";
import { Badge } from "./Badge";
import { SubscriptionHistory } from "./SubscriptionHistory";
import {
  TechnicianManagementSubscriptionService,
  type Subscription,
} from "../../../../../../services/admin/TechnicianSubscriptionService";
import type { TechnicianDetails } from "../../../../../../validation/types/technicianTypes";

interface SubscriptionTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

export function SubscriptionTab({
  technician,
  isSuspended,
}: SubscriptionTabProps) {
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCurrentSubscription();
  }, [technician._id]);

  const getTechnicianId = (): string | null => {
    if (technician._id) {
      const id = String(technician._id);
      return id;
    }

    if (technician.userId) {
      const id = String(technician.userId);
      return id;
    }

    console.error("[FRONTEND DEBUG] No valid technician ID found");
    return null;
  };

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const technicianId = getTechnicianId();

      if (!technicianId) {
        setError("Technician ID not found");
        return;
      }

      const response =
        await TechnicianManagementSubscriptionService.getTechnicianCurrentSubscription(
          technicianId
        );

      if (response.success) {
        setCurrentSubscription(response.data.subscription);
      } else {
        setError(response.message || "Failed to load subscription data");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load subscription data");
      console.error("[FRONTEND DEBUG] Error fetching subscription:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCurrentSubscription();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "expired":
        return <Badge variant="error">Expired</Badge>;
      case "cancelled":
        return <Badge variant="warning">Cancelled</Badge>;
      default:
        return <Badge variant="primary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-6">
          {/* Current Subscription Skeleton */}
          <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-4 w-1/3 rounded mb-2"></div>
          <div className="bg-gray-200 h-4 w-2/3 rounded"></div>

          {/* History Skeleton */}
          <div className="bg-gray-200 h-6 w-1/4 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-12 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Suspension Banner */}
      {isSuspended && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500 mr-3"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">Technician Suspended</h3>
              <p className="text-red-600 text-sm">
                This technician is currently suspended and cannot accept new
                bookings. Subscription features may be limited.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-red-700 hover:text-red-800 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Current Subscription
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
            >
              <RefreshOutlined
                className={`${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {currentSubscription ? (
          <>
            <div
              className={`border rounded-lg p-4 mb-4 ${
                currentSubscription.status === "active"
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-sm font-semibold text-gray-700">
                    {currentSubscription.subscriptionPlan?.name ||
                      (typeof currentSubscription.subscriptionPlanId ===
                        "object" &&
                      currentSubscription.subscriptionPlanId !== null &&
                      "name" in currentSubscription.subscriptionPlanId
                        ? (currentSubscription.subscriptionPlanId as any).name
                        : "Custom Plan")}
                    ({currentSubscription.durationMonths} months)
                  </span>
                  <div className="text-xs text-gray-600 mt-1">
                    Commission Rate: {currentSubscription.commissionRate}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">Expires on:</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(currentSubscription.endDate)}
                  </div>
                  {currentSubscription.status === "active" && (
                    <div className="text-xs text-green-600 mt-1">
                      {getDaysRemaining(currentSubscription.endDate)} days
                      remaining
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Amount:</span>{" "}
                  {formatCurrency(currentSubscription.amount)}
                </div>
                <div>
                  <span className="font-medium">Started:</span>{" "}
                  {formatDate(currentSubscription.startDate)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Plan Features
              </h3>
              <div className="text-sm text-gray-600">
                {currentSubscription.subscriptionPlan?.features?.length ? (
                  <ul className="list-disc list-inside space-y-1">
                    {currentSubscription.subscriptionPlan.features.map(
                      (feature, index) => (
                        <li key={index}>{feature}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    Reduced commission rate, priority in search results,
                    featured badge
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Payment Status
                </h3>
                <Badge variant="success">Paid</Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Subscription Status
                </h3>
                {getStatusBadge(currentSubscription.status)}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Payment Method
                </h3>
                <Badge variant="primary">
                  {currentSubscription.paymentMethod}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Transaction ID
                </h3>
                <div className="text-sm text-gray-600 font-mono">
                  {currentSubscription.transactionId.slice(0, 8)}...
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No active subscription found</p>
            <p className="text-xs text-gray-400 mt-2">
              {isSuspended
                ? "Subscription features are limited while technician is suspended"
                : "Get access to premium features and lower commission rates"}
            </p>
          </div>
        )}
      </div>

      {/* Subscription History */}
      <SubscriptionHistory technicianId={technician._id} />
    </div>
  );
}
