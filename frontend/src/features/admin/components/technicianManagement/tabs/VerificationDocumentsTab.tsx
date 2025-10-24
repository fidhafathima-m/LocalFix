import React from "react";
import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";

interface VerificationDocumentsTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

interface DocumentData {
  type: string;
  url?: string;
  verified?: boolean;
  uploadedAt?: string;
  [key: string]: unknown;
}

const VerificationDocumentsTab: React.FC<VerificationDocumentsTabProps> = ({
  technician,
  isSuspended,
}) => {
  // Fix: Handle both array and object formats for documents
  const getDocuments = (): DocumentData[] => {
    if (!technician.documents) return [];
    
    // If it's already an array, return it
    if (Array.isArray(technician.documents)) {
      return technician.documents;
    }
    
    // If it's an object, convert to array
    if (typeof technician.documents === 'object') {
      return Object.entries(technician.documents).map(([key, value]) => ({
        type: key,
        ...(value)
      }));
    }
    
    return [];
  };

  const documentNames: Record<string, string> = {
    aadhaarCard: "Aadhaar Card",
    panCard: "PAN Card",
    drivingLicense: "Driving License",
    profilePhoto: "Profile Photo",
    passportPhoto: "Passport Photo",
    idProof: "ID Proof Document",
    addressProof: "Address Proof Document",
    policeVerification: "Police Verification",
    certificate: "Professional Certificate",
  };

  const getDisplayName = (type: string): string => {
    return documentNames[type] ||
      type
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
  };

  const documents = getDocuments();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> Document verification status is view-only
            while technician is suspended.
          </p>
        </div>
      )}
      <h2 className="text-lg font-medium mb-6">Verification & Documents</h2>
      <div className="space-y-6">
        {/* Show all available documents dynamically */}
        {documents.length > 0 ? (
          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">All Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, index) => {
                const displayName = getDisplayName(doc.type);

                return (
                  <div
                    key={doc.type || index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium mb-2">{displayName}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </a>
                        )}
                      </div>
                      {doc.uploadedAt && (
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No documents uploaded yet.</p>
          </div>
        )}

        {/* Verification Status */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Overall Verification Status</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Account Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  technician.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : technician.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {technician.status.charAt(0).toUpperCase() +
                  technician.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDocumentsTab;