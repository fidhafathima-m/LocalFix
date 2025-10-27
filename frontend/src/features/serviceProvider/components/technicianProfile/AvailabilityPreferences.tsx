import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import { type TechnicianProfile } from "../../../../services/common/technicianApi";
import { TechnicianService } from "../../../../services/technician/technicianService";

interface WeeklyAvailability {
  [key: string]: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface AvailabilityData {
  isAvailable: boolean;
  serviceAreas: string[];
  workRadius: number;
  weeklyAvailability: WeeklyAvailability;
}

const AvailabilityPreferences = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AvailabilityData>({
    isAvailable: true,
    serviceAreas: [],
    workRadius: 10,
    weeklyAvailability: {
      monday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      thursday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      friday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      saturday: { enabled: true, startTime: "09:00", endTime: "18:00" },
      sunday: { enabled: false, startTime: "09:00", endTime: "18:00" },
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
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await TechnicianService.getProfile();
      if (response.success) {
        const profileData =
          response.data?.data?.profile ||
          response.data?.profile ||
          response.data?.data;
        setProfile(profileData);

        // Populate availability data from profile
        const workAreas = profileData.workAreas || [];
        const serviceRadiusKm = profileData.serviceRadiusKm || 10;

        // Get availability from profile or use defaults
        let weeklyAvailability = formData.weeklyAvailability;

        if (profileData.availability) {
          // Handle both string and object formats for availability
          let availabilityData = profileData.availability;
          if (typeof availabilityData === "string") {
            try {
              availabilityData = JSON.parse(availabilityData);
            } catch (e) {
              console.error("Error parsing availability:", e);
            }
          }

          if (availabilityData.weeklyAvailability) {
            weeklyAvailability = {
              ...formData.weeklyAvailability,
              ...availabilityData.weeklyAvailability,
            };
          }
        }

        setFormData({
          isAvailable: profileData.isAvailable !== false,
          serviceAreas: workAreas,
          workRadius: serviceRadiusKm,
          weeklyAvailability: weeklyAvailability,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
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
      } else if (name.startsWith("available-")) {
        const day = name.replace("available-", "");
        setFormData((prev) => ({
          ...prev,
          weeklyAvailability: {
            ...prev.weeklyAvailability,
            [day]: {
              ...prev.weeklyAvailability[day],
              enabled: checked,
            },
          },
        }));
      } else if (name === "isAvailable") {
        setFormData((prev) => ({
          ...prev,
          isAvailable: checked,
        }));
      }
    } else {
      if (name.includes("-Time-")) {
        const [timeType, day] = name.split("-Time-");
        setFormData((prev) => ({
          ...prev,
          weeklyAvailability: {
            ...prev.weeklyAvailability,
            [day]: {
              ...prev.weeklyAvailability[day],
              [timeType === "start" ? "startTime" : "endTime"]: value,
            },
          },
        }));
      } else if (name === "workRadius") {
        setFormData((prev) => ({
          ...prev,
          workRadius: parseInt(value) || 10,
        }));
      }
    }
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

      const updateData = {
        availability: {
          isAvailable: formData.isAvailable,
          weeklyAvailability: formData.weeklyAvailability,
        },
        workAreas: formData.serviceAreas,
        serviceRadiusKm: formData.workRadius,
      };

      const response = await TechnicianService.updateAvailability(updateData);

      if (response.data.success) {
        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            workAreas: formData.serviceAreas,
            serviceRadiusKm: formData.workRadius,
            availability: {
              isAvailable: formData.isAvailable,
              weeklyAvailability: formData.weeklyAvailability,
            },
          });
        }
        alert("Availability preferences updated successfully!");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability preferences");
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

        {/* Service Areas - Matching Application Form Style */}
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

        {/* Work Radius - Matching Application Form Style */}
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

        {/* Weekly Availability - Matching Application Form Style */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Availability <span className="text-red-500">*</span>
          </label>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(formData.weeklyAvailability)
                  .filter(([day]) => {
                    // Only include the 7 days of the week
                    const validDays = [
                      "monday",
                      "tuesday",
                      "wednesday",
                      "thursday",
                      "friday",
                      "saturday",
                      "sunday",
                    ];
                    return validDays.includes(day.toLowerCase());
                  })
                  .map(([day, { enabled, startTime, endTime }]) => (
                    <tr key={day}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {day}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          id={`available-${day}`}
                          name={`available-${day}`}
                          checked={enabled}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-blue-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          name={`start-Time-${day}`}
                          value={startTime}
                          onChange={handleInputChange}
                          disabled={!enabled}
                          className={`px-2 py-1 border border-gray-300 rounded-md ${
                            !enabled ? "bg-gray-100 text-gray-400" : ""
                          }`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          name={`end-Time-${day}`}
                          value={endTime}
                          onChange={handleInputChange}
                          disabled={!enabled}
                          className={`px-2 py-1 border border-gray-300 rounded-md ${
                            !enabled ? "bg-gray-100 text-gray-400" : ""
                          }`}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Select the days and times you are available to work
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
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
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
