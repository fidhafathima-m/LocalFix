/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  StarBorderOutlined,
  BuildOutlined,
  AccessTimeOutlined,
  LocationOnOutlined,
  CheckCircleOutlineOutlined,
  InsertDriveFileOutlined,
  CalendarMonthOutlined,
  PersonOutlineOutlined,
  ScheduleOutlined,
  ChevronRightOutlined,
  FlagCircleOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { TechnicianMangementService } from "../../../services/admin/TechnicianManagementService";
import { RRule } from "rrule";
import { reviewService } from "../../../services/user/reviewService";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../hooks/redux";
import { selectAccessToken, selectUser } from "../../../store/slices/authSlice";

interface Technician {
  _id: string;
  userId: string;
  displayName: string;
  bio?: string;
  email?: string;
  phone?: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  averageRating: number;
  ratingCount: number;
  totalJobs?: number;
  completedJobs?: number;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    phone: string;
    fullName: string;
  };
  personalInfo?: {
    fullName?: string;
    languages?: string[];
    address?: {
      city?: string;
      state?: string;
      pincode?: string;
    };
  };
  documents?: Array<{
    _id: string;
    type: string;
    fileName: string;
    url: string;
    verified: boolean;
    status: string;
    uploadedAt: string;
  }>;
  slotRules?: Array<{
    _id: string;
    name: string;
    rruleString: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string;
  }>;
}

interface SlotRule {
  _id: string;
  name: string;
  rruleString: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface DailyAvailability {
  date: Date;
  dayName: string;
  slots: Array<{
    start: string;
    end: string;
  }>;
  isToday: boolean;
}

// Update your Review interface in the frontend
interface Review {
  _id: string;
  id?: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  status?: "published" | "flagged" | "pending"; // Add status
  userReported?: boolean; // Add this field
  user?: {
    fullName: string;
    email?: string;
  };
}
const TechnicianProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [, setSlotRules] = useState<SlotRule[]>([]);

  const user = useAppSelector(selectUser);
  const accessToken = useAppSelector(selectAccessToken);

