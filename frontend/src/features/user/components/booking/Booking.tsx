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
import {
  selectIsLoggedIn,
  selectUser,
} from "../../../../store/slices/authSlice";
import { useAppSelector } from "../../../../hooks/redux";
import { TechnicianMangementService } from "../../../../services/admin/TechnicianManagementService";
import { userService } from "../../../../services/user/userService";
import { AddAddressModal } from "../userProfile/modals/AddAddressModal";
import toast from "react-hot-toast";
import { RRule } from "rrule";
import type { AddressFormData } from "../../../../interface/user/IUserApi";
import { useBreadcrumb } from "../../../../hooks/useBreadcrumb";
import {
  validateBookingStep,
  validatePhoneNumber,
} from "../../../../validation/utils/bookingValidationUtils";
import { bookingService } from "../../../../services/user/bookingService";

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

interface TimeSlotWithStatus {
  time: string;
  isBooked: boolean;
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [usesSavedAddress, setUsesSavedAddress] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
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
  const [brandError, setBrandError] = useState<string | null>(null);
  const [problemDescriptionError, setProblemDescriptionError] = useState<
    string | null
  >(null);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  // Get auth state from Redux
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user = useAppSelector(selectUser);

  // Get technician ID and service name from URL parameters or location state
  const searchParams = new URLSearchParams(location.search);
  const technicianId =
    searchParams.get("technicianId") || location.state?.technicianId;

  const [technicianName] = useState(location.state?.technicianName || "");

  const { breadcrumb, updateBreadcrumb } = useBreadcrumb();

  const serviceName =
    searchParams.get("service") ||
    location.state?.service ||
    breadcrumb.serviceName ||
    "";
  useEffect(() => {
    if (technician && !breadcrumb.technicianName) {
      updateBreadcrumb({
        technicianName: technician.displayName,
      });
    }
  }, [technician, breadcrumb.technicianName, updateBreadcrumb]);

  // Helper function to check if service is available
  const isServiceAvailable = (service: string): boolean => {
    if (!technician?.services || !service) return false;

    const availableServices = getSafeServices();
    const normalizedInput = service.toLowerCase().trim();

    return availableServices.some(
      (availableService) =>
        availableService.toLowerCase().trim() === normalizedInput,
    );
  };

  const getNextAvailableDate = (): string => {
    const today = new Date();
    const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes

    for (let i = 0; i < weeklyAvailability.length; i++) {
      const day = weeklyAvailability[i];

      if (day.slots.length === 0) continue;

      // If it's not today, any available day is fine
      if (!day.isToday) {
        return day.formattedDate;
      }

      // If it's today, check if there are any future time slots
      const hasFutureSlots = day.slots.some((slot) => {
        const [slotHour, slotMinute] = slot.start.split(":").map(Number);
        const slotTime = slotHour * 60 + slotMinute;
        return slotTime > currentTime;
      });

      if (hasFutureSlots) {
        return day.formattedDate;
      }
    }

    // If no available dates found, return empty string
    return "";
  };

  // Helper function to find the exact service name from available services
  const findMatchingService = (service: string): string | null => {
    if (!technician?.services || !service) return null;

    const availableServices = getSafeServices();
    const normalizedInput = service.toLowerCase().trim();

    const matchedService = availableServices.find(
      (availableService) =>
        availableService.toLowerCase().trim() === normalizedInput,
    );

    return matchedService || null;
  };

  // Update breadcrumb when service is selected
  useEffect(() => {
    if (selectedService && !breadcrumb.serviceName) {
      updateBreadcrumb({
        serviceName: selectedService,
      });
    }
  }, [selectedService, breadcrumb.serviceName, updateBreadcrumb]);

  // Update the breadcrumb display
  const displayServiceName = breadcrumb.serviceName || serviceName;
  const displayTechnicianName = breadcrumb.technicianName || technicianName;

  const isFormValid =
    selectedService &&
    selectedBrand &&
    problemDescription.trim().length >= 10 &&
    selectedDate &&
    selectedTime &&
    validatePhoneNumber(phoneNumber) &&
    (!usesSavedAddress || selectedAddress) &&
    !dateError;

  useEffect(() => {
    if (technician?.services && serviceName) {
      const matchingService = findMatchingService(serviceName);
      if (matchingService && selectedService !== matchingService) {
        setSelectedService(matchingService);
      }
    }
  }, [technician, serviceName, selectedService]);

  // Update the main service selection useEffect
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
            technicianId,
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

