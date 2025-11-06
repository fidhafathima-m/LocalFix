/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowBackIosNewOutlined,
  Person2Outlined,
  StarBorderOutlined,
  CalendarTodayOutlined,
  AccessTimeOutlined,
  EditOutlined,
} from "@mui/icons-material";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import { orderService } from "../../../../services/user/orderService";
import { reviewService } from "../../../../services/user/reviewService";
import { type OrderResponse } from "../../../../services/user/orderService";
import { type ReviewResponse } from "../../../../services/user/reviewService";
import { useAppSelector } from "../../../../hooks/redux";
import { selectUser } from "../../../../store/slices/authSlice";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface LeaveReviewLocationState {
  existingReview?: ReviewResponse;
  mode: "create" | "edit";
}

const LeaveReview: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useAppSelector(selectUser);

  const [rating, setRating] = useState(3);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderAndReviewDetails();
    }
  }, [orderId]);

  // LeaveReview.tsx - Update the fetchOrderAndReviewDetails function
  const fetchOrderAndReviewDetails = async () => {
    try {
      setLoading(true);

      // Fetch order details
      const ordersResponse = await orderService.getUserOrders();

      if (ordersResponse.success && ordersResponse.data) {
        const foundOrder = ordersResponse.data.orders.find(
          (order: OrderResponse) => order._id === orderId
        );

        if (foundOrder) {
          setOrder(foundOrder);

          // Check for existing review - handle 404 gracefully
          try {
            const reviewResponse = await reviewService.getOrderReview(orderId!);

            if (reviewResponse.success && reviewResponse.data) {
              // Prefill with existing review data
              setRating(reviewResponse.data.rating);
              setReview(reviewResponse.data.comment);
              setExistingReviewId(reviewResponse.data.id);
              setMode("edit");
            } else {
              // No review found or 404 response
              setMode("create");
            }
          } catch (reviewError) {
            // Review check failed, but we still have the order
            console.error("Error checking review:", reviewError);
            setMode("create");
          }

          // Check location state for mode (in case of direct navigation)
          const locationState = location.state as LeaveReviewLocationState;
          if (locationState?.mode) {
            setMode(locationState.mode);
            if (locationState.existingReview) {
              setRating(locationState.existingReview.rating);
              setReview(locationState.existingReview.comment);
              setExistingReviewId(locationState.existingReview.id);
            }
          }
        } else {
          toast.error("Order not found");
          navigate("/orders");
        }
      } else {
        toast.error("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order and review details:", error);
      toast.error("Failed to load order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot
      .split(" - ")
      .map((time) => time.replace(/(:\d{2})(?::\d{2})? (AM|PM)/, "$1 $2"))
      .join(" - ");
  };

  const handleSubmit = async () => {
    if (!orderId || !order) {
      toast.error("Order information is missing");
      return;
    }

    if (review.trim().length === 0) {
      toast.error("Please write your review");
      return;
    }

    try {
      setSubmitting(true);

      if (mode === "create") {
        // Create new review
        const response = await reviewService.createReview({
          orderId: orderId,
          rating: rating,
          comment: review.trim(),
        });

        if (response.success) {
          toast.success("Review submitted successfully!");
          navigate("/review-success");
        } else {
          toast.error(response.message || "Failed to submit review");
        }
      } else {
        // Update existing review
        if (!existingReviewId) {
          toast.error("Cannot update review: Review ID not found");
          return;
        }

        const response = await reviewService.updateReview(existingReviewId, {
          rating: rating,
          comment: review.trim(),
        });

        if (response.success) {
          toast.success("Review updated successfully!");
          navigate("/review-success");
        } else {
          toast.error(response.message || "Failed to update review");
        }
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || `Failed to ${mode} review`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!existingReviewId) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await reviewService.deleteReview(existingReviewId);

      if (response.success) {
        toast.success("Your review has been deleted.")
        navigate("/orders");
      } else {
        toast.error(response.message || "Failed to delete review")
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review")
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Person2Outlined className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              The order you're trying to review could not be found.
            </p>
            <Link
              to="/orders"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Back to Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowBackIosNewOutlined className="w-5 h-5 mr-2" />
          Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">
              {mode === "edit" ? "Edit Your Review" : "Leave a Review"}
            </h1>
            {mode === "edit" && (
              <div className="flex items-center gap-2 text-blue-600">
                <EditOutlined className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Editing existing review
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-8">
            {mode === "edit"
              ? "Update your experience with the service"
              : "Share your experience with the service"}
          </p>

          {/* Order Details Section */}
          <div className="flex items-start space-x-4 mb-8 pb-8 border-b">
            <div className="bg-gray-100 rounded-full p-4 flex-shrink-0">
              {order.technicianId.profilePictureUrl ? (
                <img
                  src={order.technicianId.profilePictureUrl}
                  alt={order.technicianId.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <Person2Outlined className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                {order.serviceName}
              </h3>
              <p className="text-gray-600 mb-3">
                {order.problemDescription || "Standard service"}
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarTodayOutlined className="w-4 h-4" />
                  <span>
                    Order ID:{" "}
                    <span className="font-medium">{order.orderCode}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarTodayOutlined className="w-4 h-4" />
                  <span>
                    Date:{" "}
                    <span className="font-medium">
                      {formatDate(order.scheduledAt)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AccessTimeOutlined className="w-4 h-4" />
                  <span>
                    Time:{" "}
                    <span className="font-medium">
                      {formatTimeSlot(order.timeSlot)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Person2Outlined className="w-4 h-4" />
                  <span>
                    Technician:{" "}
                    <span className="font-medium">
                      {order.technicianId.displayName}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">
              How would you rate your experience with{" "}
              {order.technicianId.displayName}?
            </h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  disabled={submitting}
                >
                  <StarBorderOutlined
                    className={`w-12 h-12 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    } ${submitting ? "opacity-50" : ""}`}
                  />
                </button>
              ))}
              <span className="ml-4 text-gray-600 font-medium">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          {/* Review Text Section */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Write your review</h3>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder={`Share details of your experience with ${order.technicianId.displayName}'s service...\n\nWhat did you like about the service?\nWas the technician professional and punctual?\nHow was the quality of work?`}
              className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={submitting}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {review.length}/500 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div>
              {mode === "edit" && (
                <button
                  onClick={handleDeleteReview}
                  disabled={submitting}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  Delete Review
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => navigate("/orders")}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 cursor-pointer"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || review.trim().length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {mode === "edit" ? "Updating..." : "Submitting..."}
                  </>
                ) : mode === "edit" ? (
                  "Update Review"
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LeaveReview;
