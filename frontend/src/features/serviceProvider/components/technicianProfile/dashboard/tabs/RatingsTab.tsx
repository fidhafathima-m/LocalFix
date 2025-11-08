import React, { useState, useEffect } from 'react';
import { StarBorderOutlined, Person2Outlined } from '@mui/icons-material';
import type { TabProps } from '../types';
import { formatDate } from '../utils/helpers';
import { reviewService } from '../../../../../../services/user/reviewService';

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

const RatingsTab: React.FC<TabProps> = ({ dashboardData, isSuspended }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!dashboardData?.profile?._id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch review stats
        const statsResponse = await reviewService.getTechnicianReviewStats(dashboardData.profile._id);
        if (statsResponse.success && statsResponse.data) {
          setReviewStats(statsResponse.data);
        }

        // Fetch reviews
        const reviewsResponse = await reviewService.getTechnicianReviews(dashboardData.profile._id, 1, 10);
        if (reviewsResponse.success && reviewsResponse.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedReviews: Review[] = reviewsResponse.data.reviews.map((review: any) => {
            // Extract user information from the review data
            let userName = "Anonymous User";
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const userData = null;

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
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    if (!isSuspended) {
      fetchReviews();
    }
  }, [dashboardData?.profile?._id, isSuspended]);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
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
  const averageRating = reviewStats?.averageRating || dashboardData?.profile.averageRating || 0;
  const totalReviews = reviewStats?.totalReviews || dashboardData?.profile.ratingCount || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Ratings & Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b">
        <div className="text-center">
          <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
          <div className="flex justify-center mb-2">
            {renderStars(Math.round(averageRating))}
          </div>
          <p className="text-sm text-gray-600">Based on {totalReviews} reviews</p>
        </div>
        
        <div className="md:col-span-2">
          <div className="space-y-2">
            {ratingDistribution.map((rating) => (
              <div key={rating.stars} className="flex items-center space-x-3">
                <div className="flex items-center w-12">
                  <span className="text-sm">{rating.stars}</span>
                  <StarBorderOutlined className="w-4 h-4 ml-1 text-gray-400" />
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
                  {rating.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-6">Customer Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <Person2Outlined className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No Reviews Yet</p>
            <p className="text-gray-400 text-sm">
              Customer reviews will appear here once they rate your services.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 rounded-full p-3">
                      <Person2Outlined className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{review.userName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {renderStars(review.rating, 'small')}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                {/* Example response section - you can implement actual response functionality later */}
                {/* <div className="bg-gray-50 rounded-lg p-4 ml-12">
                  <div className="flex items-center space-x-2 mb-2">
                    <Person2Outlined className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold text-sm">Your Response</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Thank you for your feedback! We're glad to hear about your positive experience.
                  </p>
                </div> */}
                
                {/* Uncomment to add reply functionality later */}
                {/* <button className="text-blue-600 text-sm ml-12 hover:text-blue-700">
                  Reply to review
                </button> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsTab;