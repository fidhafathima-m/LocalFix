/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { TechnicianService } from "../../../../../services/technician/technicianService";
import toast from "react-hot-toast";
import type { TechnicianProfile } from "../../../../../interface/technician/ITechnicianApi";
import {
  WeeklyAvailabilitySelector,
  type WeeklyAvailability,
} from "../helper/AvailabilitySelector";

interface AvailabilityData {
  isAvailable: boolean;
  serviceAreas: string[];
  workRadius: number;
  availability: WeeklyAvailability;
  tomorrowAvailable?: boolean;
}

const AvailabilityPreferences = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingTomorrow, setUpdatingTomorrow] = useState(false);
  const [formData, setFormData] = useState<AvailabilityData>({
    isAvailable: true,
    serviceAreas: [],
    workRadius: 10,
    availability: {
      availableWeeks: [1, 2, 3, 4],
      weeklyPattern: {
        monday: { available: false, startTime: "09:00", endTime: "18:00" },
        tuesday: { available: false, startTime: "09:00", endTime: "18:00" },
        wednesday: { available: false, startTime: "09:00", endTime: "18:00" },
        thursday: { available: false, startTime: "09:00", endTime: "18:00" },
        friday: { available: false, startTime: "09:00", endTime: "18:00" },
        saturday: { available: false, startTime: "09:00", endTime: "18:00" },
        sunday: { available: false, startTime: "09:00", endTime: "18:00" },
      },
    },
    tomorrowAvailable: true,
  });

  // Available service areas - matching your application form
  const availableServiceAreas = [
    "Kannur",
    "Kochi",
    "Kollam",
    "Thiruvananthapuram",
    "Thrissur",
    "Malappuram",
    "Kozhikode",
    "Trivandrum",
  ];

  useEffect(() => {
    fetchProfileAndAvailability();
  }, []);

  const fetchProfileAndAvailability = async () => {
    try {
      setLoading(true);

      // Fetch profile data
      const profileResponse = await TechnicianService.getProfile();
      if (profileResponse.success) {
        const profileData =
          profileResponse.data?.data?.profile ||
          profileResponse.data?.profile ||
          profileResponse.data?.data;

        let availabilityData = [];
        let slotRulesData = [];

        try {
          // Fetch actual availability records
          const availabilityResponse =
            await TechnicianService.getTechnicianAvailability();
          console.log(
            "Availability data by technician: ",
            availabilityResponse
          );
          if (availabilityResponse.success) {
            availabilityData = availabilityResponse.data?.availability || [];
          }
        } catch (availabilityError) {
          console.log("No availability data available", availabilityError);
        }

        try {
          // Fetch slot rules data
          const slotRulesResponse = await TechnicianService.getSlotRules();
          if (slotRulesResponse.success) {
            slotRulesData = slotRulesResponse.data?.slotRules || [];
          }
        } catch (slotError) {
          console.log("No slot rules data available", slotError);
        }

        // Combine all data
        const combinedData = {
          ...profileData,
          availabilityRecords: availabilityData,
          slotRules: slotRulesData,
        };

        // Extract availability data from combined data
        const extractedAvailabilityData =
          extractAvailabilityFromProfile(combinedData);

        setFormData(extractedAvailabilityData);
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching profile and availability:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date and day name
  const getTomorrowInfo = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayName = dayNames[tomorrow.getDay()];

    const formattedDate = tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    return {
      date: tomorrow,
      dayName,
      formattedDate,
    };
  };

  useEffect(() => {
    // Recalculate tomorrow's availability whenever weekly pattern changes
    const newTomorrowAvailable = checkTomorrowAvailability(
      formData.availability.weeklyPattern
    );
    if (newTomorrowAvailable !== formData.tomorrowAvailable) {
      setFormData((prev) => ({
        ...prev,
        tomorrowAvailable: newTomorrowAvailable,
      }));
    }
  }, [formData.availability.weeklyPattern]);

  // Check if tomorrow is available based on weekly pattern
  const checkTomorrowAvailability = (weeklyPattern: any): boolean => {
    const tomorrowInfo = getTomorrowInfo();
    const tomorrowDay = tomorrowInfo.dayName;

    // Check if tomorrow's day is marked as available in the weekly pattern
    const tomorrowPattern = weeklyPattern[tomorrowDay];
    return tomorrowPattern?.available || false;
  };

  const extractAvailabilityFromProfile = (
    profileData: any
  ): AvailabilityData => {
    let serviceAreas: string[] = [];
    let workRadius = 10;
    let isAvailable = true;
    let availableWeeks = [1, 2, 3, 4]; // Default

    // Try multiple sources for service areas
    if (profileData.workAreas && profileData.workAreas.length > 0) {
      serviceAreas = profileData.workAreas;
    } else if (profileData.availabilityPreferences?.serviceAreas) {
      serviceAreas = profileData.availabilityPreferences.serviceAreas;
    } else if (profileData.serviceAreas) {
      serviceAreas = profileData.serviceAreas;
    }

    // Get work radius
    if (profileData.serviceRadiusKm) {
      workRadius = profileData.serviceRadiusKm;
    } else if (profileData.availabilityPreferences?.workRadius) {
      workRadius = profileData.availabilityPreferences.workRadius;
    }

    // Get availability status
    isAvailable =
      profileData.isAvailable !== false &&
      profileData.availabilityPreferences?.isAvailable !== false;

    // Extract available weeks from slot rules
    if (profileData.slotRules && profileData.slotRules.length > 0) {
      const extractedWeeks = extractAvailableWeeksFromSlotRules(
        profileData.slotRules
      );
      if (extractedWeeks.length > 0) {
        availableWeeks = extractedWeeks;
      }
    }

    // Get the weekly pattern and ensure valid time values
    const weeklyPattern = getWeeklyPatternFromProfile(profileData);

    const sanitizedWeeklyPattern: any = {};
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    days.forEach((day) => {
      const dayPattern = weeklyPattern[day] || {
        available: false,
        startTime: "09:00",
        endTime: "18:00",
      };

      // Ensure valid time values
      sanitizedWeeklyPattern[day] = {
        available: dayPattern.available || false,
        startTime: timeRegex.test(dayPattern.startTime)
          ? dayPattern.startTime
          : "09:00",
        endTime: timeRegex.test(dayPattern.endTime)
          ? dayPattern.endTime
          : "18:00",
      };
    });

    // Check tomorrow's availability
    const tomorrowAvailable = checkTomorrowAvailability(sanitizedWeeklyPattern);

    const result: AvailabilityData = {
      isAvailable,
      serviceAreas: serviceAreas,
      workRadius: workRadius,
      availability: {
        availableWeeks: availableWeeks,
        weeklyPattern: sanitizedWeeklyPattern,
      },
      tomorrowAvailable,
    };

    return result;
  };

  const extractAvailableWeeksFromSlotRules = (slotRules: any[]): number[] => {
    const weeks = new Set<number>();

    slotRules.forEach((rule) => {
      if (rule.rruleString) {
        // Parse RRULE to extract week numbers (e.g., "1MO" means 1st Monday)
        const weekMatches = rule.rruleString.matchAll(
          /(\d+)(MO|TU|WE|TH|FR|SA|SU)/g
        );

        for (const match of weekMatches) {
          if (match[1]) {
            weeks.add(parseInt(match[1]));
          }
        }
      }
    });

    return weeks.size > 0 ? Array.from(weeks).sort() : [1, 2, 3, 4];
  };

  const getWeeklyPatternFromProfile = (profileData: any): any => {
    // 1. First try to extract pattern from actual availability records
    if (
      profileData.availabilityRecords &&
      profileData.availabilityRecords.length > 0
    ) {
      return extractWeeklyPatternFromAvailabilityRecords(
        profileData.availabilityRecords
      );
    }

    // 2. Check if we have slot rules that we can convert
    if (profileData.slotRules && profileData.slotRules.length > 0) {
      return convertSlotRulesToWeeklyPattern(profileData.slotRules);
    }

    // 3. Check if we have direct availability data from the application form format
    if (profileData.availability?.weeklyPattern) {
      return profileData.availability.weeklyPattern;
    }

    // 4. Check availability.weeklyAvailability (converted format)
    if (profileData.availability?.weeklyAvailability) {
      return convertWeeklyAvailabilityToWeeklyPattern(
        profileData.availability.weeklyAvailability
      );
    }

    // 5. Since this technician has work areas and is available, set default weekday availability
    if (
      (profileData.availabilityPreferences?.isAvailable !== false ||
        profileData.isAvailable !== false) &&
      profileData.workAreas &&
      profileData.workAreas.length > 0
    ) {
      return getDefaultWeekdayAvailability();
    }

    // 6. Default pattern (all days unavailable)
    return getDefaultWeeklyPattern();
  };

  // Extract weekly pattern from real availability records
  const extractWeeklyPatternFromAvailabilityRecords = (
    availabilityRecords: any[]
  ): any => {
    const weeklyPattern = getDefaultWeeklyPattern();

    if (!availabilityRecords || availabilityRecords.length === 0) {
      return weeklyPattern;
    }

    // Group by day of week and analyze time slots
    const dayAnalysis: {
      [key: string]: { available: boolean; startTime: string; endTime: string };
    } = {};

    availabilityRecords.forEach((record) => {
      if (record.date && record.timeSlots && record.timeSlots.length > 0) {
        const date = new Date(record.date);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

        const dayNames = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        const dayName = dayNames[dayOfWeek];

        // If this day has available time slots, mark it as available
        const hasAvailableSlots = record.timeSlots.some(
          (slot: any) =>
            slot.status === "available" || slot.status === undefined
        );

        if (hasAvailableSlots) {
          // Find the earliest start time and latest end time for this day
          let earliestStart = "23:59";
          let latestEnd = "00:00";

          record.timeSlots.forEach((slot: any) => {
            if (slot.start && slot.end) {
              const startTime = new Date(slot.start)
                .toTimeString()
                .substring(0, 5);
              const endTime = new Date(slot.end).toTimeString().substring(0, 5);

              if (startTime < earliestStart) earliestStart = startTime;
              if (endTime > latestEnd) latestEnd = endTime;
            }
          });

          dayAnalysis[dayName] = {
            available: true,
            startTime: earliestStart !== "23:59" ? earliestStart : "09:00",
            endTime: latestEnd !== "00:00" ? latestEnd : "18:00",
          };
        }
      }
    });

    // Apply the analyzed pattern
    Object.keys(weeklyPattern).forEach((day) => {
      if (dayAnalysis[day]) {
        weeklyPattern[day] = dayAnalysis[day];
      }
    });

    return weeklyPattern;
  };

  // New function for default weekday availability
  const getDefaultWeekdayAvailability = (): any => {
    const weeklyPattern = getDefaultWeeklyPattern();

    // Set weekdays as available by default for technicians with work areas
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    weekdays.forEach((day) => {
      weeklyPattern[day] = {
        available: true,
        startTime: "09:00",
        endTime: "18:00",
      };
    });

    return weeklyPattern;
  };

  const convertSlotRulesToWeeklyPattern = (slotRules: any[]): any => {
    const weeklyPattern = getDefaultWeeklyPattern();

    if (!slotRules || slotRules.length === 0) return weeklyPattern;

    // Process each slot rule to determine availability
    slotRules.forEach((rule) => {
      if (rule.rruleString) {
        try {
          // Parse RRULE to extract days
          const rruleMatch = rule.rruleString.match(/BYDAY=([^;\n]+)/);
          if (rruleMatch) {
            const daysStr = rruleMatch[1];
            const days = daysStr.split(",");

            const dayMap: { [key: string]: string } = {
              MO: "monday",
              TU: "tuesday",
              WE: "wednesday",
              TH: "thursday",
              FR: "friday",
              SA: "saturday",
              SU: "sunday",
            };

            days.forEach((dayCode: string) => {
              // Handle both "MO" and "1MO" formats
              const cleanDayCode = dayCode.replace(/^\d+/, ""); // Remove leading numbers
              const dayName = dayMap[cleanDayCode];

              if (dayName && weeklyPattern[dayName]) {
                weeklyPattern[dayName] = {
                  available: true,
                  startTime: rule.startTime || "09:00",
                  endTime: rule.endTime || "18:00",
                };
              }
            });
          }
        } catch (error) {
          console.error("Error parsing RRULE:", error);
        }
      }
    });

    return weeklyPattern;
  };

  const convertWeeklyAvailabilityToWeeklyPattern = (
    weeklyAvailability: any
  ): any => {
    const weeklyPattern: any = {};
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    days.forEach((day) => {
      const dayData = weeklyAvailability[day];
      weeklyPattern[day] = {
        available: dayData?.enabled || false,
        startTime: dayData?.startTime || "09:00",
        endTime: dayData?.endTime || "18:00",
      };
    });

    return weeklyPattern;
  };

  const getDefaultWeeklyPattern = (): any => {
    return {
      monday: { available: false, startTime: "09:00", endTime: "18:00" },
      tuesday: { available: false, startTime: "09:00", endTime: "18:00" },
      wednesday: { available: false, startTime: "09:00", endTime: "18:00" },
      thursday: { available: false, startTime: "09:00", endTime: "18:00" },
      friday: { available: false, startTime: "09:00", endTime: "18:00" },
      saturday: { available: false, startTime: "09:00", endTime: "18:00" },
      sunday: { available: false, startTime: "09:00", endTime: "18:00" },
    };
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;

      if (name.startsWith("area-")) {
        const area = name.replace("area-", "");
        setFormData((prev) => {
          const updatedAreas = checked
            ? [...prev.serviceAreas, area]
            : prev.serviceAreas.filter((a) => a !== area);
          return { ...prev, serviceAreas: updatedAreas };
        });
      } else if (name === "isAvailable") {
        setFormData((prev) => ({
          ...prev,
          isAvailable: checked,
        }));
      }
    } else {
      if (name === "workRadius") {
        setFormData((prev) => ({
          ...prev,
          workRadius: parseInt(value) || 10,
        }));
      }
    }
  };

  const handleAvailabilityChange = (newAvailability: WeeklyAvailability) => {
    const newTomorrowAvailable = checkTomorrowAvailability(
      newAvailability.weeklyPattern
    );

    setFormData((prev) => ({
      ...prev,
      availability: newAvailability,
      tomorrowAvailable: newTomorrowAvailable,
    }));
  };
  // Toggle tomorrow's availability
  const handleTomorrowToggle = async (makeUnavailable: boolean) => {
    try {
      setUpdatingTomorrow(true);

      const tomorrowInfo = getTomorrowInfo();
      const tomorrowDay = tomorrowInfo.dayName;

      const newAvailability = !makeUnavailable;

      const updatedWeeklyPattern = {
        ...formData.availability.weeklyPattern,
        [tomorrowDay]: {
          ...formData.availability.weeklyPattern[tomorrowDay],
          available: newAvailability,
        },
      };

      // Update local state immediately
      setFormData((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          weeklyPattern: updatedWeeklyPattern,
        },
        tomorrowAvailable: newAvailability,
      }));

      const updateData = {
        availability: {
          isAvailable: formData.isAvailable,
          weeklyPattern: updatedWeeklyPattern,
          availableWeeks: formData.availability.availableWeeks,
        },
        serviceAreas: formData.serviceAreas,
        workRadius: formData.workRadius,
      };

      const response = await TechnicianService.updateAvailability(updateData);

      if (response.success) {
        if (profile) {
          setProfile({
            ...profile,
            availability: {
              isAvailable: formData.isAvailable,
              weeklyPattern: updatedWeeklyPattern,
            },
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const action = newAvailability ? "available" : "unavailable";

        // Show appropriate message based on action
        if (!newAvailability) {
          toast.success(
            `You are now unavailable for ${tomorrowInfo.formattedDate}. Any scheduled orders will be cancelled and customers will be notified.`
          );
        } else {
          toast.success(
            `You are now available for ${tomorrowInfo.formattedDate}`
          );
        }
      } else {
        // Revert state if API call failed
        setFormData((prev) => ({
          ...prev,
          availability: {
            ...prev.availability,
            weeklyPattern: formData.availability.weeklyPattern,
          },
          tomorrowAvailable: !newAvailability,
        }));
        toast.error("Failed to update tomorrow's availability");
      }
    } catch (error) {
      console.error("Error updating tomorrow's availability:", error);
      setFormData((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          weeklyPattern: formData.availability.weeklyPattern,
        },
        tomorrowAvailable: formData.tomorrowAvailable,
      }));
      toast.error("Failed to update availability");
    } finally {
      setUpdatingTomorrow(false);
    }
  };

  const getStatusDisplay = () => {
    const tomorrowInfo = getTomorrowInfo();

    // Always recalculate tomorrow's availability from current weekly pattern
    const currentTomorrowAvailable = checkTomorrowAvailability(
      formData.availability.weeklyPattern
    );

    if (formData.isAvailable) {
      return (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-start">
            <div className="text-green-500 bg-green-100 rounded-full p-1 mr-2">
              <CheckOutlinedIcon className="h-5 w-5" />
            </div>
            <span className="text-green-500 text-sm font-medium">
              Available for new jobs
            </span>
          </div>

          {/* Tomorrow's Availability */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  Available tomorrow?
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {tomorrowInfo.formattedDate}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentTomorrowAvailable
                    ? "You're accepting orders for tomorrow"
                    : "You're unavailable tomorrow. Any scheduled orders will be cancelled automatically."}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-sm font-medium ${
                    currentTomorrowAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {currentTomorrowAvailable ? "Available" : "Unavailable"}
                </span>
                <button
                  onClick={() => handleTomorrowToggle(currentTomorrowAvailable)}
                  disabled={updatingTomorrow || !formData.isAvailable}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    currentTomorrowAvailable ? "bg-green-500" : "bg-gray-300"
                  } ${
                    updatingTomorrow || !formData.isAvailable
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentTomorrowAvailable
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            {updatingTomorrow && (
              <div className="flex items-center mt-2 text-blue-600 text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Updating...
              </div>
            )}
            {!formData.isAvailable && (
              <div className="flex items-center mt-2 text-yellow-600 text-sm">
                <p>Enable overall availability to manage daily schedules</p>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center">
            <div className="text-red-500 bg-red-100 rounded-full p-1 mr-2">
              <CloseIcon className="h-5 w-5" />
            </div>
            <span className="text-red-500 text-sm font-medium">
              Not available for new jobs
            </span>
          </div>

          {/* Note when overall unavailable */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              You are currently set as unavailable. Enable overall availability
              to manage daily schedules.
            </p>
          </div>
        </div>
      );
    }
  };

  const validateTimeSlots = (weeklyPattern: any): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format

    for (const [day, dayInfo] of Object.entries(weeklyPattern)) {
      const dayData = dayInfo as any;
      if (
        dayData.available &&
        (!timeRegex.test(dayData.startTime) || !timeRegex.test(dayData.endTime))
      ) {
        console.error(`Invalid time format for ${day}:`, dayData);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!validateTimeSlots(formData.availability.weeklyPattern)) {
        toast.error(
          "Please ensure all time slots have valid time format (HH:MM)"
        );
        setSaving(false);
        return;
      }

      // Enhanced validation
      if (formData.serviceAreas.length === 0) {
        toast.error("Please select at least one service area");
        setSaving(false);
        return;
      }

      // Validate that at least one day is available
      const availableDays = Object.values(
        formData.availability.weeklyPattern
      ).filter((day: any) => day.available).length;

      if (availableDays === 0) {
        toast.error(
          "Please set at least one available day in your weekly pattern"
        );
        setSaving(false);
        return;
      }

      // Validate that at least one week is selected
      if (formData.availability.availableWeeks.length === 0) {
        toast.error("Please select at least one available week in the month");
        setSaving(false);
        return;
      }

      // Convert to the expected API format
      const updateData = {
        availability: {
          isAvailable: formData.isAvailable,
          weeklyPattern: formData.availability.weeklyPattern,
          availableWeeks: formData.availability.availableWeeks,
        },
        serviceAreas: formData.serviceAreas,
        workRadius: formData.workRadius,
      };

      const response = await TechnicianService.updateAvailability(updateData);

      if (response.success) {
        // Update local state
        if (profile) {
          setProfile({
            ...profile,
            workAreas: formData.serviceAreas,
            serviceRadiusKm: formData.workRadius,
            availability: {
              isAvailable: formData.isAvailable,
              weeklyPattern: formData.availability.weeklyPattern,
            },
          });
        }

        toast.success("Availability preferences updated successfully!");

        // Refresh the data to confirm it was saved
        await fetchProfileAndAvailability();
      } else {
        console.error("Failed to update availability:", response);
        toast.error(
          `Failed to update availability preferences: ${
            response.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error(
        "Failed to update availability preferences. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AccordionSection title="Availability & Work Preferences" number={4}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    );
  }

  return (
    <AccordionSection title="Availability & Work Preferences" number={4}>
      <div className="space-y-6">
        {/* Overall Availability Status */}
        <div>
          <h3 className="text-sm font-medium mb-3">
            Overall Availability Status
          </h3>
          {getStatusDisplay()}
        </div>

        {/* Service Areas */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Service Areas <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableServiceAreas.map((area) => (
              <div key={area} className="flex items-center">
                <input
                  type="checkbox"
                  id={`area-${area}`}
                  name={`area-${area}`}
                  checked={formData.serviceAreas.includes(area)}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <label
                  htmlFor={`area-${area}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {area}
                </label>
              </div>
            ))}
          </div>
          {formData.serviceAreas.length === 0 && (
            <p className="text-red-500 text-sm mt-1">
              Please select at least one service area
            </p>
          )}
        </div>

        {/* Work Radius */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Preferred Work Radius <span className="text-red-500">*</span>
          </label>
          <select
            name="workRadius"
            value={formData.workRadius}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select radius</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="15">15 km</option>
            <option value="20">20 km</option>
            <option value="25">25 km</option>
          </select>
        </div>

        {/* Weekly Availability Selector */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Weekly Availability Pattern <span className="text-red-500">*</span>
          </label>
          <WeeklyAvailabilitySelector
            value={formData.availability}
            onChange={handleAvailabilityChange}
          />
          <p className="text-xs text-gray-500 mt-2">
            Set your availability pattern for the coming weeks. This will
            automatically generate your available time slots using RRule.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving || formData.serviceAreas.length === 0}
            className={`px-6 py-2 rounded font-medium flex items-center ${
              saving || formData.serviceAreas.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving Changes...
              </>
            ) : formData.serviceAreas.length === 0 ? (
              "Select Service Areas to Save"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </AccordionSection>
  );
};

export default AvailabilityPreferences;
