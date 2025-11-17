/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  StarBorderOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
  BuildOutlined,
  PersonOutlineOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { reviewService } from "../../../../../services/user/reviewService";
import Swal from "sweetalert2";

interface Review {
  id: string;
  orderId: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  technician?: {
    displayName?: string;
    profilePictureUrl?: string;
  };
  service?: {
    name?: string;
  };
  order?: {
    serviceName?: string;
  };
  user?: {
    fullName?: string;
    email?: string;
  };
}

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 0, comment: "" });
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Number of reviews to show initially
  const INITIAL_REVIEWS_COUNT = 3;

  // Fetch user reviews on component mount
  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getUserReviews();

      console.log("Full API response: ", response);

      if (response.success && response.data) {
        // Transform the API response - use the already populated service and technician fields
        const userReviews: Review[] = response.data.reviews.map(
          (review: any) => ({
            id: review.id || review._id,
            orderId: review.orderId,
            userId: review.userId,
            technicianId: review.technicianId,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            // Use the already populated service field (NOT orderId)
            service: review.service || { name: "Service" },
            // Use the already populated technician field (NOT technicianId)
            technician: review.technician || { displayName: "Technician" },
            user: review.user || {},
          })
        );

        console.log("Processed reviews: ", userReviews);
        setReviews(userReviews);
      } else {
        setError(response.message || "Failed to load reviews");
      }
    } catch (err: any) {
      console.error("Error fetching user reviews:", err);
      setError("Failed to load reviews");
      toast.error("Failed to load your reviews");
    } finally {
      setLoading(false);
    }
  };

  // Get reviews to display based on showAllReviews state
  const getDisplayReviews = () => {
    if (showAllReviews) {
      return reviews;
    }
    return reviews.slice(0, INITIAL_REVIEWS_COUNT);
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment,
    });
  };

  const handleUpdateReview = async (reviewId: string) => {
    try {
      if (editForm.rating < 1 || editForm.rating > 5) {
        toast.error("Rating must be between 1 and 5");
        return;
      }

      if (!editForm.comment.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }

      const response = await reviewService.updateReview(reviewId, {
        rating: editForm.rating,
        comment: editForm.comment,
      });

      if (response.success) {
        // Update the local state
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? {
                  ...review,
                  rating: editForm.rating,
                  comment: editForm.comment,
                  updatedAt: new Date().toISOString(),
                }
              : review
          )
        );
        setEditingReviewId(null);
        toast.success("Review updated successfully");
      } else {
        throw new Error(response.message || "Failed to update review");
      }
    } catch (err: any) {
      console.error("Error updating review:", err);
      toast.error(err.response?.data?.message || "Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      background: "#fff",
      iconColor: "#e53e3e",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response = await reviewService.deleteReview(reviewId);

      if (response.success) {
        // Remove from local state
        setReviews((prev) => prev.filter((review) => review.id !== reviewId));

        // Show success message
        toast.success("Your review has been deleted.");
      } else {
        throw new Error(response.message || "Failed to delete review");
      }
    } catch (err: any) {
      console.error("Error deleting review:", err);

      // Show error message with Swal
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditForm({ rating: 0, comment: "" });
  };

  const toggleShowAllReviews = () => {
    setShowAllReviews(!showAllReviews);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <StarBorderOutlined
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const displayReviews = getDisplayReviews();
  const hasMoreReviews = reviews.length > INITIAL_REVIEWS_COUNT;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={fetchUserReviews}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6" id="reviews">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Reviews & Ratings</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-gray-500">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {displayReviews.length > 0 ? (
        <>
          <div className="space-y-6">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
              >
                {editingReviewId === review.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Editing Review
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <BuildOutlined className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {review.service?.name || "Service"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <PersonOutlineOutlined className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            Technician:{" "}
                            {review.technician?.displayName || "Technician"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Rating Selection */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Rating:
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setEditForm((prev) => ({ ...prev, rating: star }))
                            }
                            className="focus:outline-none"
                          >
                            <StarBorderOutlined
                              className={`w-6 h-6 ${
                                star <= editForm.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              } hover:text-yellow-400`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment Textarea */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment:
                      </label>
                      <textarea
                        value={editForm.comment}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            comment: e.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Share your experience..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateReview(review.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode - New Layout with buttons on right
                  <div className="flex justify-between items-start gap-4">
                    {/* Left side - Review content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BuildOutlined className="w-4 h-4 text-gray-400" />
                            <p className="font-semibold text-gray-900">
                              {review.service?.name || "Service"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <PersonOutlineOutlined className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Technician:{" "}
                              {review.technician?.displayName || "Technician"}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600 ml-2">
                          {review.rating.toFixed(1)}/5
                        </span>
                      </div>

                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>

                    {/* Right side - Action buttons */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 transition-colors p-2 rounded-lg hover:bg-blue-50"
                        title="Edit review"
                      >
                        <EditOutlined className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1 transition-colors p-2 rounded-lg hover:bg-red-50"
                        title="Delete review"
                      >
                        <DeleteOutlineOutlined className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {hasMoreReviews && (
            <div className="flex justify-center mt-6">
              <button
                onClick={toggleShowAllReviews}
                className="flex items-center gap-2 px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                {showAllReviews ? (
                  <>
                    <ExpandLessOutlined className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ExpandMoreOutlined className="w-4 h-4" />
                    Show More ({reviews.length - INITIAL_REVIEWS_COUNT} more)
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <StarBorderOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your reviews will appear here after you book and complete services
          </p>
        </div>
      )}
    </div>
  );
};
