import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowBackIosNewOutlined,
  StarBorderOutlined,
  PersonOutlined,
  ShoppingBagOutlined,
  CalendarMonthOutlined,
  HomeOutlined,
  LoginOutlined,
} from "@mui/icons-material";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { selectIsLoggedIn, selectUser } from "../../../store/slices/authSlice";
import { useAppSelector } from "../../../hooks/redux";
import { TechnicianMangementService } from "../../../services/admin/TechnicianManagementService";

// Add interface for technician data
interface Technician {
  _id: string;
  displayName: string;
  profilePictureUrl?: string;
  averageRating: number;
  ratingCount: number;
  services: string[];
  experienceYears: number;
  bio?: string;
  // Add other fields you need
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [usesSavedAddress, setUsesSavedAddress] = useState(true);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth state from Redux
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectUser);

  // Get technician ID from URL parameters or location state
  const searchParams = new URLSearchParams(location.search);
  const technicianId =
    searchParams.get("technicianId") || location.state?.technicianId;

  // Fetch technician data
  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (!technicianId) {
        setError("Technician ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch technician data
        const technicianResponse =
          await TechnicianMangementService.getPublicTechnicianById(
            technicianId
          );

        let technicianData;

        if (technicianResponse.data?.data?.technician) {
          // If nested under data.data.technician
          technicianData = technicianResponse.data.data.technician;
        } else if (technicianResponse.data?.technician) {
          // If nested under data.technician
          technicianData = technicianResponse.data.technician;
        } else if (technicianResponse.data) {
          // If data itself is the technician object
          technicianData = technicianResponse.data;
        } else {
          // If response is the technician object directly
          technicianData = technicianResponse;
        }

        if (technicianData) {
          setTechnician(technicianData);
        } else {
          setError("Technician data not found in response");
        }
      } catch (err) {
        console.error("Error fetching technician data:", err);
        setError("Failed to load technician information");
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn && technicianId) {
      fetchTechnicianData();
    } else {
      setLoading(false);
    }
  }, [technicianId, isLoggedIn]);

  // Handle navigation to login
  const handleLoginRedirect = () => {
    // Save the current URL and technician ID to return after login
    const currentPath = window.location.pathname + window.location.search;
    navigate("/login", {
      state: {
        from: currentPath,
        technicianId: technicianId, // Pass technician ID to login page
      },
    });
  };

  // Safe function to get rating with fallback
  const getSafeRating = () => {
    if (!technician?.averageRating && technician?.averageRating !== 0) {
      return 0;
    }
    return technician.averageRating;
  };

  // Safe function to get rating count with fallback
  const getSafeRatingCount = () => {
    if (!technician?.ratingCount && technician?.ratingCount !== 0) {
      return 0;
    }
    return technician.ratingCount;
  };

  // Safe function to get services with fallback
  const getSafeServices = () => {
    return technician?.services || [];
  };

  // Safe function to get experience years with fallback
  const getSafeExperienceYears = () => {
    if (!technician?.experienceYears && technician?.experienceYears !== 0) {
      return 0;
    }
    return technician.experienceYears;
  };

  // Loading state for technician data
  if (loading) {
    return (
      <>
        <Header userType="user" />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading technician information...
              </span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state for technician data
  if (error && isLoggedIn) {
    return (
      <>
        <Header userType="user" />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {error}
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

  // Not logged in state - show login prompt
  if (!isLoggedIn) {
    return (
      <>
        <Header userType="user" />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Link
              to="/services"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
            >
              <ArrowBackIosNewOutlined className="w-4 h-4 mr-2" />
              Back to Services
            </Link>

            {/* Login Required Message */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LoginOutlined className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Please log in to your account to book this service. This helps
                us provide you with a secure and personalized booking
                experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLoginRedirect}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center cursor-pointer"
                >
                  <LoginOutlined className="w-5 h-5 mr-2" />
                  Login to Continue
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Create Account
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-6">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // If technician data is still null after loading, show error
  if (!technician) {
    return (
      <>
        <Header userType="user" />
        <div className="w-full min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Technician not found
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

  // Main booking form (only shown when logged in and technician data is loaded)
  return (
    <>
      <Header />
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Dynamic back link to technician profile */}
          <Link
            to={`/technicians/${technician?._id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowBackIosNewOutlined className="w-4 h-4 mr-2" />
            Back to Technician Profile
          </Link>

          <h1 className="text-3xl font-bold mb-8">Book Your Service</h1>

          {/* Technician Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  {technician?.profilePictureUrl ? (
                    <img
                      src={technician.profilePictureUrl}
                      alt={technician.displayName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <PersonOutlined className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">
                      {technician?.displayName}
                    </h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      Verified
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{getSafeRating().toFixed(1)}</span>
                    <span>•</span>
                    <span>{getSafeRatingCount()} reviews</span>
                    <span>•</span>
                    <span>{getSafeServices()[0] || "Service"}</span>
                  </div>
                  {getSafeExperienceYears() > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      {getSafeExperienceYears()}+ years experience
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details - Pre-fill with user data */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <PersonOutlined className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Personal Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  defaultValue={user?.fullName || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    defaultValue={user?.phone || ""}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                defaultValue={user?.email || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Service Details - Dynamic services based on technician */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBagOutlined className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Service Details</h2>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select service</option>
                {getSafeServices().map((service, index) => (
                  <option key={index} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Brand
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select brand</option>
                <option>LG</option>
                <option>Samsung</option>
                <option>Whirlpool</option>
                <option>Voltas</option>
                <option>Daikin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description / Notes
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue you're facing (e.g., AC not cooling, water leakage observed)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarMonthOutlined className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Schedule</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Select time slot</option>
                  <option>9:00 AM - 11:00 AM</option>
                  <option>11:00 AM - 1:00 PM</option>
                  <option>2:00 PM - 4:00 PM</option>
                  <option>4:00 PM - 6:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <HomeOutlined className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Address</h2>
            </div>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={usesSavedAddress}
                  onChange={() => setUsesSavedAddress(true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Use saved address</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!usesSavedAddress}
                  onChange={() => setUsesSavedAddress(false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm">Add new address</span>
              </label>
            </div>
            {usesSavedAddress && (
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Home - 123 Main St, Kanpur</option>
                <option>Office - 456 Business Park, Kanpur</option>
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/services")}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingPage;
