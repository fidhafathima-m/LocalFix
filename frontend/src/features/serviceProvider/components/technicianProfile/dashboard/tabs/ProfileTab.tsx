import React from "react";
import { WarningOutlined, FmdGoodOutlined } from "@mui/icons-material";
import type { ProfileTabProps } from "../types";
import { formatDate, getLanguagesArray, getLocation } from "../utils/helpers";

const ProfileTab: React.FC<ProfileTabProps> = ({
  dashboardData,
  isSuspended,
  navigate,
}) => {
  const { profile } = dashboardData;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Profile Information</h3>
        {!isSuspended && (
          <button
            className="text-blue-600 text-sm font-medium hover:text-blue-700 cursor-pointer"
            onClick={() => navigate("/technician/profile")}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Account Status Warning for suspended technicians */}
      {isSuspended && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <WarningOutlined className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-yellow-800 font-medium text-sm">
                Profile Editing Disabled
              </h4>
              <p className="text-yellow-700 text-sm">
                You cannot edit your profile while your account is suspended.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bio Section */}
      {profile.bio && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">About Me</h4>
          <p className="text-gray-600 text-sm">{profile.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Personal Details</h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Full Name</dt>
              <dd className="text-sm font-medium">
                {profile.personalInfo?.fullName || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Phone</dt>
              <dd className="text-sm font-medium">
                {profile.personalInfo?.phoneNumber || profile.phone || "Not provided"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Gender</dt>
              <dd className="text-sm font-medium">
                {profile.personalInfo?.gender || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Date of Birth</dt>
              <dd className="text-sm font-medium">
                {formatDate(profile.personalInfo?.dateOfBirth || "")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Languages</dt>
              <dd className="text-sm font-medium">
                {(() => {
                  const languagesArray = getLanguagesArray(
                    profile.personalInfo?.languages
                  );
                  return languagesArray.length > 0
                    ? languagesArray.join(", ")
                    : "Not specified";
                })()}
              </dd>
            </div>
          </dl>
        </div>

        {/* Professional Details */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Professional Details</h4>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Experience</dt>
              <dd className="text-sm font-medium">
                {profile.experienceYears} years
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Services</dt>
              <dd className="text-sm font-medium">
                {profile.services && profile.services.length > 0
                  ? profile.services.join(", ")
                  : "No services specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Work Areas</dt>
              <dd className="text-sm font-medium">
                {profile.workAreas && profile.workAreas.length > 0
                  ? profile.workAreas.join(", ")
                  : "No work areas specified"}
              </dd>
            </div>
            {/* <div>
              <dt className="text-sm text-gray-500">Rating</dt>
              <dd className="text-sm font-medium">
                {profile.averageRating.toFixed(1)} ({profile.ratingCount} reviews)
              </dd>
            </div> */}
            <div>
              <dt className="text-sm text-gray-500">Location</dt>
              <dd className="text-sm font-medium flex items-center">
                <FmdGoodOutlined className="h-3 w-3 mr-1 text-gray-400" />
                {getLocation(profile)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Address Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Street</dt>
            <dd className="text-sm font-medium">
              {profile.personalInfo?.address?.street || "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">City</dt>
            <dd className="text-sm font-medium">
              {profile.personalInfo?.address?.city || "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">State</dt>
            <dd className="text-sm font-medium">
              {profile.personalInfo?.address?.state || "Not specified"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Pincode</dt>
            <dd className="text-sm font-medium">
              {profile.personalInfo?.address?.pincode || "Not specified"}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;