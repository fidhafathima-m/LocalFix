import React, { useState } from "react";
import { EditOutlined } from "@mui/icons-material";
import type { PersonalInfo } from "./types";

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
  const [tempInfo, setTempInfo] = useState(personalInfo);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);

    // Validate required fields
    if (!tempInfo.fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!tempInfo.phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(tempInfo.phoneNumber.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Validate email format if provided
    if (tempInfo.email && !/\S+@\S+\.\S+/.test(tempInfo.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate gender if provided
    if (
      tempInfo.gender &&
      !["Male", "Female", "Other", "Prefer not to say"].includes(
        tempInfo.gender
      )
    ) {
      setError("Please select a valid gender");
      return;
    }

    // Validate date of birth if provided
    if (tempInfo.dateOfBirth && tempInfo.dateOfBirth !== "Not set") {
      const dob = new Date(tempInfo.dateOfBirth);
      const today = new Date();
      const minDate = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate()
      );
      const maxDate = new Date(
        today.getFullYear() - 15,
        today.getMonth(),
        today.getDate()
      );

      if (dob < minDate) {
        setError("Please enter a valid date of birth");
        return;
      }

      if (dob > maxDate) {
        setError("You must be at least 15 years old");
        return;
      }
    }

    await onSave(tempInfo);
  };

  const handleCancel = () => {
    setTempInfo(personalInfo);
    setError(null);
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={onEditStart}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
          >
            <EditOutlined className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={tempInfo.fullName}
              onChange={(e) =>
                setTempInfo({ ...tempInfo, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="font-medium">{personalInfo.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Phone Number
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={tempInfo.phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setTempInfo({ ...tempInfo, phoneNumber: value });
              }}
              pattern="[0-9]{10}"
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter 10-digit phone number"
            />
          ) : (
            <p className="font-medium">{personalInfo.phoneNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          {isEditing ? (
            <input
              type="email"
              value={tempInfo.email}
              onChange={(e) =>
                setTempInfo({ ...tempInfo, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          ) : (
            <p className="font-medium">{personalInfo.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Date of Birth
          </label>
          {isEditing ? (
            <input
              type="date"
              value={tempInfo.dateOfBirth}
              onChange={(e) =>
                setTempInfo({ ...tempInfo, dateOfBirth: e.target.value })
              }
              min={
                new Date(new Date().getFullYear() - 100, 0, 1)
                  .toISOString()
                  .split("T")[0]
              }
              max={
                new Date(
                  new Date().getFullYear() - 15,
                  new Date().getMonth(),
                  new Date().getDate()
                )
                  .toISOString()
                  .split("T")[0]
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <p className="font-medium">
              {personalInfo.dateOfBirth === "Not set"
                ? "Not set"
                : new Date(personalInfo.dateOfBirth).toLocaleDateString()}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Gender</label>
          {isEditing ? (
            <select
              value={tempInfo.gender}
              onChange={(e) =>
                setTempInfo({ ...tempInfo, gender: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
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
            className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};
