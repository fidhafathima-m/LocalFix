/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { type TechnicianProfile } from "../../../../services/common/technicianApi";
import { TechnicianService } from "../../../../services/technician/technicianService";
import {
  MonthlyAvailabilitySelector,
  type MonthlyAvailability,
} from "../AvailabilitySelector";
import toast from "react-hot-toast";

interface AvailabilityData {
  isAvailable: boolean;
  serviceAreas: string[];
  workRadius: number;
  availability: MonthlyAvailability;
}

const AvailabilityPreferences = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AvailabilityData>({
    isAvailable: true,
    serviceAreas: [],
    workRadius: 10,
    availability: {
      duration: {
        months: 3,
        startDate: new Date(),
      },
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

        console.log("📊 Full profile data:", profileData);

        // Try to fetch REAL availability data
        let availabilityData = [];
        let slotRulesData = [];

        try {
          // Fetch actual availability records
          const availabilityResponse =
            await TechnicianService.getTechnicianAvailability();
          if (availabilityResponse.success) {
            availabilityData = availabilityResponse.data?.availability || [];
            console.log("📅 Real availability data:", availabilityData);
          }
        } catch (availabilityError) {
          console.log("ℹ️ No availability data available", availabilityError);
        }

        try {
          // Fetch slot rules data
          const slotRulesResponse = await TechnicianService.getSlotRules();
          if (slotRulesResponse.success) {
            slotRulesData = slotRulesResponse.data?.slotRules || [];
            console.log("📅 Slot rules data:", slotRulesData);
          }
        } catch (slotError) {
          console.log("ℹ️ No slot rules data available", slotError);
        }

        // Enhanced debug section
        console.log("=== DEBUG: Real Availability Data ===");
        console.log("1. Availability records:", availabilityData);
        console.log("2. Slot rules:", slotRulesData);
        console.log("3. Work areas:", profileData.workAreas);
        console.log("4. Service radius:", profileData.serviceRadiusKm);
        console.log("=== END DEBUG ===");

        // Combine all data
        const combinedData = {
          ...profileData,
          availabilityRecords: availabilityData,
          slotRules: slotRulesData,
        };

        // Extract availability data from combined data
        const extractedAvailabilityData =
          extractAvailabilityFromProfile(combinedData);
        console.log(
          "🎯 Extracted availability data:",
          extractedAvailabilityData
        );

        setFormData(extractedAvailabilityData);
      }
    } catch (error) {
      console.error("Error fetching profile and availability:", error);
    } finally {
      setLoading(false);
    }
  };
  const extractAvailabilityFromProfile = (
  profileData: any
): AvailabilityData => {
  console.log("🔍 Extracting availability from profile:", profileData);

  let serviceAreas: string[] = [];
  let workRadius = 10;
  let isAvailable = true;
  let availableWeeks = [1, 2, 3, 4]; // Default

  // Try multiple sources for service areas
  if (profileData.workAreas && profileData.workAreas.length > 0) {
    serviceAreas = profileData.workAreas;
    console.log("📋 Using workAreas from profile:", serviceAreas);
  } 
  else if (profileData.availabilityPreferences?.serviceAreas) {
    serviceAreas = profileData.availabilityPreferences.serviceAreas;
    console.log("📋 Using serviceAreas from availabilityPreferences:", serviceAreas);
  }
  else if (profileData.serviceAreas) {
    serviceAreas = profileData.serviceAreas;
    console.log("📋 Using serviceAreas from profile:", serviceAreas);
  }

  // Get work radius
  if (profileData.serviceRadiusKm) {
    workRadius = profileData.serviceRadiusKm;
  } else if (profileData.availabilityPreferences?.workRadius) {
    workRadius = profileData.availabilityPreferences.workRadius;
  }

  // Get availability status
  isAvailable = profileData.isAvailable !== false && 
                profileData.availabilityPreferences?.isAvailable !== false;

  // ✅ FIXED: Extract available weeks from slot rules
  if (profileData.slotRules && profileData.slotRules.length > 0) {
    const extractedWeeks = extractAvailableWeeksFromSlotRules(profileData.slotRules);
    if (extractedWeeks.length > 0) {
      availableWeeks = extractedWeeks;
      console.log("📅 Extracted available weeks from slot rules:", availableWeeks);
    }
  }

  // Get the weekly pattern
  const weeklyPattern = getWeeklyPatternFromProfile(profileData);
  console.log("📅 Final weekly pattern:", weeklyPattern);

  const monthlyAvailability: MonthlyAvailability = {
    duration: {
      months: 3,
      startDate: new Date(),
    },
    availableWeeks: availableWeeks, // ✅ Use extracted weeks
    weeklyPattern: weeklyPattern,
  };

  const result = {
    isAvailable,
    serviceAreas: serviceAreas,
    workRadius: workRadius,
    availability: monthlyAvailability,
  };

  console.log("🎯 Final extracted availability data:", result);
  return result;
};

// ✅ ADD THIS HELPER FUNCTION to extract available weeks from slot rules
const extractAvailableWeeksFromSlotRules = (slotRules: any[]): number[] => {
  const weeks = new Set<number>();
  
  slotRules.forEach(rule => {
    if (rule.rruleString) {
      // Parse RRULE to extract week numbers (e.g., "1MO" means 1st Monday)
      const weekMatches = rule.rruleString.matchAll(/(\d+)(MO|TU|WE|TH|FR|SA|SU)/g);
      
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
    console.log("🔍 Full profile data for availability:", profileData);

    // 1. First try to extract pattern from actual availability records
    if (
      profileData.availabilityRecords &&
      profileData.availabilityRecords.length > 0
    ) {
      console.log("✅ Found real availability records, extracting pattern");
      return extractWeeklyPatternFromAvailabilityRecords(
        profileData.availabilityRecords
      );
    }

    // 2. Check if we have slot rules that we can convert
    if (profileData.slotRules && profileData.slotRules.length > 0) {
      console.log("🔄 Converting slot rules to weekly pattern");
      return convertSlotRulesToWeeklyPattern(profileData.slotRules);
    }

    // 3. Check if we have direct availability data from the application form format
    if (profileData.availability?.weeklyPattern) {
      console.log(
        "✅ Found weekly pattern in profile.availability.weeklyPattern"
      );
      return profileData.availability.weeklyPattern;
    }

    // 4. Check availability.weeklyAvailability (converted format)
    if (profileData.availability?.weeklyAvailability) {
      console.log(
        "✅ Found weekly pattern in profile.availability.weeklyAvailability"
      );
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
      console.log(
        "🔍 Setting default weekday availability for active technician with work areas"
      );
      return getDefaultWeekdayAvailability();
    }

    // 6. Default pattern (all days unavailable)
    console.log(
      "❌ No weekly pattern found, using default unavailable pattern"
    );
    return getDefaultWeeklyPattern();
  };

  // NEW FUNCTION: Extract weekly pattern from real availability records
  const extractWeeklyPatternFromAvailabilityRecords = (
    availabilityRecords: any[]
  ): any => {
    const weeklyPattern = getDefaultWeeklyPattern();

    if (!availabilityRecords || availabilityRecords.length === 0) {
      return weeklyPattern;
    }

    console.log(
      "🔄 Analyzing availability records to determine weekly pattern"
    );

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
        console.log(
          `✅ ${day}: available ${dayAnalysis[day].startTime} - ${dayAnalysis[day].endTime}`
        );
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

    console.log("✅ Set default weekday availability: Mon-Fri 9AM-6PM");
    return weeklyPattern;
  };
  // Enhanced function to convert slot rules to weekly pattern
  // Enhanced function to convert slot rules to weekly pattern
const convertSlotRulesToWeeklyPattern = (slotRules: any[]): any => {
  const weeklyPattern = getDefaultWeeklyPattern();

  if (!slotRules || slotRules.length === 0) return weeklyPattern;

  console.log("🔄 Converting slot rules:", slotRules);

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
            const cleanDayCode = dayCode.replace(/^\d+/, ''); // Remove leading numbers
            const dayName = dayMap[cleanDayCode];
            
            if (dayName && weeklyPattern[dayName]) {
              weeklyPattern[dayName] = {
                available: true,
                startTime: rule.startTime || "09:00",
                endTime: rule.endTime || "18:00",
              };
              console.log(
                `✅ Set ${dayName} as available: ${rule.startTime} - ${rule.endTime}`
              );
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

  const handleAvailabilityChange = (newAvailability: MonthlyAvailability) => {
    setFormData((prev) => ({
      ...prev,
      availability: newAvailability,
    }));
  };

  const handleAvailabilityToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isAvailable: checked,
    }));
  };

  const getStatusDisplay = () => {
    if (formData.isAvailable) {
      return (
        <div className="flex items-start">
          <div className="text-green-500 bg-green-100 rounded-full p-1 mr-2">
            <CheckOutlinedIcon className="h-5 w-5" />
          </div>
          <span className="text-green-500 text-sm font-medium">
            Available for new jobs
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-start">
          <div className="text-red-500 bg-red-100 rounded-full p-1 mr-2">
            <CheckOutlinedIcon className="h-5 w-5" />
          </div>
          <span className="text-red-500 text-sm font-medium">
            Not available for new jobs
          </span>
        </div>
      );
    }
  };

  const handleSave = async () => {
  try {
    setSaving(true);

    // Convert the availability format to match the expected API structure
    const convertedWeeklyAvailability: { [key: string]: { enabled: boolean; startTime: string; endTime: string } } = {};
    
    Object.entries(formData.availability.weeklyPattern).forEach(([day, dayInfo]) => {
      convertedWeeklyAvailability[day] = {
        enabled: dayInfo.available,
        startTime: dayInfo.startTime,
        endTime: dayInfo.endTime,
      };
    });

    // ✅ FIXED: Use the correct structure that matches TechnicianService expectations
    const updateData = {
      availability: {
        isAvailable: formData.isAvailable,
        weeklyAvailability: convertedWeeklyAvailability,
      },
      availableWeeks: formData.availability.availableWeeks, // At root level
      serviceAreas: formData.serviceAreas, // Use serviceAreas instead of workAreas
      workRadius: formData.workRadius, // Use workRadius instead of serviceRadiusKm
    };

    console.log('💾 SENDING to backend (CORRECTED STRUCTURE):', updateData);

    // Enhanced validation
    if (formData.serviceAreas.length === 0) {
      toast.error("Please select at least one service area");
      setSaving(false);
      return;
    }

    // Validate that at least one day is available
    const availableDays = Object.values(formData.availability.weeklyPattern).filter(
      (day: any) => day.available
    ).length;
    
    if (availableDays === 0) {
      toast.error("Please set at least one available day in your weekly pattern");
      setSaving(false);
      return;
    }

    // Validate that at least one week is selected
    if (formData.availability.availableWeeks.length === 0) {
      toast.error("Please select at least one available week in the month");
      setSaving(false);
      return;
    }

    const response = await TechnicianService.updateAvailability(updateData);

    console.log('📩 Save response:', response);

    if (response.success) {
      console.log('✅ Save successful, updated profile:', response.data?.profile);
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          workAreas: formData.serviceAreas,
          serviceRadiusKm: formData.workRadius,
          availability: {
            isAvailable: formData.isAvailable,
            weeklyAvailability: convertedWeeklyAvailability,
          },
        });
      }
      
      // Show success message
      toast.success("Availability preferences updated successfully!");
      
      // Refresh the data to confirm it was saved
      await fetchProfileAndAvailability();
      
    } else {
      console.error("❌ Failed to update availability:", response);
      toast.error(`Failed to update availability preferences: ${response.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error("❌ Error updating availability:", error);
    toast.error("Failed to update availability preferences. Please try again.");
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
        {/* Debug info - remove in production */}
        <div className="bg-gray-100 p-3 rounded text-xs">
          <strong>Debug Info:</strong>
          Service Areas: {formData.serviceAreas.length} | Work Radius:{" "}
          {formData.workRadius}km | Available Days:{" "}
          {
            Object.values(formData.availability.weeklyPattern).filter(
              (day: any) => day.available
            ).length
          }
        </div>

        {/* Overall Availability Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Overall Availability Status</h3>
          <label className="relative inline-block w-12 h-6 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              className="opacity-0 w-0 h-0"
              checked={formData.isAvailable}
              onChange={(e) => handleAvailabilityToggle(e.target.checked)}
            />
            <span
              className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                formData.isAvailable ? "bg-green-500" : "bg-gray-300"
              }`}
            ></span>
            <span
              className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform ${
                formData.isAvailable
                  ? "transform translate-x-6"
                  : "transform translate-x-0"
              }`}
            ></span>
          </label>
        </div>

        {getStatusDisplay()}

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

        {/* Monthly Availability Selector */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Monthly Availability Pattern <span className="text-red-500">*</span>
          </label>
          <MonthlyAvailabilitySelector
            value={formData.availability}
            onChange={handleAvailabilityChange}
          />
          <p className="text-xs text-gray-500 mt-2">
            Set your availability pattern for the coming months. This will
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
