import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import { type TechnicianProfile } from "../../../../services/common/technicianApi";
import { TechnicianService } from "../../../../services/technician/technicianService";

interface Service {
  id: string;
  name: string;
  enabled: boolean;
}

interface SkillsServicesData {
  services: string[];
  experienceYears?: number;
  skills?: string[];
  certifications?: string[];
}

const SkillsServices = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SkillsServicesData>({
    services: [],
    experienceYears: 0,
    skills: [],
    certifications: [],
  });

  // Available services without prices
  const availableServices: Service[] = [
    { id: "ac-repair", name: "AC Repair", enabled: false },
    { id: "washing-machine", name: "Washing Machine", enabled: false },
    { id: "refrigerator", name: "Refrigerator", enabled: false },
    { id: "fan-repair", name: "Fan Repair", enabled: false },
    { id: "tv-repair", name: "TV Repair", enabled: false },
    { id: "microwave", name: "Microwave Oven", enabled: false },
    { id: "water-purifier", name: "Water Purifier", enabled: false },
    { id: "geyser", name: "Geyser/Water Heater", enabled: false },
    { id: "ac-installation", name: "AC Installation", enabled: false },
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await TechnicianService.getProfile();
      if (response.success) {
        const profileData = response.data?.data?.profile;
        setProfile(profileData);

        // Populate skills and services data
        const services = profileData.services || [];
        const experienceYears = profileData.experienceYears || 0;

        setFormData({
          services,
          experienceYears,
          skills: profileData.skills || [],
          certifications: profileData.certifications || [],
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId: string, enabled: boolean) => {
    const service = availableServices.find((s) => s.id === serviceId);
    if (!service) return;

    setFormData((prev) => {
      const updatedServices = enabled
        ? [...prev.services, service.name]
        : prev.services.filter((s) => s !== service.name);

      return {
        ...prev,
        services: updatedServices,
      };
    });
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      experienceYears: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        services: formData.services,
        experienceYears: formData.experienceYears || 0, // Ensure it's always a number
        skills: formData.skills,
        certifications: formData.certifications,
      };

      const response = await TechnicianService.updateSkillsServices(updateData);

      if (response.data.success) {
        // Update local profile state with proper type safety
        if (profile) {
          setProfile({
            ...profile,
            services: updateData.services,
            experienceYears: updateData.experienceYears,
            skills: updateData.skills || [],
            certifications: updateData.certifications || [],
          });
        }
        alert("Skills and services updated successfully!");
      }
    } catch (error) {
      console.error("Error updating skills and services:", error);
      alert("Failed to update skills and services");
    } finally {
      setSaving(false);
    }
  };

  const isServiceEnabled = (serviceName: string) => {
    return formData.services.includes(serviceName);
  };

  if (loading) {
    return (
      <AccordionSection title="Skills & Services" number={3}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    );
  }

  return (
    <AccordionSection title="Skills & Services" number={3}>
      <div>
        {/* Services List */}
        <h3 className="text-sm font-medium mb-3">Services List</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the services you are qualified to provide
        </p>
        <div className="space-y-3 mb-6">
          {availableServices.map((service) => (
            <div key={service.id} className="flex items-center">
              <input
                type="checkbox"
                id={service.id}
                checked={isServiceEnabled(service.name)}
                onChange={(e) =>
                  handleServiceToggle(service.id, e.target.checked)
                }
                className="mr-3 h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor={service.id}
                className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900"
              >
                {service.name}
              </label>
            </div>
          ))}
        </div>

        {/* Selected Services Summary */}
        {formData.services.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Selected Services ({formData.services.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.services.map((service) => (
                <span
                  key={service}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {formData.services.length === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No services selected. Please select at least one service you can
              provide.
            </p>
          </div>
        )}

        {/* Years of Experience */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Years of Experience</h3>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={formData.experienceYears || 0}
              onChange={handleExperienceChange}
              placeholder="0"
              className="w-24 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              max="50"
            />
            <span className="text-sm text-gray-600 font-medium">years</span>
          </div>
          {formData.experienceYears && formData.experienceYears > 0 ? (
            <p className="text-xs text-green-600 mt-2 font-medium">
              ✓ {formData.experienceYears} years of professional experience
            </p>
          ) : (
            <p className="text-xs text-gray-500 mt-2">
              Enter your total years of professional experience
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving || formData.services.length === 0}
            className={`px-6 py-2 rounded font-medium flex items-center ${
              saving || formData.services.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
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

export default SkillsServices;
