import React from "react";
import { BlockOutlined } from "@mui/icons-material";

interface DisabledOverlayProps {
  children: React.ReactNode;
  tab: string;
  isSuspended: boolean;
}

const DisabledOverlay: React.FC<DisabledOverlayProps> = ({ 
  children, 
  tab, 
  isSuspended 
}) => {
  if (!isSuspended || tab === "profile") return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
        <div className="text-center p-6">
          <BlockOutlined className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Feature Unavailable
          </h3>
          <p className="text-gray-500 mb-4">
            This feature is temporarily disabled due to account suspension.
          </p>
          <p className="text-gray-400 text-sm">
            Please contact support to resolve this issue.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisabledOverlay;