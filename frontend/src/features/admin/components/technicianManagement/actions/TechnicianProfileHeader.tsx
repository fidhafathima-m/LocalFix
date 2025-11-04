import React from "react";
import { Link } from "react-router-dom";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
interface TechnicianProfileHeaderProps {
  name: string;
  technicianId: string;
  joinDate: string;
  isActive: boolean;
  isApproved: boolean;
  isRejected?: boolean;
  isSuspended?: boolean;
  rating?: number;
  jobsCompleted?: number;
  totalEarnings?: number;
  activeBookings?: number;
  profilePictureUrl?: string;
}
export const TechnicianProfileHeader: React.FC<
  TechnicianProfileHeaderProps
> = ({
  name,
  technicianId,
  joinDate,
  rating = 0,
  jobsCompleted = 0,
  totalEarnings = 0,
  activeBookings = 0,
  profilePictureUrl,
  isRejected,
  isApproved,
  isActive,
  isSuspended,
}) => {
  const getStatusBadge = () => {
    if (isRejected) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          Rejected
        </span>
      );
    }
    if (isSuspended) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
          Suspended
        </span>
      );
    }
    if (isApproved) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          {isActive ? "Active" : "InActive"}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
        Pending
      </span>
    );
  };

  return (
    <div className="bg-white p-6 border-b border-gray-200">
      <div className="mb-6">
        <Link
          to="/admin/technician-management"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeftOutlinedIcon />
          <span className="ml-1">Back to Technicians</span>
        </Link>
      </div>
      <div className="flex items-center">
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={name}
            className="h-16 w-16 rounded-full object-cover mr-4 border border-gray-300"
          />
        ) : (
          <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mr-4 border border-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
        <div>
          <h1 className="text-xl font-medium">
            {name}
            {isSuspended && " (Suspended)"}
          </h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span>Technician ID: {technicianId}</span>
            <span className="mx-2">|</span>
            <span>Joined: {joinDate}</span>
            <div className="flex items-center space-x-2 mt-1 ml-3">
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-8 mt-8">
        <div className="flex items-center">
          <div className="mr-3 text-yellow-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rating</p>
            <p className="font-medium">{rating}/5.0</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-3 text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jobs Completed</p>
            <p className="font-medium">{jobsCompleted}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-3 text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="font-medium">₹{totalEarnings}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-3 text-purple-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Bookings</p>
            <p className="font-medium">{activeBookings}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
