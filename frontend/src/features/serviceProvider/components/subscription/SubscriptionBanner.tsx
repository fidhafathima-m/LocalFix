import { StarOutlineOutlined, CheckCircleOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface SubscriptionBannerProps {
  techId: string;
  planId?: string;
  techName: string | undefined;
  profilePictureUrl: string;
  rating: number;
  services: string[];
  isSubscribed?: boolean;
  subscriptionPlan?: string;
  commissionRate?: number;
  expiryDate?: string;
}

const SubscriptionBanner = ({
  techId,
  planId,
  techName,
  rating,
  services,
  profilePictureUrl,
  isSubscribed = false,
  subscriptionPlan = "Premium Plan",
  commissionRate = 0,
  expiryDate,
}: SubscriptionBannerProps) => {
  const navigate = useNavigate();

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mx-2 sm:mx-0">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        {/* Profile Section */}
        <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt={techName || "Technician"}
                className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-yellow-700 text-lg sm:text-xl font-medium">
                {(techName?.charAt(0) || "T").toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {techName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {techId.slice(-8) || "N/A"}
                </p>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                  ✓ Verified
                </span>
                {isSubscribed && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
                    <CheckCircleOutline className="w-3 h-3 mr-1" />
                    Subscribed
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                <StarOutlineOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {rating}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 2).map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0"
                  >
                    {service}
                  </span>
                ))}
                {services.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex-shrink-0">
                    +{services.length - 2} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status Section */}
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 border-t sm:border-t-0 sm:border-l border-gray-200 sm:border-gray-300 pt-3 sm:pt-0 sm:pl-4 sm:pl-6">
          {isSubscribed ? (
            // Subscribed Banner
            <>
              <div className="bg-green-50 border-l-4 border-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleOutline className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    Subscribed to {subscriptionPlan}
                  </p>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 space-y-0.5">
                  <p>{commissionRate}% commission on jobs</p>
                  {expiryDate && daysUntilExpiry !== null && (
                    <p
                      className={
                        daysUntilExpiry <= 7
                          ? "text-orange-600 font-medium"
                          : "text-gray-600"
                      }
                    >
                      Expires in {daysUntilExpiry} day
                      {daysUntilExpiry !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 justify-end">
                <button
                  onClick={() =>
                    navigate(`/technician/subscriptions/${planId}`)
                  }
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 cursor-pointer flex-1 sm:flex-none"
                >
                  View Details
                </button>
                {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                  <button
                    onClick={() => navigate("/technician/subscription-plans")}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-500 hover:text-blue-600 focus:ring-blue-500 cursor-pointer border border-blue-500 hover:bg-blue-50 flex-1 sm:flex-none"
                  >
                    Renew
                  </button>
                )}
              </div>
            </>
          ) : (
            // Unsubscribed Banner
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 sm:px-4 py-2 sm:py-3 rounded flex-1">
                <p className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                  You are unsubscribed
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  10% commission on jobs
                </p>
              </div>
              <button
                onClick={() => navigate("/technician/subscription-plans")}
                className="px-4 sm:px-6 py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
              >
                Subscribe
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;
