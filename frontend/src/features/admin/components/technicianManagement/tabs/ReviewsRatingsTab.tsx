import React, { useState, useEffect } from "react";
import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";
import { reviewService } from "../../../../../services/user/reviewService";
import { formatDate } from "../utils/dateUtils";

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

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsRatingsTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

const ReviewsRatingsTab: React.FC<ReviewsRatingsTabProps> = ({
  technician,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviewsData = async () => {
      if (!technician?._id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch review stats
        const statsResponse = await reviewService.getTechnicianReviewStats(technician._id);
        if (statsResponse.success && statsResponse.data) {
          setReviewStats(statsResponse.data);
        }

        // Fetch reviews
        const reviewsResponse = await reviewService.getTechnicianReviews(technician._id, 1, 20);
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
          setReviews(transformedReviews);
        }
      } catch (err) {
        console.error('Error fetching reviews data:', err);
        setError('Failed to load reviews data');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewsData();
  }, [technician?._id]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) =>
          i < Math.floor(rating) ? (
            <svg
              key={i}
              className="h-5 w-5 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg key={i} className="h-5 w-5 text-gray-300" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        )}
      </div>
    );
  };

  // Calculate rating distribution percentages
  const calculateRatingDistribution = () => {
    if (!reviewStats) return [];

    const { ratingDistribution, totalReviews } = reviewStats;

    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percentage: totalReviews > 0 ? Math.round((ratingDistribution[stars as keyof typeof ratingDistribution] / totalReviews) * 100) : 0,
      count: ratingDistribution[stars as keyof typeof ratingDistribution]
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-6">Reviews & Ratings</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-6">Reviews & Ratings</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ratingDistribution = calculateRatingDistribution();
  const averageRating = reviewStats?.averageRating || technician.averageRating || 0;
  const totalReviews = reviewStats?.totalReviews || technician.ratingCount || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Reviews & Ratings</h2>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </p>
          <div className="flex justify-center mt-1">
            {renderStars(averageRating)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDistribution.map((rating) => (
              <div key={rating.stars} className="flex items-center space-x-3">
                <div className="flex items-center w-12">
                  <span className="text-sm text-gray-600">{rating.stars}</span>
                  <svg className="h-4 w-4 ml-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${rating.percentage}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {rating.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div>
        <h3 className="text-lg font-medium mb-4">Customer Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-600">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-1">
              This technician hasn't received any reviews yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full p-2">
                      <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.userName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Review ID: {review._id.slice(-8)}</span>
                  {review.user?.email && (
                    <span>Email: {review.user.email}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Statistics Summary */}
      {reviews.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Review Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
              <p className="text-xs text-gray-600">Total Reviews</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-600">Average Rating</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {ratingDistribution.find(r => r.stars === 5)?.count || 0}
              </p>
              <p className="text-xs text-gray-600">5-Star Reviews</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {ratingDistribution.find(r => r.stars === 1)?.count || 0}
              </p>
              <p className="text-xs text-gray-600">1-Star Reviews</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsRatingsTab;