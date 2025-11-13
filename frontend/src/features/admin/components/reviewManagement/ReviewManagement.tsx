/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  CheckCircleOutlineOutlined,
  FlagCircleOutlined,
  MessageOutlined,
  SearchOutlined,
  StarBorderOutlined,
  ExpandMoreOutlined,
  ChevronLeftOutlined,
} from "@mui/icons-material";
import type { Review } from "../../../../interface/admin/IReview";
import { adminAPI } from "../../../../services/common/adminApi";
import { AdminSidebar } from "../adminDashboard/actions/AdminSidebar";
import ReviewCard from "./ReviewCard";
import { useDebounce } from "../../../../hooks/useDebounce";

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  flaggedReviews: number;
  fiveStarReviews: number;
}

const ReviewManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    flaggedReviews: 0,
    fiveStarReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const reviewsPerPage = 10;

  const fetchReviews = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      console.log("Search parameters:", {
        page,
        limit: reviewsPerPage,
        search: search || undefined,
        rating: ratingFilter !== "all" ? ratingFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        service: serviceFilter !== "all" ? serviceFilter : undefined,
      });
      const response = await adminAPI.getReviews(
        page,
        reviewsPerPage,
        search || undefined,
        ratingFilter !== "all" ? ratingFilter : undefined,
        statusFilter !== "all" ? statusFilter : undefined,
        serviceFilter !== "all" ? serviceFilter : undefined
      );

      console.log("Raw API response:", response.data);

      if (response.data.success && response.data.data) {
        setReviews(response.data.data.reviews);
        setTotalCount(response.data.data.total);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      toast.error(error.message || "Failed to load reviews");
      setReviews([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getReviewStats();
      if (response.data.success && response.data.data) {
        const statsData = response.data.data;
        setStats({
          totalReviews: statsData.totalReviews,
          averageRating: statsData.averageRating,
          flaggedReviews: statsData.flaggedReviews,
          fiveStarReviews: statsData.fiveStarReviews,
        });
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      toast.error(error.message || "Failed to load review statistics");
    }
  };

  useEffect(() => {
    fetchReviews(currentPage, debouncedSearchQuery);
    fetchStats();
  }, [
    currentPage,
    debouncedSearchQuery,
    ratingFilter,
    statusFilter,
    serviceFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, ratingFilter, statusFilter, serviceFilter]);

  const handleFlagReview = async (reviewId: string) => {
    try {
      await adminAPI.flagReview(reviewId, "Inappropriate content");
      toast.success("Review flagged successfully");
      fetchReviews(currentPage, debouncedSearchQuery); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error: any) {
      console.error("Error flagging review:", error);
      toast.error(error.message || "Failed to flag review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. The review will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await adminAPI.deleteReview(reviewId);
      toast.success("Review deleted successfully");
      fetchReviews(currentPage, debouncedSearchQuery); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(error.message || "Failed to delete review");
    }
  };

  // const handleApproveReview = async (reviewId: string) => {
  //   try {
  //     await adminAPI.updateReviewStatus(reviewId, "published");
  //     toast.success("Review approved successfully");
  //     fetchReviews(currentPage, searchQuery); // Refresh the list
  //     fetchStats(); // Refresh stats
  //   } catch (error: any) {
  //     console.error("Error approving review:", error);
  //     toast.error(error.message || "Failed to approve review");
  //   }
  // };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Reviews" />
        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading reviews...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Reviews" />

        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
              >
                <ChevronLeftOutlined className="w-5 h-5" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold mb-1">Review Management</h1>
              <p className="text-gray-600">
                Manage customer reviews and ratings for technicians and
                services.
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <MessageOutlined className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-xl font-bold">{stats.totalReviews}</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-yellow-100 rounded-md mr-3">
                  <StarBorderOutlined className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-xl font-bold">
                    {stats.averageRating.toFixed(1)}/5.0
                  </p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-red-100 rounded-md mr-3">
                  <FlagCircleOutlined className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flagged Reviews</p>
                  <p className="text-xl font-bold">{stats.flaggedReviews}</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-green-100 rounded-md mr-3">
                  <CheckCircleOutlineOutlined className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">5★ Reviews</p>
                  <p className="text-xl font-bold">{stats.fiveStarReviews}</p>
                </div>
              </div>
            </div>

            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto flex-1">
                  <div className="relative">
                    <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search reviews by user, technician, or content"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchLoading && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-auto flex gap-4">
                  <div className="relative">
                    <select
                      className="appearance-none w-full md:w-40 pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                    >
                      <option value="all">All Ratings</option>
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                    <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      className="appearance-none w-full md:w-40 pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="pending">Pending</option>
                      <option value="flagged">Flagged</option>
                    </select>
                    <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      className="appearance-none w-full md:w-48 pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                    >
                      <option value="all">All Services</option>
                      <option value="AC Repair">AC Repair</option>
                      <option value="Washing Machine Repair">
                        Washing Machine Repair
                      </option>
                      <option value="Refrigerator Repair">
                        Refrigerator Repair
                      </option>
                      <option value="Plumbing Services">
                        Plumbing Services
                      </option>
                      <option value="Electrical Services">
                        Electrical Services
                      </option>
                    </select>
                    <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    {debouncedSearchQuery ||
                    ratingFilter !== "all" ||
                    statusFilter !== "all" ||
                    serviceFilter !== "all" ? (
                      <div>
                        <p className="text-gray-500 mb-2">
                          No reviews found matching your criteria
                        </p>
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setRatingFilter("all");
                            setStatusFilter("all");
                            setServiceFilter("all");
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Clear all filters
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">No reviews found.</p>
                    )}
                  </div>
                ) : (
                  <>
                    {reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        customerName={review.customerName}
                        customerEmail={review.customerEmail}
                        customerPhone={review.customerPhone}
                        rating={review.rating}
                        date={new Date(review.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                        status={review.status}
                        service={review.service}
                        technician={review.technicianName}
                        technicianId={review.technicianId}
                        review={review.comment}
                        onFlag={() => handleFlagReview(review.id)}
                        onDelete={() => handleDeleteReview(review.id)}
                        // onApprove={
                        //   review.status === "pending"
                        //     ? () => handleApproveReview(review.id)
                        //     : undefined
                        // }
                      />
                    ))}
                  </>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                  <span className="text-sm text-gray-600">
                    Showing {reviews.length} of {totalCount} reviews
                  </span>

                  <div className="flex space-x-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === index + 1
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewManagement;
