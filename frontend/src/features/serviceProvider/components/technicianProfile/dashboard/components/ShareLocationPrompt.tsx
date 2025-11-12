import React from "react";
import { LocationOn, Close } from "@mui/icons-material";

interface ShareLocationPromptProps {
  onShareLocation: () => void;
  onSkip: () => void;
  technicianName: string;
}

const ShareLocationPrompt: React.FC<ShareLocationPromptProps> = ({
  onShareLocation,
  onSkip,
  technicianName,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <LocationOn className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Share Your Location</h3>
            <p className="text-gray-600 text-sm">
              Let {technicianName} track your arrival
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-700">
              Customer will see your real-time location on map
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-700">
              They can track your estimated arrival time
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-700">
              Location sharing stops automatically when you arrive
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Close className="w-4 h-4" />
            Skip
          </button>
          <button
            onClick={onShareLocation}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <LocationOn className="w-4 h-4" />
            Share Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareLocationPrompt;