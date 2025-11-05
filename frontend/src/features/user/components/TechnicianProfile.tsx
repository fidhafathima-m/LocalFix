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
} from "@mui/icons-material";
import Footer from "../../../components/common/Footer";
import Header from "../../../components/common/Header";
import { TechnicianMangementService } from "../../../services/admin/TechnicianManagementService";
import { RRule } from "rrule";

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

interface Review {
  _id: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  user?: {
    fullName: string;
  };
}

const TechnicianProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [, setSlotRules] = useState<SlotRule[]>([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState<
    DailyAvailability[]
  >([]);
  const [reviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

            // Check if the response has the expected structure
            if (
              slotRulesResponse.data?.success &&
              slotRulesResponse.data.data?.slotRules
            ) {
              setSlotRules(slotRulesResponse.data.data.slotRules);

              // Generate weekly availability from slot rules
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

  // Calculate rating distribution (mock data for now)
  const getRatingDistribution = () => {
    // This would normally come from your API
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
    navigate(`/booking?technicianId=${technicianId}`, {
      state: {
        technicianName: technicianName,
        fromProfile: true,
      },
    });
  };

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
                          key={`day-${index}-${dayInfo.dayName}`}
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
                                  key={rangeIndex}
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

            {technician.ratingCount > 0 ? (
              <>
                <div className="flex items-center space-x-8 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">
                      {technician.averageRating.toFixed(1)}
                    </div>
                    {renderStars(Math.round(technician.averageRating))}
                    <div className="text-sm text-gray-600">
                      {technician.ratingCount} reviews
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
                                  technician.ratingCount) *
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
                        className="border-t border-gray-200 pt-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">
                              {review.user?.fullName ||
                                review.userName ||
                                "Anonymous User"}
                            </p>
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
