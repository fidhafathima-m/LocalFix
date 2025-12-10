import React, { useState, useEffect } from "react";
import { EditOutlined } from "@mui/icons-material";
import type { PersonalInfo } from "./types";
import { validatePersonalInfo } from "../../../../../validation";

interface PersonalInfoSectionProps {
  personalInfo: PersonalInfo;
  isEditing: boolean;
  onEditStart: () => void;
  onSave: (info: PersonalInfo) => Promise<void>;
  onCancel: () => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  personalInfo,
  isEditing,
  onEditStart,
  onSave,
  onCancel,
}) => {
  const [tempInfo, setTempInfo] = useState<PersonalInfo>({
    ...personalInfo,
    dateOfBirth:
      personalInfo.dateOfBirth === "Not set" ? "" : personalInfo.dateOfBirth,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset temp info when editing starts
  useEffect(() => {
    if (isEditing) {
      setTempInfo({
        ...personalInfo,
        dateOfBirth:
          personalInfo.dateOfBirth === "Not set"
            ? ""
            : personalInfo.dateOfBirth,
      });
      setErrors({});
    }
  }, [isEditing, personalInfo]);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    setTempInfo((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers and limit to 10 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 10);
    handleChange("phoneNumber", numericValue);
  };

  const handleNameChange = (value: string) => {
    // Prevent numbers and special characters (except allowed ones)
    const filteredValue = value.replace(/[^A-Za-z\s\-'.]/g, "");
    handleChange("fullName", filteredValue);
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    // Prepare data for validation
    const dataToValidate = {
      ...tempInfo,
      dateOfBirth: tempInfo.dateOfBirth || "Not set",
    };

    // Use Zod validation
    const validation = validatePersonalInfo(dataToValidate);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave(validation.data as PersonalInfo);
      setErrors({});
    } catch (error) {
      // Handle save error
      setErrors({
        _error:
          error instanceof Error ? error.message : "Failed to save changes",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTempInfo({
      ...personalInfo,
      dateOfBirth:
        personalInfo.dateOfBirth === "Not set" ? "" : personalInfo.dateOfBirth,
    });
    setErrors({});
    onCancel();
  };

  // Format date for input field
  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString === "Not set") return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Calculate max and min dates for date picker
  const getMaxDate = () => {
    const today = new Date();
    return new Date(today.getFullYear() - 15, today.getMonth(), today.getDate())
      .toISOString()
      .split("T")[0];
  };

  const getMinDate = () => {
    const today = new Date();
    return new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .split("T")[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={onEditStart}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            disabled={isSubmitting}
          >
            <EditOutlined className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
        )}
      </div>

      {errors._error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{errors._error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={tempInfo.fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="John Doe"
                maxLength={100}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>
          ) : (
            <p className="font-medium">{personalInfo.fullName}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <div>
              <input
                type="tel"
                value={tempInfo.phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="1234567890"
                maxLength={10}
                pattern="[0-9]{10}"
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                10 digits without spaces or dashes
              </p>
            </div>
          ) : (
            <p className="font-medium">
              {personalInfo.phoneNumber.replace(
                /(\d{3})(\d{3})(\d{4})/,
                "($1) $2-$3"
              )}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          {isEditing ? (
            <div>
              <input
                type="email"
                value={tempInfo.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="john.doe@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          ) : (
            <p className="font-medium">
              {personalInfo.email || "Not provided"}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Date of Birth
          </label>
          {isEditing ? (
            <div>
              <input
                type="date"
                value={formatDateForInput(tempInfo.dateOfBirth)}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Must be between 15 and 100 years old
              </p>
            </div>
          ) : (
            <p className="font-medium">
              {personalInfo.dateOfBirth === "Not set"
                ? "Not set"
                : new Date(personalInfo.dateOfBirth).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Gender</label>
          {isEditing ? (
            <div>
              <select
                value={tempInfo.gender || ""}
                onChange={(e) => handleChange("gender", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.gender ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
                <option value="Not specified">Not specified</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
              )}
            </div>
          ) : (
            <p className="font-medium">
              {personalInfo.gender || "Not specified"}
            </p>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}
    </div>
  );
};