          // Service selection logic (keep your existing code)
          if (serviceName && technicianData.services?.length > 0) {
            const matchingService = findMatchingService(serviceName);
            if (matchingService) {
              setSelectedService(matchingService);
            } else {
              setSelectedService(technicianData.services[0]);
            }
          } else if (technicianData.services?.length > 0) {
            setSelectedService(technicianData.services[0]);
          }

          // Fetch slot rules
          try {
            const slotRulesResponse =
              await TechnicianMangementService.getTechnicianSlotRules(
                technicianId,
              );

            if (
              slotRulesResponse.data?.success &&
              slotRulesResponse.data.data?.slotRules
            ) {
              const slotRules = slotRulesResponse.data.data.slotRules;
              const availability = generateWeeklyAvailability(slotRules);
              setWeeklyAvailability(availability);

              const nextAvailableDate = getNextAvailableDate();

              if (nextAvailableDate && !selectedDate) {
                setSelectedDate(nextAvailableDate);

                // Set the first available time slot for that date
                const selectedDay = availability.find(
                  (day) => day.formattedDate === nextAvailableDate,
                );

                if (
                  selectedDay &&
                  selectedDay.slots.length > 0 &&
                  !selectedTime
                ) {
                  // If it's today, filter out past time slots
                  if (selectedDay.isToday) {
                    const availableSlots = getAvailableTimeSlotsForDate(
                      selectedDay.formattedDate,
                    );
                    if (availableSlots.length > 0) {
                      // Extract the time string from the object
                      setSelectedTime(availableSlots[0].time);
                    }
                  } else {
                    // For future dates, use all slots
                    const firstSlot = selectedDay.slots[0];
                    if (firstSlot) {
                      setSelectedTime(formatTimeRange(firstSlot));
                    }
                  }
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

  const getAvailableTimeSlotsForDate = (date: string): TimeSlotWithStatus[] => {
    const dayForDate = weeklyAvailability.find(
      (day) => day.formattedDate === date,
    );

    if (!dayForDate) return [];

    const now = new Date();
    const isToday = date === now.toISOString().split("T")[0];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isSlotBooked = (slot: { start: string; end: string }): boolean => {
      return false;
    };

    const slots = dayForDate.slots.filter((slot) => {
      if (isToday) {
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [slotHour, slotMinute] = slot.start.split(":").map(Number);
        const slotTime = slotHour * 60 + slotMinute;
        return slotTime > currentTime;
      }
      return true;
    });

    return slots.map((slot) => ({
      time: formatTimeRange(slot),
      isBooked: isSlotBooked(slot),
    }));
  };

  // Generate weekly availability from slot rules - extend to 30 days
  // Update the function signature
  const generateWeeklyAvailability = (
    rules: any[],
    existingBookings: any[] = [],
  ): DailyAvailability[] => {
    const days: DailyAvailability[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];

      const dayName = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();

      // Get slots for this day
      const daySlots = getSlotsForDate(rules, date);

      // Filter out booked slots
      const availableSlots = daySlots.filter((slot) => {
        const slotStartTime = `${slot.start}`;
        const slotEndTime = `${slot.end}`;

        // Check if any existing booking overlaps with this slot
        const isBooked = existingBookings.some((booking) => {
          if (booking.scheduledAt.split("T")[0] !== dateString) return false;

          // Parse booking time slot
          const [bookingStart, bookingEnd] = booking.timeSlot.split(" - ");

          // Check for overlap
          return doTimeSlotsOverlap(
            slotStartTime,
            slotEndTime,
            bookingStart,
            bookingEnd,
          );
        });

        return !isBooked;
      });

      days.push({
        date,
        formattedDate: dateString,
        dayName,
        slots: availableSlots,
        isToday: i === 0,
      });
    }

    return days;
  };

  // Helper function to check time slot overlap
  const doTimeSlotsOverlap = (
    slot1Start: string,
    slot1End: string,
    slot2Start: string,
    slot2End: string,
  ): boolean => {
    const parseTime = (timeStr: string): number => {
      const [time, period] = timeStr.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let totalMinutes = hours * 60 + minutes;

      if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
      if (period === "AM" && hours === 12) totalMinutes = minutes;

      return totalMinutes;
    };

    const start1 = parseTime(slot1Start);
    const end1 = parseTime(slot1End);
    const start2 = parseTime(slot2Start);
    const end2 = parseTime(slot2End);

    return start1 < end2 && start2 < end1;
  };

  // Get slots for a specific date from slot rules
  // Get slots for a specific date from slot rules
  const getSlotsForDate = (
    rules: any[],
    date: Date,
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
          true,
        );

        // If this rule applies to the current date, generate slots
        if (occurrences.length > 0) {
          const daySlots = generateTimeSlots(
            rule.startTime,
            rule.endTime,
            rule.slotDurationMinutes,
          );
          slots.push(...daySlots);
        }
      } catch (error) {
        console.error("Error processing slot rule:", error);
      }
    });

