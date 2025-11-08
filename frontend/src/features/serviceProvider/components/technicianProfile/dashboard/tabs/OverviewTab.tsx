import React, { useState, useEffect } from "react";
import {
  CalendarTodayOutlined,
  CheckCircle,
  StarBorderOutlined,
  FmdGoodOutlined,
  ChevronRight,
} from "@mui/icons-material";
import type { TabProps } from "../types";
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getStatusIcon,
  getCustomerInfo,
  formatDate,
} from "../utils/helpers";
import { reviewService } from "../../../../../../services/user/reviewService";

interface Review {
  _id: string;
  id?: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  user?: {
    fullName: string;
    email?: string;
  };
}

const OverviewTab: React.FC<TabProps> = ({
  dashboardData,
  orders,
  ordersLoading,
  onUpdateOrderStatus,
  isSuspended,
  setActiveTab
}) => {
  const { overview } = dashboardData;
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [calculatedAverageRating, setCalculatedAverageRating] = useState(overview.averageRating || 0);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      if (!dashboardData?.profile?._id || isSuspended) return;

      try {
        setReviewsLoading(true);
        const reviewsResponse = await reviewService.getTechnicianReviews(
          dashboardData.profile._id, 
          1, 
          5 // Fetch more reviews to calculate average
        );

        if (reviewsResponse.success && reviewsResponse.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedReviews: Review[] = reviewsResponse.data.reviews.map((review: any) => {
            // Extract user information from the review data
            let userName = "Anonymous User";

            if (review.userId && typeof review.userId === 'string') {
              // Try to extract fullName using regex (fallback for stringified data)
              const fullNameMatch = review.userId.match(/fullName:\s*'([^']+)'/);
              if (fullNameMatch && fullNameMatch[1]) {
                userName = fullNameMatch[1];
              } else if (review.user && review.user.fullName) {
                userName = review.user.fullName;
              } else {
                // Fallback: extract email and use username part
                const emailMatch = review.userId.match(/email:\s*'([^']+)'/);
                if (emailMatch && emailMatch[1]) {
                  userName = emailMatch[1].split('@')[0];
                }
              }
            } else if (review.user && review.user.fullName) {
              userName = review.user.fullName;
            }

            return {
              _id: review.id || review._id,
              userId: review.userId,
              technicianId: review.technicianId,
              rating: review.rating,
              comment: review.comment,
              userName: userName,
              createdAt: review.createdAt,
              user: review.user
            };
          });
          
          setRecentReviews(transformedReviews.slice(0, 2)); // Only show 2 most recent

          // Calculate average rating from all fetched reviews
          if (transformedReviews.length > 0) {
            const totalRating = transformedReviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / transformedReviews.length;
            setCalculatedAverageRating(parseFloat(averageRating.toFixed(1)));
          } else {
            setCalculatedAverageRating(0);
          }
        }
      } catch (err) {
        console.error('Error fetching recent reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchRecentReviews();
  }, [dashboardData?.profile?._id, isSuspended]);

  // Use calculated average rating if available, otherwise fallback to overview data
  const displayAverageRating = calculatedAverageRating > 0 ? calculatedAverageRating : (overview.averageRating || 0);

  const renderOrdersSection = () => {
    // ... existing orders section code remains the same ...
    if (ordersLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading orders...</p>
        </div>
      );
    }

    const upcomingOrders =
      orders?.filter((order) =>
        ["pending", "accepted", "in_progress", "on_the_way"].includes(
          order.status
        )
      ) || [];

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
        {upcomingOrders.slice(0, 3).map((order) => (
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
                  onClick={() => onUpdateOrderStatus(order._id, "accepted")}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"
                >
                  Accept
                </button>
              )}
              <button
                  onClick={() => setActiveTab("orders")}
                  className=" text-blue-600 px-3 py-1 rounded text-xs font-medium hover:text-blue-700"
                >
                  View
                </button>
              {order.status === "accepted" && (
                <button
                  onClick={() => onUpdateOrderStatus(order._id, "in_progress")}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700"
                >
                  Start Job
                </button>
              )}
              {order.status === "in_progress" && (
                <button
                  onClick={() => onUpdateOrderStatus(order._id, "completed")}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-700"
                >
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
        {upcomingOrders.length > 3 && (
          <button 
            onClick={() => setActiveTab("orders")}
            className="w-full text-center text-blue-600 text-sm font-medium hover:text-blue-700 py-2 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer"
          >
            View all {upcomingOrders.length} orders
          </button>
        )}
      </div>
    );
  };

  const renderStars = (rating: number, size: 'small' | 'medium' = 'medium') => {
    const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarBorderOutlined
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRecentReviews = () => {
    if (reviewsLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400 mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading reviews...</p>
        </div>
      );
    }

    if (recentReviews.length === 0) {
      return (
        <div className="text-center py-8">
          <StarBorderOutlined className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No reviews yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Customer reviews will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentReviews.map((review) => (
          <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 rounded-full p-2">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-sm">{review.userName}</span>
              </div>
              <div className="flex">
                {renderStars(review.rating, 'small')}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {review.comment}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(review.createdAt)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
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
              {displayAverageRating > 0 ? displayAverageRating.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {recentReviews.length > 0 ? `Based on ${recentReviews.length}+ reviews` : 'No reviews yet'}
            </p>
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
              {orders?.filter((order) =>
                ["pending", "accepted", "in_progress", "on_the_way"].includes(
                  order.status
                )
              ).length || 0}
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
            {orders
              ?.filter((order) => order.status === "completed")
              .slice(0, 5)
              .map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{order.serviceName}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(order.scheduledAt)}
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
            {orders?.filter((order) => order.status === "completed").length ===
              0 && (
              <div className="text-center py-8">
                <span className="text-green-500 text-2xl mx-auto mb-3">₹</span>
                <p className="text-gray-500 text-sm">No earnings yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Complete orders to see earnings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <StarBorderOutlined className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold">Recent Reviews</h3>
          </div>
          {recentReviews.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
              {recentReviews.length} reviews
            </span>
          )}
        </div>
        
        {renderRecentReviews()}
        
        {recentReviews.length > 0 && (
          <button 
            className="text-blue-600 text-sm mt-4 flex items-center hover:text-blue-700 cursor-pointer"
             onClick={() => setActiveTab("ratings")}
          >
            View all reviews
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {orders?.slice(0, 5).map((order) => (
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
                  <p className="text-sm font-medium">{order.serviceName}</p>
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
                <p className="text-xs text-gray-500">{order.orderCode}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;