/* eslint-disable @typescript-eslint/no-explicit-any */
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
  AddOutlined,
  ScheduleOutlined,
  WarningOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";
import Footer from "../../../../components/common/Footer";
import Header from "../../../../components/common/Header";
import { selectIsLoggedIn, selectUser } from "../../../../store/slices/authSlice";
import { useAppSelector } from "../../../../hooks/redux";
import { TechnicianMangementService } from "../../../../services/admin/TechnicianManagementService";
import { userService } from "../../../../services/user/userService";
import { AddAddressModal } from "../../components/AddAddressModal";
import toast from "react-hot-toast";
import { RRule } from "rrule";
import type { AddressFormData } from "../../../../interface/user/IUserApi";

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
  workingHours?: {
    start: string;
    end: string;
  };
  workingDays?: string[];
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

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
  createdAt: string;
}

interface DailyAvailability {
  date: Date;
  formattedDate: string;
  dayName: string;
  slots: Array<{
    start: string;
    end: string;
  }>;
  isToday: boolean;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [usesSavedAddress, setUsesSavedAddress] = useState(true);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [weeklyAvailability, setWeeklyAvailability] = useState<
    DailyAvailability[]
  >([]);
  const [problemDescription, setProblemDescription] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  // Get auth state from Redux
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectUser);

  // Get technician ID and service name from URL parameters or location state
  const searchParams = new URLSearchParams(location.search);
  const technicianId =
    searchParams.get("technicianId") || location.state?.technicianId;
  const serviceName =
    searchParams.get("service") || location.state?.service || "";

  // Fetch technician data with slot rules
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
          technicianData = technicianResponse.data.data.technician;
        } else if (technicianResponse.data?.technician) {
          technicianData = technicianResponse.data.technician;
        } else if (technicianResponse.data) {
          technicianData = technicianResponse.data;
        } else {
          technicianData = technicianResponse;
        }

        if (technicianData) {
          setTechnician(technicianData);

          // Prefill service if provided
          if (serviceName && technicianData.services?.includes(serviceName)) {
            console.log("🔧 Setting pre-selected service:", serviceName);
            setSelectedService(serviceName);
          } else if (technicianData.services?.length > 0) {
            console.log(
              "🔧 Auto-selecting first available service:",
              technicianData.services[0]
            );
            setSelectedService(technicianData.services[0]);
          }

          console.log("🔍 Technician slot rules:", technicianData.slotRules);

          // Fetch slot rules separately to get the most up-to-date availability
          try {
            const slotRulesResponse =
              await TechnicianMangementService.getTechnicianSlotRules(
                technicianId
              );

            if (
              slotRulesResponse.data?.success &&
              slotRulesResponse.data.data?.slotRules
            ) {
              const slotRules = slotRulesResponse.data.data.slotRules;
              console.log("🔍 Fetched slot rules:", slotRules);

              // Generate weekly availability from slot rules (same as TechnicianProfile)
              const availability = generateWeeklyAvailability(slotRules);
              console.log("🔍 Generated weekly availability:", availability);
              setWeeklyAvailability(availability);

              // Prefill first available date and time
              const firstAvailableDay = availability.find(
                (day) => day.slots.length > 0
              );
              if (firstAvailableDay && !selectedDate) {
                setSelectedDate(firstAvailableDay.formattedDate);
                if (firstAvailableDay.slots.length > 0 && !selectedTime) {
                  const firstSlot = firstAvailableDay.slots[0];
                  setSelectedTime(
                    `${formatTimeTo12Hour(
                      firstSlot.start
                    )} - ${formatTimeTo12Hour(firstSlot.end)}`
                  );
                }
              }
            } else {
              console.warn("No slot rules found");
              setWeeklyAvailability([]);
            }
          } catch (slotError) {
            console.error("Error fetching slot rules:", slotError);
            setWeeklyAvailability([]);
          }
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
  }, [technicianId, isLoggedIn, serviceName]);

  // Generate weekly availability from slot rules - extend to 30 days
  const generateWeeklyAvailability = (rules: any[]): DailyAvailability[] => {
    const days: DailyAvailability[] = [];
    const today = new Date();

    // Get next 30 days to match the date picker range
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Find slots for this day from active rules
      const daySlots = getSlotsForDate(rules, date);

      days.push({
        date,
        formattedDate: date.toISOString().split("T")[0],
        dayName,
        slots: daySlots,
        isToday: i === 0,
      });
    }

    return days;
  };

  // Get slots for a specific date from slot rules (same function as TechnicianProfile)
  const getSlotsForDate = (
    rules: any[],
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

  // Generate time slots from start to end time (same function as TechnicianProfile)
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

  // Merge consecutive slots (same function as TechnicianProfile)
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

  // Format time to 12-hour format
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

  // Get available time slots for selected date
  const getAvailableTimeSlotsForSelectedDate = (): string[] => {
    if (!selectedDate) return [];
    const dayForDate = weeklyAvailability.find(
      (day) => day.formattedDate === selectedDate
    );
    return dayForDate
      ? dayForDate.slots.map((slot) => formatTimeRange(slot))
      : [];
  };

  // Handle date change with validation
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setDateError(null);

    // Check if the selected date is available
    const selectedDay = weeklyAvailability.find(
      (day) => day.formattedDate === date
    );

    console.log("🔍 Selected date:", date);
    console.log("🔍 Selected day data:", selectedDay);
    console.log("🔍 Weekly availability:", weeklyAvailability);

    // Only show error if the day is NOT available (no slots)
    if (!selectedDay || selectedDay.slots.length === 0) {
      const dayName = new Date(date)
        .toLocaleDateString("en-US", {
          weekday: "long",
        })
        .toLowerCase();
      const availableDays = getAvailableDaysSummary();
      console.log("❌ Date not available - showing error");
      setDateError(`Technician is unavailable on ${dayName}. ${availableDays}`);
    } else {
      console.log("✅ Date is available - no error");
    }
  };
  // Get technician's available days summary
  // Get technician's available days summary
  const getAvailableDaysSummary = () => {
    const availableDays = weeklyAvailability.filter(
      (day) => day.slots.length > 0
    );
    if (availableDays.length === 0) return "No available days";

    const dayNames = availableDays.map((day) => day.dayName);
    const uniqueDays = [...new Set(dayNames)];

    // Capitalize the first letter of each day name for display
    const capitalizedDays = uniqueDays.map(
      (day) => day.charAt(0).toUpperCase() + day.slice(1)
    );

    return `Available on ${capitalizedDays.join(", ")}`;
  };

  // Get available dates for the date input
  const getAvailableDates = (): string[] => {
    return weeklyAvailability
      .filter((day) => day.slots.length > 0)
      .map((day) => day.formattedDate);
  };

  // Custom date input to only show available dates
  const DateInput = () => {
    const availableDates = getAvailableDates();

    return (
      <div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          max={
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          } // 30 days from now
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {dateError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <WarningOutlined className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{dateError}</p>
          </div>
        )}
        {availableDates.length > 0 && !dateError && (
          <p className="text-green-600 text-xs mt-2">
            ✅ {availableDates.length} available dates in next 30 days
          </p>
        )}
      </div>
    );
  };

  // Fetch user addresses
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!isLoggedIn) return;

      try {
        const response = await userService.getUserAddresses();
        if (response.success && response.data) {
          setUserAddresses(response.data.addresses || []);

          // Prefill default address if available
          const defaultAddress = response.data.addresses?.find(
            (addr) => addr.isDefault
          );
          if (defaultAddress) {
            setSelectedAddress(defaultAddress.id);
          }
        }
      } catch (err) {
        console.error("Error fetching user addresses:", err);
        toast.error("Failed to load saved addresses");
      }
    };

    fetchUserAddresses();
  }, [isLoggedIn]);

  // Handle navigation to login
  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname + window.location.search;
    navigate("/login", {
      state: {
        from: currentPath,
        technicianId: technicianId,
        service: serviceName,
      },
    });
  };

  // Handle adding new address
  const handleAddAddress = async (addressData: AddressFormData) => {
    try {
      setSavingAddress(true);
      setError(null);

      const response = await userService.createAddress(addressData);

      if (response.success && response.data) {
        const newAddresses = [...userAddresses, response.data.address];
        setUserAddresses(newAddresses);

        if (addressData.isDefault) {
          setSelectedAddress(response.data.address.id);
        }

        setShowAddAddressModal(false);
        setUsesSavedAddress(true);
        toast.success("Address added successfully!");
      } else {
        setError(response.message || "Failed to add address");
      }
    } catch (err: any) {
      console.error("Error adding address:", err);
      setError(err.response?.data?.message || "Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  // In BookingPage.tsx - Update handleContinueToCheckout function
  const handleContinueToCheckout = () => {
    if (!selectedService) {
      toast.error("Please select a service type");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and time");
      return;
    }

    // Validate that selected date is available
    const selectedDay = weeklyAvailability.find(
      (day) => day.formattedDate === selectedDate
    );
    if (!selectedDay || selectedDay.slots.length === 0) {
      toast.error("Please select an available date");
      return;
    }

    // Validate that selected time is available
    const availableTimeSlots = getAvailableTimeSlotsForSelectedDate();
    if (!availableTimeSlots.includes(selectedTime)) {
      toast.error("Please select an available time slot");
      return;
    }

    if (usesSavedAddress && !selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    // Get the selected address
    const address = usesSavedAddress
      ? userAddresses.find((addr) => addr.id === selectedAddress)
      : null;

    if (!address) {
      toast.error("Please select a valid address");
      return;
    }

    // Navigate to checkout with all booking data
    navigate("/checkout", {
      state: {
        technician,
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
        address: address,
        usesSavedAddress,
        problemDescription
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

  const availableDates = getAvailableDates();
  const hasAvailability = weeklyAvailability.some(
    (day) => day.slots.length > 0
  );

  // Main booking form (only shown when logged in and technician data is loaded)
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
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-blue-600 cursor-pointer"
              >
                {location.state?.technicianName || "Technician details"}
              </button>
              <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">Booking</span>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
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
          {/* Service Details - Dynamic services based on technician */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBagOutlined className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Service Details</h2>
            </div>

            {/* Service Type - Show as read-only when pre-selected */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>

              {/* If service was pre-selected from navigation, show as read-only */}
              {serviceName && technician?.services?.includes(serviceName) ? (
                <div className="relative">
                  <input
                    type="text"
                    value={serviceName}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Pre-selected
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Service type was pre-selected from your previous selection
                  </p>
                </div>
              ) : (
                /* Allow selection if no service was pre-selected */
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select service</option>
                  {getSafeServices().map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Brand
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Select brand</option>
                <option value="LG">LG</option>
                <option value="Samsung">Samsung</option>
                <option value="Whirlpool">Whirlpool</option>
                <option value="Voltas">Voltas</option>
                <option value="Daikin">Daikin</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description / Notes
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue you're facing (e.g., AC not cooling, water leakage observed)"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
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
            {/* Technician Availability Info */}
            {hasAvailability && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <ScheduleOutlined className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-1">
                      Technician's Availability
                    </h3>
                    <p className="text-blue-700 text-sm">
                      {getAvailableDaysSummary()}
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      {availableDates.length} days available in next 30 days
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!hasAvailability && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <WarningOutlined className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 text-sm mb-1">
                      No Availability
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      This technician is not available for bookings in the next
                      7 days.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <DateInput />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate || dateError !== null}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {dateError
                      ? "Select an available date first"
                      : !selectedDate
                      ? "Select date first"
                      : "Select time slot"}
                  </option>
                  {getAvailableTimeSlotsForSelectedDate().map((slot, index) => (
                    <option key={index} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {selectedDate &&
                  !dateError &&
                  getAvailableTimeSlotsForSelectedDate().length === 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      No available time slots for selected date
                    </p>
                  )}
              </div>
            </div>
            {/* Selected Schedule Summary */}
            {selectedDate && selectedTime && !dateError && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">
                  <strong>Selected:</strong>{" "}
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  at {selectedTime}
                </p>
              </div>
            )}
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

            {usesSavedAddress ? (
              userAddresses.length > 0 ? (
                <select
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an address</option>
                  {userAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.label} - {address.street}, {address.city},{" "}
                      {address.state} - {address.pincode}
                      {address.isDefault && " (Default)"}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 mb-2">No saved addresses found</p>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <AddOutlined className="w-4 h-4" />
                    <span>Add your first address</span>
                  </button>
                </div>
              )
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Add New Address</h3>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <AddOutlined className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Click the button above to add a new address. The address will
                  be saved to your profile for future bookings.
                </p>
              </div>
            )}
          </div>

          {/* Add Address Modal */}
          <AddAddressModal
            isOpen={showAddAddressModal}
            onClose={() => setShowAddAddressModal(false)}
            onSave={handleAddAddress}
            loading={savingAddress}
          />

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/services")}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleContinueToCheckout}
              disabled={
                !selectedDate ||
                !selectedTime ||
                !selectedService ||
                (usesSavedAddress && !selectedAddress) ||
                dateError !== null
              }
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