    // Remove duplicates using a Map
    const uniqueSlotsMap = new Map<string, { start: string; end: string }>();

    slots.forEach((slot) => {
      const key = `${slot.start}-${slot.end}`;
      if (!uniqueSlotsMap.has(key)) {
        uniqueSlotsMap.set(key, slot);
      }
    });

    // Convert back to array and sort
    const uniqueSlots = Array.from(uniqueSlotsMap.values());
    return uniqueSlots.sort((a, b) => a.start.localeCompare(b.start));
  };

  // Generate time slots from start to end time
  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    durationMinutes: number,
  ): Array<{ start: string; end: string }> => {
    const slots: Array<{ start: string; end: string }> = [];

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Convert start and end times to total minutes
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    let currentTime = startTotalMinutes;

    // Generate slots until we reach or exceed the end time
    while (currentTime + durationMinutes <= endTotalMinutes) {
      // Calculate start time
      const slotStartHour = Math.floor(currentTime / 60);
      const slotStartMinute = currentTime % 60;
      const slotStart = `${slotStartHour.toString().padStart(2, "0")}:${slotStartMinute.toString().padStart(2, "0")}`;

      // Calculate end time
      const slotEndTime = currentTime + durationMinutes;
      const slotEndHour = Math.floor(slotEndTime / 60);
      const slotEndMinute = slotEndTime % 60;
      const slotEnd = `${slotEndHour.toString().padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`;

      slots.push({ start: slotStart, end: slotEnd });

      // Move to next slot (increment by duration)
      currentTime = slotEndTime;
    }

    return slots;
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
      range.end,
    )}`;
  };

  // Get available time slots for selected date
  const getAvailableTimeSlotsForSelectedDate = (): TimeSlotWithStatus[] => {
    if (!selectedDate) return [];
    return getAvailableTimeSlotsForDate(selectedDate);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setDateError(null);

    // Check if the selected date is available
    const selectedDay = weeklyAvailability.find(
      (day) => day.formattedDate === date,
    );

    // Only show error if the day is NOT available (no slots)
    if (!selectedDay || selectedDay.slots.length === 0) {
      const dayName = new Date(date)
        .toLocaleDateString("en-US", {
          weekday: "long",
        })
        .toLowerCase();
      const availableDays = getAvailableDaysSummary();
      setDateError(`Technician is unavailable on ${dayName}. ${availableDays}`);
    } else {
      console.log("Date is available - no error");

      // Auto-select the first available time slot
      const availableSlots = getAvailableTimeSlotsForDate(date);
      if (availableSlots.length > 0) {
        setSelectedTime(availableSlots[0].time);
      }
    }
  };
  // Get technician's available days summary
  const getAvailableDaysSummary = () => {
    const availableDays = weeklyAvailability.filter(
      (day) => day.slots.length > 0,
    );
    if (availableDays.length === 0) return "No available days";

    const dayNames = availableDays.map((day) => day.dayName);
    const uniqueDays = [...new Set(dayNames)];

    // Capitalize the first letter of each day name for display
    const capitalizedDays = uniqueDays.map(
      (day) => day.charAt(0).toUpperCase() + day.slice(1),
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
        {availableDates.length > 0 && !dateError && selectedDate && (
          <p className="text-green-600 text-xs mt-2">
            ✅ {getAvailableTimeSlotsForSelectedDate().length} time slots
            available on this date
          </p>
        )}
      </div>
    );
  };

  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!isLoggedIn) return;

      try {
        const response = await userService.getUserAddresses();
        if (response.success && response.data) {
          setUserAddresses(response.data.addresses || []);

          // Prefill default address if available
          const defaultAddress = response.data.addresses?.find(
            (addr) => addr.isDefault,
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

    // Set phone number from Redux user data with better handling
    if (user?.phone) {
      // Remove any non-digit characters and take only the last 10 digits
      const cleanPhone = user.phone.replace(/\D/g, "").slice(-10);
      setPhoneNumber(cleanPhone);
    } else {
      // If no phone in Redux, try to fetch fresh user data
      const fetchUserProfile = async () => {
        try {
          const profileResponse = await userService.getUserProfile();
          if (profileResponse.success && profileResponse.data?.user?.phone) {
            const cleanPhone = profileResponse.data.user.phone
              .replace(/\D/g, "")
              .slice(-10);
            setPhoneNumber(cleanPhone);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      };
      fetchUserProfile();
    }

    fetchUserAddresses();
  }, [isLoggedIn, user]);

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

  const handleContinueToCheckout = async () => {
    // Clear previous errors
    setBrandError(null);
    setProblemDescriptionError(null);
    setDateError(null);

    // 1. Validate service details using the validation utility
    const serviceValidation = validateBookingStep("service-details", {
      selectedService,
      selectedBrand,
      problemDescription,
    });

    if (!serviceValidation.success && serviceValidation.errors) {
      // Set individual field errors
      if (serviceValidation.errors.selectedService) {
        toast.error(serviceValidation.errors.selectedService);
      }
      if (serviceValidation.errors.selectedBrand) {
        setBrandError(serviceValidation.errors.selectedBrand);
        toast.error(serviceValidation.errors.selectedBrand);
      }
      if (serviceValidation.errors.problemDescription) {
        setProblemDescriptionError(serviceValidation.errors.problemDescription);
        toast.error(serviceValidation.errors.problemDescription);
      }
      return;
    }

    // 2. Validate schedule using the validation utility
    const scheduleValidation = validateBookingStep("schedule", {
      selectedDate,
      selectedTime,
    });

    if (!scheduleValidation.success && scheduleValidation.errors) {
      if (scheduleValidation.errors.selectedDate) {
        setDateError(scheduleValidation.errors.selectedDate);
        toast.error(scheduleValidation.errors.selectedDate);
      }
      if (scheduleValidation.errors.selectedTime) {
        toast.error(scheduleValidation.errors.selectedTime);
      }
      return;
    }

    // 4. Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // 5. Validate address
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

    try {
      // 5. Update user profile with the provided phone number if different
      const shouldUpdatePhone = phoneNumber && user?.phone !== phoneNumber;

      if (shouldUpdatePhone) {
        try {
          // Show loading state
          toast.loading("Updating your profile...", { id: "phone-update" });

          // Use the existing updateUserProfile method
          const updateResponse = await userService.updateUserProfile({
            phone: `+91${phoneNumber}`, // Format with country code
          });

          if (updateResponse.success) {
            toast.success("Phone number updated successfully", {
              id: "phone-update",
            });

            // Optional: Refresh user data in Redux store if needed
            // dispatch(refreshUserProfile());
          } else {
            // toast.error(
            //   "Failed to update phone number, but continuing with booking",
            //   {
            //     id: "phone-update",
            //   }
            // );
            console.warn("Phone update failed:", updateResponse.message);
          }
        } catch (updateError) {
          // toast.error(
          //   "Failed to update phone number, but continuing with booking",
          //   {
          //     id: "phone-update",
          //   }
          // );
          console.error("Phone update error:", updateError);
        }
      }
      try {
        // Check availability before proceeding
        toast.loading("Checking technician availability...", {
          id: "availability-check",
        });

        const availabilityResponse =
          await userService.checkTechnicianAvailability(
            technicianId!,
            selectedDate,
            selectedTime,
          );

        if (
          !availabilityResponse.success ||
          !availabilityResponse.data?.available
        ) {
          toast.dismiss("availability-check");
          toast.error(
            availabilityResponse.data?.message ||
              availabilityResponse.message ||
              "This time slot is no longer available. Please select another time.",
          );

          // Refresh availability slots
          if (technicianId) {
            refreshAvailability(technicianId, selectedDate);
          }
          return;
        }

        toast.dismiss("availability-check");
        toast.success("Time slot confirmed! Proceeding to checkout...");
      } catch (error) {
        toast.dismiss("availability-check");
        console.error("Error checking availability:", error);
        toast.error("Unable to check availability. Please try again.");
      }

      navigate("/checkout", {
        state: {
          technician,
          service: selectedService,
          brand: selectedBrand,
          date: selectedDate,
          time: selectedTime,
          address: address,
          usesSavedAddress,
          problemDescription: problemDescription.trim(),
          userPhoneNumber: phoneNumber,
          userFullName: user?.fullName || "",
          userEmail: user?.email || "",
          phoneUpdated: shouldUpdatePhone,
        },
      });
    } catch (error) {
      console.error("Error during booking preparation:", error);
      toast.error("An error occurred while processing your booking");
    }
  };

  const refreshAvailability = async (technicianId: string, date: string) => {
    try {
      // Fetch updated slot rules
      const slotRulesResponse =
        await TechnicianMangementService.getTechnicianSlotRules(technicianId);

      if (slotRulesResponse.data?.success) {
        const slotRules = slotRulesResponse.data.data?.slotRules || [];

        // Get existing bookings for the date to mark booked slots
        const bookingsResponse =
          await bookingService.getTechnicianBookingsForDate(technicianId, date);

        const existingBookings = bookingsResponse.data?.bookings || [];

        // Generate availability with booked slots marked
        const availability = generateWeeklyAvailability(
          slotRules,
          existingBookings,
        );
        setWeeklyAvailability(availability);
      }
    } catch (error) {
      console.error("Error refreshing availability:", error);
    }
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
    (day) => day.slots.length > 0,
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
                {displayServiceName || "Service Details"}
              </button>
              <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-blue-600 cursor-pointer"
              >
                {displayTechnicianName || "Technician details"}
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
                    value={phoneNumber}
                    onChange={(e) => {
                      // Allow only numbers and limit to 10 digits
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setPhoneNumber(value);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {!validatePhoneNumber(phoneNumber) &&
                  phoneNumber.length > 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      Please enter a valid 10-digit phone number
                    </p>
                  )}
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
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <ShoppingBagOutlined className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Service Details</h2>
            </div>
            {/* Service Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>

              {/* Show service selection based on flow */}
              {serviceName &&
              selectedService &&
              isServiceAvailable(serviceName) ? (
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedService}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Pre-selected
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Service type was pre-selected from your service flow:{" "}
                    <strong>{serviceName}</strong>
                  </p>
                </div>
              ) : (
                /* Service selection dropdown */
                <div>
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

                  {/* Show breadcrumb service as suggestion if available but not selected */}
                  {serviceName && !selectedService && (
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested from your flow: <strong>{serviceName}</strong> -
                      <button
                        type="button"
                        onClick={() => {
                          const matchingService =
                            findMatchingService(serviceName);
                          if (matchingService) {
                            setSelectedService(matchingService);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 ml-1 cursor-pointer"
                      >
                        Select this service
                      </button>
                    </p>
                  )}
                </div>
              )}

              {/* Show warning if service name is provided but not available */}
              {serviceName &&
                technician?.services &&
                !isServiceAvailable(serviceName) && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-700 text-sm">
                      <strong>Note:</strong> "{serviceName}" is not available
                      with this technician. Please select from the available
                      services below.
                    </p>
                  </div>
                )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  if (brandError && e.target.value) {
                    setBrandError(null);
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  brandError ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select brand</option>
                <option value="LG">LG</option>
                <option value="Samsung">Samsung</option>
                <option value="Whirlpool">Whirlpool</option>
                <option value="Voltas">Voltas</option>
                <option value="Daikin">Daikin</option>
                <option value="Other">Other</option>
              </select>
              {brandError && (
                <p className="text-red-500 text-xs mt-1">{brandError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description / Notes{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe the issue you're facing (e.g., AC not cooling, water leakage observed)"
                value={problemDescription}
                onChange={(e) => {
                  setProblemDescription(e.target.value);
                  // Clear error when user starts typing
                  if (problemDescriptionError) {
                    setProblemDescriptionError(null);
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  problemDescriptionError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {problemDescriptionError && (
                <p className="text-red-500 text-xs mt-1">
                  {problemDescriptionError}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Please provide details about the issue to help the technician
                prepare (minimum 10 characters)
              </p>
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
                  disabled={
                    !selectedDate ||
                    dateError !== null ||
                    getAvailableTimeSlotsForSelectedDate().length === 0
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {dateError
                      ? "Select an available date first"
                      : !selectedDate
                        ? "Select date first"
                        : getAvailableTimeSlotsForSelectedDate().length === 0
                          ? "No available time slots"
                          : "Select time slot"}
                  </option>
                  {getAvailableTimeSlotsForSelectedDate().map((slot, index) => (
                    <option
                      key={index}
                      value={slot.time}
                      disabled={slot.isBooked}
                      className={slot.isBooked ? "text-gray-400" : ""}
                    >
                      {slot.time} {slot.isBooked ? "(Booked)" : ""}
                    </option>
                  ))}
                </select>
                {selectedDate &&
                  !dateError &&
                  getAvailableTimeSlotsForSelectedDate().length === 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      No available time slots remaining for today. Please select
                      another date.
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
              disabled={!isFormValid}
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
