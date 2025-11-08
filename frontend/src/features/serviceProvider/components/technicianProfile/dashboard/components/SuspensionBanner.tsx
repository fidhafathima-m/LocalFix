import React from "react";
import { BlockOutlined } from "@mui/icons-material";

interface SuspensionBannerProps {
  suspensionInfo: {
    reason?: string;
    suspendedAt?: string;
  };
}

const SuspensionBanner: React.FC<SuspensionBannerProps> = ({ suspensionInfo }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime())
        ? date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Not specified";
    } catch {
      return "Not specified";
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <BlockOutlined className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium text-sm">Account Suspended</h3>
          <p className="text-red-700 text-sm mt-1">
            Your technician account has been suspended by the administrator.
          </p>
          {suspensionInfo.reason && (
            <div className="mt-2">
              <p className="text-red-600 text-xs font-medium">Reason:</p>
              <p className="text-red-600 text-xs mt-1">{suspensionInfo.reason}</p>
            </div>
          )}
          {suspensionInfo.suspendedAt && (
            <p className="text-red-600 text-xs mt-2">
              Suspended on: {formatDate(suspensionInfo.suspendedAt)}
            </p>
          )}
          <div className="mt-3">
            <p className="text-red-600 text-xs">
              <strong>What this means:</strong>
            </p>
            <ul className="text-red-600 text-xs list-disc list-inside mt-1 space-y-1">
              <li>You cannot accept new orders</li>
              <li>Your profile is not visible to customers</li>
              <li>You cannot access earnings or order features</li>
              <li>You can still view your profile and contact support</li>
            </ul>
          </div>
          <div className="mt-3">
            <button className="bg-red-600 text-white px-4 py-2 rounded text-xs font-medium hover:bg-red-700 mr-2">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspensionBanner;