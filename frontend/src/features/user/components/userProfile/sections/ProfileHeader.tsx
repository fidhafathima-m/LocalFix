import React, { useRef } from "react";
import {
  CameraAltOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import type { UserData } from "./types";

interface ProfileHeaderProps {
  userData: UserData | null;
  personalInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  onProfilePictureChange: (file: File) => Promise<void>;
  uploadingPhoto: boolean;
  onNavigateToMessage: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userData,
  personalInfo,
  onProfilePictureChange,
  uploadingPhoto,
  onNavigateToMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await onProfilePictureChange(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={
                userData?.profilePicture ||
                "https://imgs.search.brave.com/rwE-hC6ESt3hBJZhImPkb-KvU26bLDKVe-OKv1y50-M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzE0LzQz/LzU1LzE0NDM1NWQ3/YjM2YzVmNjQ2NDM1/NDIzNzk4MjgxY2U5/LmpwZw"
              }
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover profile-picture"
            />
            <button
              onClick={handleProfilePictureClick}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {uploadingPhoto ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CameraAltOutlined className="w-4 h-4" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">{personalInfo.fullName}</h2>
            <p className="text-sm text-gray-600">{personalInfo.phoneNumber}</p>
            <p className="text-sm text-green-600 flex items-center mt-1">
              <CheckCircleOutlineOutlined className="w-4 h-4 mr-1" />
              {userData?.isVerified ? "Verified" : "Not Verified"}
            </p>
            <p className="text-sm text-gray-600">{personalInfo.email}</p>
          </div>
        </div>
        <button
          onClick={onNavigateToMessage}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Messages
        </button>
      </div>
    </div>
  );
};
