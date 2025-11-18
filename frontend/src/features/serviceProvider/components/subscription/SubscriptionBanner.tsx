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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt={techName || "Technician"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-yellow-700 text-xl font-medium">
                {(techName?.charAt(0) || "T").toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {techName}
                <p className="text-sm text-gray-500">
                  {techId.slice(-8) || "N/A"}
                </p>
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                ✓ Verified
              </span>
              {isSubscribed && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <CheckCircleOutline className="w-3 h-3 mr-1" />
                  Subscribed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <StarOutlineOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {rating}
                </span>
              </div>
              <div className="flex gap-2">
                {services.map((service) => (
                  <span
                    key={service}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isSubscribed ? (
          // Subscribed Banner
          <div className="flex items-center gap-4 border-l border-green-300 pl-6">
            <div className="bg-green-50 border-l-4 border-green-400 px-4 py-3 rounded">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircleOutline className="w-5 h-5 text-green-500" />
                <p className="font-semibold text-gray-900">
                  You are subscribed to {subscriptionPlan}
                </p>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Enjoy {commissionRate}% commission on all jobs</p>
                {expiryDate && daysUntilExpiry !== null && (
                  <p
                    className={
                      daysUntilExpiry <= 7
                        ? "text-orange-600 font-medium"
                        : "text-gray-600"
                    }
                  >
                    Plan expires in {daysUntilExpiry} day
                    {daysUntilExpiry !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/technician/subscriptions/${planId}`)}
                className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 cursor-pointer"
              >
                View Details
              </button>
              {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                <button
                  onClick={() => navigate("/technician/subscription-plans")}
                  className="px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-blue-500 hover:text-blue-600 focus:ring-blue-500 cursor-pointer border border-blue-500 hover:bg-blue-50"
                >
                  Renew Now
                </button>
              )}
            </div>
          </div>
        ) : (
          // Unsubscribed Banner
          <div className="flex items-center gap-4 border-l border-yellow-300 pl-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 px-4 py-3 rounded">
              <p className="font-semibold text-gray-900 mb-1">
                You are unsubscribed
              </p>
              <p className="text-sm text-gray-600">
                10% commission will apply on each job
              </p>
            </div>
            <button
              onClick={() => navigate("/technician/subscription-plans")}
              className="px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 cursor-pointer"
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionBanner;