  const [weeklyAvailability, setWeeklyAvailability] = useState<
    DailyAvailability[]
  >([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch technician data
  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (!id) {
        setError("Technician not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch technician details
        const technicianResponse =
          await TechnicianMangementService.getPublicTechnicianById(id);

        if (technicianResponse.data?.data?.technician) {
          const techData = technicianResponse.data.data.technician;
          setTechnician(techData);

          // Fetch slot rules for this technician
          try {
            const slotRulesResponse =
              await TechnicianMangementService.getTechnicianSlotRules(id);

            if (
              slotRulesResponse.data?.success &&
              slotRulesResponse.data.data?.slotRules
            ) {
              setSlotRules(slotRulesResponse.data.data.slotRules);
              const availability = generateWeeklyAvailability(
                slotRulesResponse.data.data.slotRules
              );
              setWeeklyAvailability(availability);
            } else {
              console.warn(
                "No slot rules found or unexpected response structure:",
                slotRulesResponse.data
              );
              setSlotRules([]);
              setWeeklyAvailability([]);
            }
          } catch (slotError) {
            console.error("Error fetching slot rules:", slotError);
            setSlotRules([]);
            setWeeklyAvailability([]);
          }

          // Fetch reviews and review stats for this technician
          await fetchTechnicianReviews(id);
        } else {
          setError("Technician not found");
        }
      } catch (err) {
        console.error("Error fetching technician data:", err);
        setError("Failed to load technician profile");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianData();
  }, [id]);

  const fetchTechnicianReviews = async (technicianId: string) => {
    try {
      setReviewsLoading(true);

      const statsResponse = await reviewService.getTechnicianReviewStats(
        technicianId
      );
      if (statsResponse.success && statsResponse.data) {
        setReviewStats(statsResponse.data);
      }

      // Pass current user ID to get report status
      const currentUserId = user?._id;
      const reviewsResponse = await reviewService.getTechnicianReviews(
        technicianId,
        1,
        10,
        currentUserId // Pass current user ID
      );

      if (reviewsResponse.success && reviewsResponse.data) {
        // Get cached reported reviews from localStorage
        const cachedReportedReviews = getCachedReportedReviews();

        const transformedReviews: Review[] = reviewsResponse.data.reviews
          .filter((review: any) => review.status !== "flagged") // Hide flagged reviews from public
          .map((review: any) => {
            // Extract user information properly
            let userName = "Anonymous User";
            let userEmail = "";

            // Check if user data is available in the response
            if (review.userId && typeof review.userId === "object") {
              // If userId is a populated user object
              userName =
                review.userId.fullName ||
                review.userId.name ||
                "Anonymous User";
              userEmail = review.userId.email || "";
            } else if (review.user) {
              // If there's a separate user field
              userName =
                review.user.fullName || review.user.name || "Anonymous User";
              userEmail = review.user.email || "";
            } else if (typeof review.userId === "string") {
              // Fallback: Try to extract from stringified field (old method)
              const fullNameMatch = review.userId.match(
                /fullName:\s*'([^']+)'/
              );
              if (fullNameMatch && fullNameMatch[1]) {
                userName = fullNameMatch[1];
              }

              const emailMatch = review.userId.match(/email:\s*'([^']+)'/);
              if (emailMatch && emailMatch[1]) {
                userEmail = emailMatch[1];
                if (userName === "Anonymous User") {
                  userName = emailMatch[1].split("@")[0];
                }
              }
            }

            // Check if this review is reported by current user
            // First check API response, then fallback to localStorage cache
            const userReportedFromAPI = review.userReported || false;
            const userReportedFromCache = cachedReportedReviews.includes(
              review.id || review._id
            );

            return {
              _id: review.id || review._id, // Use both possible ID fields
              userId: review.userId?._id || review.userId, // Handle both object and string
              technicianId: review.technicianId,
              rating: review.rating,
              comment: review.comment,
              userName: userName,
              createdAt: review.createdAt,
              status: review.status,
              userReported: userReportedFromAPI || userReportedFromCache, // Combine both sources
              user: {
                fullName: userName,
                email: userEmail,
              },
            };
          });
        setReviews(transformedReviews);
      }
    } catch (error) {
      console.error("Error fetching technician reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Add this useEffect to sync reported reviews on component mount
  useEffect(() => {
    if (reviews.length > 0 && user) {
      // Update reviews with cached reported status
      const cachedReportedReviews = getCachedReportedReviews();
      setReviews((prevReviews) =>
        prevReviews.map((review) => ({
          ...review,
          userReported:
            review.userReported || cachedReportedReviews.includes(review._id),
        }))
      );
    }
  }, [reviews.length, user]);

  const handleReportReview = async (reviewId: string) => {
    try {
      // Check if user is logged in
      if (!user || !accessToken) {
        toast.error("Please log in to report reviews");
        return;
      }

      // Show confirmation dialog
      const result = await Swal.fire({
        title: "Report Review",
        text: "Please select why you are reporting this review",
        icon: "warning",
        input: "select",
        inputOptions: {
          inappropriate: "Inappropriate Content",
          fake: "Fake Review",
          personal_attack: "Personal Attack",
          confidential: "Confidential Information",
          irrelevant: "Irrelevant Content",
          other: "Other Reason",
        },
        inputPlaceholder: "Select a reason",
        showCancelButton: true,
        confirmButtonText: "Report",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value) {
            return "Please select a reason";
          }
        },
      });

      if (result.isConfirmed) {
        // Call the report review API
        const response = await reviewService.reportReview(reviewId, {
          reason: result.value,
          reportedBy: user._id,
          additionalInfo: "",
        });

        if (response.success) {
          toast.success(
            "Thank you for your report. Our team will review it shortly."
          );

          // Update the local state to mark this review as reported by current user
          setReviews((prevReviews) =>
            prevReviews.map((review) =>
              review._id === reviewId
                ? { ...review, userReported: true }
                : review
            )
          );

          // Also store in localStorage as fallback
          const reportedReviews = getCachedReportedReviews();
          if (!reportedReviews.includes(reviewId)) {
            reportedReviews.push(reviewId);
            localStorage.setItem(
              "reportedReviews",
              JSON.stringify(reportedReviews)
            );
          }
        } else {
          // Handle API response error (not exception)
          if (response.message?.includes("already reported")) {
            toast.error("You have already reported this review.");
            // Still update the UI state since we know it's already reported
            setReviews((prevReviews) =>
              prevReviews.map((review) =>
                review._id === reviewId
                  ? { ...review, userReported: true }
                  : review
              )
            );

            // Store in localStorage as fallback
            const reportedReviews = getCachedReportedReviews();
            if (!reportedReviews.includes(reviewId)) {
              reportedReviews.push(reviewId);
              localStorage.setItem(
                "reportedReviews",
                JSON.stringify(reportedReviews)
              );
            }
          } else {
            throw new Error(response.message || "Failed to report review");
          }
        }
      }
    } catch (error: any) {
      console.error("Error reporting review:", error);

      const errorMessage = error?.message || "";
      const responseMessage = error?.response?.data?.message || "";
      const fullMessage = errorMessage + responseMessage;

      if (fullMessage.includes("already reported")) {
        toast.error("You have already reported this review.");
        // Update UI state even on error since we know it's already reported
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === reviewId ? { ...review, userReported: true } : review
          )
        );

        // Store in localStorage as fallback
        const reportedReviews = getCachedReportedReviews();
        if (!reportedReviews.includes(reviewId)) {
          reportedReviews.push(reviewId);
          localStorage.setItem(
            "reportedReviews",
            JSON.stringify(reportedReviews)
          );
        }
      } else if (error?.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
      } else {
        toast.error("Failed to report review. Please try again.");
      }
    }
  };

  // Add this helper function
  // Update this helper function to be more specific to current user if needed
  const getCachedReportedReviews = (): string[] => {
    try {
      const cached = localStorage.getItem("reportedReviews");
      if (cached) {
        const reportedReviews = JSON.parse(cached);
        return Array.isArray(reportedReviews) ? reportedReviews : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const generateWeeklyAvailability = (
    rules: SlotRule[]
  ): DailyAvailability[] => {
    const days: DailyAvailability[] = [];
    const today = new Date();

    // Get next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Find slots for this day from active rules
      const daySlots = getSlotsForDate(rules, date);

      days.push({
        date,
        dayName,
        slots: daySlots,
        isToday: i === 0,
      });
    }

    return days;
  };

  const getSlotsForDate = (
    rules: SlotRule[],
    date: Date
  ): Array<{ start: string; end: string }> => {
    const slots: Array<{ start: string; end: string }> = [];
    const activeRules = rules.filter((rule) => rule.isActive);

    activeRules.forEach((rule) => {
      try {
        // Parse the RRule and check if it occurs on this date
        const rrule = RRule.fromString(rule.rruleString);
        const occurrences = rrule.between(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          true
        );

        // If this rule applies to the current date, generate slots
        if (occurrences.length > 0) {
          const daySlots = generateTimeSlots(
            rule.startTime,
            rule.endTime,
            rule.slotDurationMinutes
          );
          slots.push(...daySlots);
        }
      } catch (error) {
        console.error("Error processing slot rule:", error);
      }
    });

    return mergeConsecutiveSlots(slots);
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    durationMinutes: number
  ): Array<{ start: string; end: string }> => {
    const slots: Array<{ start: string; end: string }> = [];

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const slotStart = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

      // Calculate end time
      let slotEndHour = currentHour;
      let slotEndMinute = currentMinute + durationMinutes;

      while (slotEndMinute >= 60) {
        slotEndHour++;
        slotEndMinute -= 60;
      }

      const slotEnd = `${slotEndHour
        .toString()
        .padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`;

      // Check if slot ends before or at the end time
      if (
        slotEndHour < endHour ||
        (slotEndHour === endHour && slotEndMinute <= endMinute)
      ) {
        slots.push({ start: slotStart, end: slotEnd });
      }

      // Move to next slot
      currentMinute += durationMinutes;
      while (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }
    }

    return slots;
  };

  const mergeConsecutiveSlots = (
    slots: Array<{ start: string; end: string }>
  ): Array<{ start: string; end: string }> => {
    if (slots.length === 0) return [];

    const sortedSlots = [...slots].sort((a, b) =>
      a.start.localeCompare(b.start)
    );
    const merged: Array<{ start: string; end: string }> = [];

    let currentRange = { ...sortedSlots[0] };

    for (let i = 1; i < sortedSlots.length; i++) {
      const slot = sortedSlots[i];

      if (slot.start === currentRange.end) {
        currentRange.end = slot.end;
      } else {
        merged.push(currentRange);
        currentRange = { ...slot };
      }
    }

    merged.push(currentRange);
    return merged;
  };

  // Get document type display name
  const getDocumentDisplayName = (type: string): string => {
    const documentNames: Record<string, string> = {
      idProof: "ID Proof",
      addressProof: "Address Proof",
      passportPhoto: "Passport Photo",
      profilePhoto: "Profile Photo",
      policeVerification: "Police Verification",
      tradeLicense: "Trade License",
    };
    return documentNames[type] || type;
  };

  // Get document subtitle
  const getDocumentSubtitle = (type: string): string => {
    const subtitles: Record<string, string> = {
      idProof: "Government ID Document",
      addressProof: "Address Verification",
      passportPhoto: "Profile Picture",
      profilePhoto: "Professional Photo",
      policeVerification: "Background Check",
      tradeLicense: "Business License",
    };
    return subtitles[type] || "Document";
  };

  // Generate star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarBorderOutlined
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    if (reviewStats) {
      // Filter out flagged reviews from stats
      const filteredDistribution = { ...reviewStats.ratingDistribution };
      // You might want to adjust this based on how your backend handles flagged reviews in stats
      return filteredDistribution;
    }

    // Fallback to mock data if no stats available
    return {
      5: Math.floor((technician?.ratingCount || 0) * 0.8),
      4: Math.floor((technician?.ratingCount || 0) * 0.15),
      3: Math.floor((technician?.ratingCount || 0) * 0.04),
      2: Math.floor((technician?.ratingCount || 0) * 0.01),
      1: 0,
    };
  };

  // Format time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time: string): string => {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Format time range for display
  const formatTimeRange = (range: { start: string; end: string }): string => {
    return `${formatTimeTo12Hour(range.start)} - ${formatTimeTo12Hour(
      range.end
    )}`;
  };

  // Get availability status
  const getAvailabilityStatus = () => {
    if (technician?.status === "suspended") {
      return {
        status: "Suspended",
        available: false,
        message: "Not available due to suspension",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: "❌",
      };
    }

    return {
      status: "Available",
      available: true,
      message: "Available for bookings",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: "✅",
    };
  };
  const hasAvailability = weeklyAvailability.some(
    (day) => day.slots.length > 0
  );

  const handleBooking = (
    technicianId: string,
    technicianName: string
  ): void => {
    // Get the service name from location state or use the first service
    const serviceName = location.state?.serviceName || technician?.services[0];

    navigate(`/booking?technicianId=${technicianId}`, {
      state: {
        technicianName: technicianName,
        serviceName: serviceName, // Pass service name
        fromProfile: true,
      },
    });
  };

  const CommunityGuidelinesNotice = () => (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-5">
      <div className="flex items-start space-x-2">
        <InfoOutlined className="w-4 h-4 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">
            Community Guidelines
          </p>
          <p className="text-xs text-blue-800 mt-1">
            • Flagged reviews are hidden from public view
            <br />
            • You can report inappropriate content using the flag icon
            <br />
            • Orange highlight indicates reviews you've reported
            <br />• Our team reviews all reports within 24 hours
          </p>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading technician profile...
              </span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !technician) {
    return (
      <>
        <Header />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {error || "Technician not found"}
              </h3>
              <button
                onClick={() => navigate("/services")}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Services
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const availabilityStatus = getAvailabilityStatus();
  const totalReviews = reviewStats?.totalReviews || technician.ratingCount;
  const averageRating = reviewStats?.averageRating || technician.averageRating;

  return (
    <>
      <Header />
      <div className="w-full min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => navigate("/services")}
                className="text-gray-600 hover:text-blue-600 cursor-pointer"
              >
                Services
              </button>
              <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-blue-600 cursor-pointer"
              >
                {location.state?.serviceName || "Service Details"}
              </button>
              <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {technician.displayName}
              </span>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Technician Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    {technician.profilePictureUrl ? (
                      <img
                        src={technician.profilePictureUrl}
                        alt={technician.displayName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <PersonOutlineOutlined className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircleOutlineOutlined className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h1 className="text-2xl font-bold">
                      {technician.displayName}
                    </h1>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {technician.averageRating.toFixed(1)}
                    </span>
                    <span>({technician.ratingCount} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {technician.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                    {technician.services.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                        +{technician.services.length - 3} more
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <CheckCircleOutlineOutlined className="w-4 h-4 mr-1" />
                    Verified by LocalFix
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-600 mb-4">
              {technician.bio ||
                `Experienced technician specializing in ${technician.services.join(
                  ", "
                )}. 
                Committed to providing quality service with attention to detail and customer satisfaction.`}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <AccessTimeOutlined className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Experience</p>
                  <p className="text-sm text-gray-600">
                    {technician.experienceYears > 0
                      ? `${technician.experienceYears} years`
                      : "Fresh"}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl mt-1">💬</span>
                <div>
                  <p className="font-medium">Languages Spoken</p>
                  <p className="text-sm text-gray-600">
                    {technician.personalInfo?.languages?.join(", ") ||
                      "English, Local Language"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Services */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Skills & Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technician.services.map((service, index) => (
                <div
                  key={`service-${index}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <BuildOutlined className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{service}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Availability & Service Area */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ScheduleOutlined className="w-5 h-5 mr-2 text-blue-600" />
              Availability & Service Area
            </h2>

            {/* Current Status Card */}
            <div
              className={`border rounded-lg p-4 mb-6 ${availabilityStatus.color}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{availabilityStatus.icon}</span>
                  <div>
                    <h3 className="font-semibold">
                      {availabilityStatus.status}
                    </h3>
                    <p className="text-sm opacity-90">
                      {availabilityStatus.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Schedule */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <CalendarMonthOutlined className="w-4 h-4 mr-2 text-blue-600" />
                  Next 7 Days Schedule
                </h3>

                {hasAvailability ? (
                  <div className="space-y-3">
                    {weeklyAvailability
                      .filter((dayInfo) => dayInfo.slots.length > 0)
                      .map((dayInfo, index) => (
                        <div
                          key={`day-${dayInfo.date.getTime()}-${index}`} // Fixed: Use timestamp for unique key
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            dayInfo.isToday
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`font-medium min-w-24 ${
                                dayInfo.isToday
                                  ? "text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {dayInfo.dayName.charAt(0).toUpperCase() +
                                dayInfo.dayName.slice(1)}
                              {dayInfo.isToday && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  Today
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="text-right">
                            {dayInfo.slots.length > 0 ? (
                              dayInfo.slots.map((range, rangeIndex) => (
                                <div
                                  key={`slot-${dayInfo.date.getTime()}-${rangeIndex}-${
                                    range.start
                                  }-${range.end}`} // Fixed: More specific key
                                  className={`text-sm ${
                                    dayInfo.isToday
                                      ? "text-blue-600"
                                      : "text-gray-600"
                                  } font-medium`}
                                >
                                  {formatTimeRange(range)}
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <ScheduleOutlined className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p>No availability scheduled</p>
                    <p className="text-sm mt-1">Contact for availability</p>
                  </div>
                )}

                {/* Schedule Summary */}
                {hasAvailability && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 text-center">
                      Available{" "}
                      <strong>
                        {
                          weeklyAvailability.filter(
                            (day) => day.slots.length > 0
                          ).length
                        }{" "}
                        days
                      </strong>{" "}
                      in next week • Based on recurring schedule
                    </p>
                  </div>
                )}
              </div>

              {/* Service Area & Details */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <LocationOnOutlined className="w-4 h-4 mr-2 text-blue-600" />
                  Service Area
                </h3>

                <div className="space-y-4">
                  {/* Work Areas */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium mb-3 text-gray-700">
                      Coverage Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.workAreas.length > 0 ? (
                        technician.workAreas.slice(0, 6).map((area, index) => (
                          <span
                            key={`area-${index}`}
                            className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
                          >
                            <LocationOnOutlined className="w-3 h-3 mr-1 text-blue-500" />
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-600">
                          Flexible service area
                        </span>
                      )}
                      {technician.workAreas.length > 6 && (
                        <span className="text-sm text-gray-500 px-2 py-1">
                          +{technician.workAreas.length - 6} more areas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Radius */}
                  {technician.serviceRadiusKm && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium mb-2 text-gray-700">
                        Service Radius
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <LocationOnOutlined className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {technician.serviceRadiusKm} km radius
                          </p>
                          <p className="text-xs text-gray-600">
                            Travels within {technician.serviceRadiusKm}{" "}
                            kilometers of location
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ratings & Reviews */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ratings & Reviews</h2>
              {reviews.length > 0 && (
                <button className="text-blue-600 text-sm hover:underline">
                  View all →
                </button>
              )}
            </div>
            <CommunityGuidelinesNotice />

            {reviewsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading reviews...</span>
              </div>
            ) : totalReviews > 0 ? (
              <>
                <div className="flex items-center space-x-8 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">
                      {averageRating.toFixed(1)}
                    </div>
                    {renderStars(Math.round(averageRating))}
                    <div className="text-sm text-gray-600">
                      {totalReviews} reviews
                    </div>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div
                        key={`stars-${stars}`}
                        className="flex items-center space-x-2 mb-1"
                      >
                        <span className="text-sm text-gray-600 w-12">
                          {stars} stars
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${
                                (ratingDistribution[
                                  stars as keyof typeof ratingDistribution
                                ] /
                                  totalReviews) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">
                          {
                            ratingDistribution[
                              stars as keyof typeof ratingDistribution
                            ]
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div
                        key={review._id}
                        className={`border-t border-gray-200 pt-4 relative ${
                          review.userReported
                            ? "bg-orange-50 border-orange-200 rounded-lg p-4"
                            : ""
                        }`}
                      >
                        {/* Report Button - Show different states */}
                        {user && review.userId !== user._id && (
                          <button
                            onClick={() => handleReportReview(review._id)}
                            disabled={review.userReported}
                            className={`absolute top-4 right-0 transition-colors ${
                              review.userReported
                                ? "text-orange-500 cursor-not-allowed"
                                : "text-gray-400 hover:text-red-500"
                            }`}
                            title={
                              review.userReported
                                ? "You have already reported this review"
                                : "Report this review"
                            }
                          >
                            <FlagCircleOutlined className="w-4 h-4" />
                            {review.userReported && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                            )}
                          </button>
                        )}

                        {/* Reported Badge - Show if current user has reported */}
                        {review.userReported && (
                          <div className="mb-2">
                            <div className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              <FlagCircleOutlined className="w-3 h-3 mr-1" />
                              Reported by you
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {review.user?.fullName ||
                                review.userName ||
                                "Anonymous User"}
                            </p>
                            {review.user?.email && (
                              <p className="text-xs text-gray-500">
                                {review.user.email}
                              </p>
                            )}
                            <div className="flex items-center space-x-2">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No reviews yet. Be the first to review this technician!
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this technician!
              </div>
            )}
          </div>

          {/* Documents & Certifications */}
          {technician.documents && technician.documents.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Documents & Certifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {technician.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <InsertDriveFileOutlined className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">
                          {getDocumentDisplayName(doc.type)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getDocumentSubtitle(doc.type)}
                        </p>
                      </div>
                    </div>
                    {doc.verified && (
                      <CheckCircleOutlineOutlined className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start space-x-2">
                <CheckCircleOutlineOutlined className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900">
                  All documents have been verified by LocalFix team for your
                  safety.
                </p>
              </div>
            </div>
          )}

          {/* Book Technician Button */}
          <button
            onClick={() =>
              handleBooking(technician._id, technician.displayName)
            }
            className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center space-x-2 cursor-pointer transition-colors duration-200"
          >
            <CalendarMonthOutlined className="w-5 h-5" />
            <span>Book This Technician</span>
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TechnicianProfile;
