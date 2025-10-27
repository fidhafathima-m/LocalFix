import React, { useState, useEffect } from "react";
import {
  CalendarTodayOutlined,
  FmdGoodOutlined,
  StarBorderOutlined,
  Star,
  WarningOutlined,
  BlockOutlined,
} from "@mui/icons-material";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { type TechnicianProfile } from "../../../services/common/technicianApi";
import { TechnicianService } from "../../../services/technician/technicianService";
import { useNavigate } from "react-router-dom";

interface DashboardData {
  overview: {
    upcomingBookings: number;
    monthlyEarnings: number;
    totalJobs: number;
    averageRating: number;
  };
  bookings: {
    bookings: unknown[];
    isNewTechnician?: boolean;
  };
  earnings: {
    earnings: unknown[];
    isNewTechnician?: boolean;
  };
  reviews: {
    reviews: unknown[];
    isNewTechnician?: boolean;
  };
  profile: TechnicianProfile;
  suspensionReason?: string;
  suspendedAt?: string;
}

// Type guard to check if value is a valid string array for languages
function isValidStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

const ApprovedTechnicianDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionInfo, setSuspensionInfo] = useState<{
    reason?: string;
    suspendedAt?: string;
  }>({});
  const navigate = useNavigate()

  useEffect(() => {
    const loadTechnicianData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Fetching technician profile...');

        const response = await TechnicianService.getProfile();

        console.log('🔍 Raw API Response:', response);
    console.log('🔍 Response data:', response.data);
    console.log('🔍 Response data.data:', response.data?.data);

        if (!response.success) {
          throw new Error("Failed to fetch profile: API returned unsuccessful");
        }

        const profile = response.data?.data?.profile || 
                   response.data?.profile || 
                   response.data?.data;

        if (!profile) {
          throw new Error("Profile data not found in response");
        }

        // Check if technician is suspended
        const suspended = profile.status === "suspended";
        setIsSuspended(suspended);

        // Extract suspension info if available
        if (suspended) {
          setSuspensionInfo({
            reason: profile.suspensionReason || "Violation of terms of service",
            suspendedAt: profile.suspendedAt || new Date().toISOString(),
          });
        }

        setDashboardData({
          overview: {
            upcomingBookings: 0,
            monthlyEarnings: 0,
            totalJobs: 0,
            averageRating: profile.averageRating || 0,
          },
          bookings: {
            bookings: [],
            isNewTechnician: true,
          },
          earnings: {
            earnings: [],
            isNewTechnician: true,
          },
          reviews: {
            reviews: [],
            isNewTechnician: true,
          },
          profile: {
            ...profile,
            personalInfo: {
              fullName: profile.personalInfo?.fullName,
              gender: profile.personalInfo?.gender || "Not specified",
              phoneNumber:
                profile.personalInfo?.phoneNumber ||
                profile.phone ||
                "Not provided",
              dateOfBirth: profile.personalInfo?.dateOfBirth || "Not specified",
              address: profile.personalInfo?.address || {
                street: "Not specified",
                city: "Not specified",
                state: "Not specified",
                pincode: "Not specified",
              },
              languages: profile.personalInfo?.languages || [],
            },
          },
          suspensionReason: profile.suspensionReason,
          suspendedAt: profile.suspendedAt,
        });
      } catch (err) {
        console.error("Failed to load technician data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load technician profile"
        );
        setDashboardData(getEmptyDashboardData());
      } finally {
        setLoading(false);
      }
    };
    loadTechnicianData();
  }, []);

  const getEmptyDashboardData = (): DashboardData => {
    return {
      overview: {
        upcomingBookings: 0,
        monthlyEarnings: 0,
        totalJobs: 0,
        averageRating: 0,
      },
      bookings: {
        bookings: [],
        isNewTechnician: true,
      },
      earnings: {
        earnings: [],
        isNewTechnician: true,
      },
      reviews: {
        reviews: [],
        isNewTechnician: true,
      },
      profile: {
        _id: "",
        userId: "",
        displayName: "",
        email: "",
        phone: "",
        services: [],
        experienceYears: 0,
        workAreas: [],
        averageRating: 0,
        ratingCount: 0,
        profilePictureUrl: "",
        isVerified: false,
        status: "active",
        isApproved: true,
        createdAt: "",
        updatedAt: "",
        personalInfo: {
          fullName: "",
          gender: "Not specified",
          phoneNumber: "",
          dateOfBirth: "",
          address: {
            street: "Not specified",
            city: "Not specified",
            state: "Not specified",
            pincode: "Not specified",
          },
          languages: [],
        },
      },
    };
  };

  // Helper function to get languages as array
  const getLanguagesArray = (languages: unknown): string[] => {
    if (!languages) return [];

    // If it's already a valid string array
    if (isValidStringArray(languages)) {
      return languages.filter((lang) => lang && String(lang).trim() !== "");
    }

    // If it's a string that might contain languages
    if (typeof languages === "string") {
      if (languages.trim() === "") return [];

      // Try to parse as JSON
      try {
        const parsed = JSON.parse(languages);
        if (isValidStringArray(parsed)) {
          return parsed.filter((lang) => lang && String(lang).trim() !== "");
        }
      } catch {
        // If not JSON, try comma-separated
        if (languages.includes(",")) {
          return languages
            .split(",")
            .map((lang) => lang.trim())
            .filter((lang) => lang !== "");
        }
        // Single language string
        return [languages.trim()];
      }
    }

    return [];
  };

  // Suspension Banner Component
  const SuspensionBanner = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <BlockOutlined className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium text-sm">
            Account Suspended
          </h3>
          <p className="text-red-700 text-sm mt-1">
            Your technician account has been suspended by the administrator.
          </p>
          {suspensionInfo.reason && (
            <div className="mt-2">
              <p className="text-red-600 text-xs font-medium">Reason:</p>
              <p className="text-red-600 text-xs mt-1">
                {suspensionInfo.reason}
              </p>
            </div>
          )}
          {suspensionInfo.suspendedAt && (
            <p className="text-red-600 text-xs mt-2">
              Suspended on: {formatDate(suspensionInfo.suspendedAt)}
            </p>
          )}
          <div className="mt-3">
            <p className="text-red-600 text-xs">
              <strong>What this means:</strong>
            </p>
            <ul className="text-red-600 text-xs list-disc list-inside mt-1 space-y-1">
              <li>You cannot accept new bookings</li>
              <li>Your profile is not visible to customers</li>
              <li>You cannot access earnings or booking features</li>
              <li>You can still view your profile and contact support</li>
            </ul>
          </div>
          <div className="mt-3">
            <button className="bg-red-600 text-white px-4 py-2 rounded text-xs font-medium hover:bg-red-700 mr-2">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Disabled State Overlay for suspended technicians
  const DisabledOverlay = ({
    children,
    tab,
  }: {
    children: React.ReactNode;
    tab: string;
  }) => {
    if (!isSuspended || tab === "profile") return <>{children}</>;

    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <BlockOutlined className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Feature Unavailable
            </h3>
            <p className="text-gray-500 mb-4">
              This feature is temporarily disabled due to account suspension.
            </p>
            <p className="text-gray-400 text-sm">
              Please contact support to resolve this issue.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderStars = (rating: number, filled = false) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const StarIcon =
            filled && i < Math.floor(rating) ? Star : StarBorderOutlined;
          return (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          );
        })}
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Not specified") return "Not specified";

    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime())
        ? date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Not specified";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Not specified";
    }
  };

  const getLocation = (profile: TechnicianProfile) => {
    const address = profile.personalInfo?.address;
    if (
      address?.city &&
      address?.state &&
      address.city !== "Not specified" &&
      address.state !== "Not specified"
    ) {
      return `${address.city}, ${address.state}`;
    }
    if (profile.workAreas && profile.workAreas.length > 0) {
      return profile.workAreas[0];
    }
    return "Location not set";
  };

  // Update status display in profile header
  const getStatusBadge = (profile: TechnicianProfile) => {
    if (isSuspended) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <WarningOutlined className="h-3 w-3 mr-1" />
          Suspended
        </span>
      );
    }

    if (profile.isVerified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Verified
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending Verification
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading technician profile...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && (!dashboardData || !dashboardData.profile.displayName)) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!dashboardData) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Failed to load dashboard data</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { overview, profile } = dashboardData;

  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Profile Information</h3>
        {!isSuspended && (
          <button 
          className="text-blue-600 text-sm font-medium hover:text-blue-700 cursor-pointer"
          onClick={() => navigate("/technician/profile")}>
            Edit Profile
          </button>
        )}
      </div>

      {/* Account Status Warning for suspended technicians */}
      {isSuspended && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <WarningOutlined className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-yellow-800 font-medium text-sm">
                Profile Editing Disabled
              </h4>
              <p className="text-yellow-700 text-sm">
                You cannot edit your profile while your account is suspended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bio Section */}
      {dashboardData.profile.bio && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">About Me</h4>
          <p className="text-gray-600 text-sm">{dashboardData.profile.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Personal Details</h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Full Name</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.personalInfo?.fullName ||
                  "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.personalInfo?.phoneNumber ||
                  dashboardData.profile.phone ||
                  "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Gender</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.personalInfo?.gender || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Date of Birth</dt>
              <dd className="text-sm font-medium">
                {formatDate(
                  dashboardData.profile.personalInfo?.dateOfBirth || ""
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Languages</dt>
              <dd className="text-sm font-medium">
                {(() => {
                  const languagesArray = getLanguagesArray(
                    dashboardData.profile.personalInfo?.languages
                  );

                  return languagesArray.length > 0
                    ? languagesArray.join(", ")
                    : "Not specified";
                })()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Professional Details */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">
            Professional Details
          </h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Experience</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.experienceYears} years
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Services</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.services.length > 0
                  ? dashboardData.profile.services.join(", ")
                  : "No services specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Work Areas</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.workAreas.length > 0
                  ? dashboardData.profile.workAreas.join(", ")
                  : "No work areas specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Rating</dt>
              <dd className="text-sm font-medium">
                {dashboardData.profile.averageRating.toFixed(1)} (
                {dashboardData.profile.ratingCount} reviews)
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="text-sm font-medium">
                {getStatusBadge(dashboardData.profile)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Address Section*/}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Street</dt>
            <dd className="text-sm font-medium">
              {dashboardData.profile.personalInfo?.address?.street ||
                "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">City</dt>
            <dd className="text-sm font-medium">
              {dashboardData.profile.personalInfo?.address?.city ||
                "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">State</dt>
            <dd className="text-sm font-medium">
              {dashboardData.profile.personalInfo?.address?.state ||
                "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Pincode</dt>
            <dd className="text-sm font-medium">
              {dashboardData.profile.personalInfo?.address?.pincode ||
                "Not specified"}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <DisabledOverlay tab="overview">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CalendarTodayOutlined className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-xs text-gray-500">Upcoming</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl font-bold">
                      {overview.upcomingBookings}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-green-500 text-lg mr-1">₹</span>
                      <span className="text-xs text-gray-500">This Month</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl font-bold">
                      {formatCurrency(overview.monthlyEarnings)}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-purple-500 text-xs mr-1">Jobs</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl font-bold">
                      {overview.totalJobs}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <StarBorderOutlined className="h-5 w-5 text-yellow-500 mr-1" />
                      <span className="text-xs text-gray-500">Average</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="text-xl font-bold">
                      {overview.averageRating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Bookings */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <CalendarTodayOutlined className="h-4 w-4 text-blue-500 mr-2" />
                      Upcoming Bookings
                    </h3>
                  </div>
                  <div className="text-center py-8">
                    <CalendarTodayOutlined className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Bookings section</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Currently unavailable - Under development
                    </p>
                  </div>
                </div>

                {/* Recent Earnings */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium flex items-center">
                      <span className="text-green-500 text-lg mr-2">₹</span>
                      Recent Earnings
                    </h3>
                  </div>
                  <div className="text-center py-8">
                    <span className="text-green-500 text-2xl mx-auto mb-3">
                      ₹
                    </span>
                    <p className="text-gray-500 text-sm">Earnings section</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Currently unavailable - Under development
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <StarBorderOutlined className="h-4 w-4 text-yellow-500 mr-2 fill-yellow-400" />
                    Recent Reviews
                  </h3>
                </div>
                <div className="text-center py-8">
                  <StarBorderOutlined className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Reviews section</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Currently unavailable - Under development
                  </p>
                </div>
              </div>
            </DisabledOverlay>
          </div>
        );

      case "bookings":
        return (
          <DisabledOverlay tab="bookings">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <CalendarTodayOutlined className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bookings Section
              </h3>
              <p className="text-gray-500 mb-4">
                This section is currently being developed.
              </p>
              <p className="text-gray-400 text-sm">
                You'll be able to manage your bookings here soon.
              </p>
            </div>
          </DisabledOverlay>
        );

      case "earnings":
        return (
          <DisabledOverlay tab="earnings">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <span className="text-green-500 text-4xl mx-auto mb-4">₹</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Earnings Section
              </h3>
              <p className="text-gray-500 mb-4">
                This section is currently being developed.
              </p>
              <p className="text-gray-400 text-sm">
                Detailed earnings reports will be available here soon.
              </p>
            </div>
          </DisabledOverlay>
        );

      case "profile":
        return renderProfileTab();

      default:
        return (
          <DisabledOverlay tab={activeTab}>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">
                This section is under development.
              </p>
            </div>
          </DisabledOverlay>
        );
    }
  };

  return (
    <>
      <Header userType="serviceProvider" isApproved={!isSuspended} />
      <div className="min-h-screen bg-gray-50">
        {/* Suspension Banner - Show at the top if suspended */}
        {isSuspended && <SuspensionBanner />}

        {/* Header */}
<div className="bg-white border-b border-gray-200">
  <div className="max-w-3xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
          {profile.profilePictureUrl ? (
            <img
              src={profile.profilePictureUrl}
              alt={profile.personalInfo?.fullName || "Technician"}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="text-yellow-700 text-lg font-medium">
              {(profile.personalInfo?.fullName?.charAt(0) || 'T').toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center">
            <h1 className="text-lg font-semibold mr-2">
              {profile.personalInfo?.fullName || "Technician"}
            </h1>
            {getStatusBadge(profile)}
          </div>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              {renderStars(profile.averageRating, true)}
              <span className="ml-1 text-sm text-gray-600">
                {profile.averageRating.toFixed(1)} (
                {profile.ratingCount})
              </span>
            </div>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-sm text-gray-600 flex items-center">
              <FmdGoodOutlined className="h-3 w-3 mr-1" />
              {getLocation(profile)}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <nav className="flex overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "bookings", label: "Bookings" },
                { id: "earnings", label: "Earnings" },
                { id: "profile", label: "Profile" },
                { id: "settings", label: "Settings" },
                { id: "documents", label: "Documents" },
                { id: "messages", label: "Messages" },
                { id: "notifications", label: "Notifications" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  } ${
                    isSuspended && tab.id !== "profile"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isSuspended && tab.id !== "profile"}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-3xl mx-auto px-4 py-6">{renderTabContent()}</div>
      </div>
      <Footer />
    </>
  );
};

export default ApprovedTechnicianDashboard;