/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import {
  DescriptionOutlined,
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  AccessTimeOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { TechnicianService } from "../../../../../services/technician/technicianService";

interface DocumentData {
  _id: string;
  type: string;
  fileName: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
  status: "pending" | "approved" | "rejected";
  verifiedAt?: string;
}

const DocumentsVerification = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchTechnicianDocuments();
  }, []);

  const fetchTechnicianDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await TechnicianService.getProfile();

      // Check EVERY possible location for documents
      let documents = [];

      // Check all possible paths
      const possibleDocumentPaths = [
        profileResponse.data?.profile?.documents,
        profileResponse.data?.data?.profile?.documents,
        profileResponse.profile?.documents,
        profileResponse.data?.documents,
        profileResponse.documents,
        profileResponse.data?.data?.documents,
      ];

      for (const path of possibleDocumentPaths) {
        if (path && Array.isArray(path)) {
          documents = path;
          break;
        }
      }

      if (documents && Array.isArray(documents) && documents.length > 0) {
        const formattedDocs = convertTechnicianDocuments(documents);
        setDocuments(formattedDocs);
      } else {
        setDocuments([]);
        setError("No documents found in your technician profile.");
      }
    } catch (error) {
      console.error("FRONTEND - Error fetching technician documents:", error);
      setError("Error loading documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const convertTechnicianDocuments = (
    technicianDocs: any[]
  ): DocumentData[] => {
    const documentTypes = {
      idProof: "ID Proof",
      addressProof: "Address Proof",
      policeVerification: "Police Verification",
      passportPhoto: "Passport Photo",
      profilePhoto: "Profile Photo",
      tradeLicense: "Trade License",
    };

    return technicianDocs.map((doc) => ({
      _id: doc._id?.toString() || doc.type,
      type: doc.type,
      fileName:
        doc.fileName ||
        `${
          documentTypes[doc.type as keyof typeof documentTypes] || doc.type
        } Document`,
      url: doc.url,
      uploadedAt: doc.uploadedAt || new Date().toISOString(),
      verified: doc.verified || false,
      status: doc.status || (doc.verified ? "approved" : "pending"),
      verifiedAt: doc.verifiedAt,
    }));
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      idProof: "ID Proof",
      addressProof: "Address Proof",
      policeVerification: "Police Verification",
      passportPhoto: "Passport Photo",
      profilePhoto: "Profile Photo",
      tradeLicense: "Trade License",
    };
    return typeMap[type] || type;
  };

  const getStatusInfo = (status: string, verified: boolean) => {
    switch (status) {
      case "approved":
        return {
          label: "Approved",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircleOutlineOutlined className="h-4 w-4 mr-1" />,
        };
      case "rejected":
        return {
          label: "Rejected",
          color: "bg-red-100 text-red-800",
          icon: <ErrorOutlineOutlined className="h-4 w-4 mr-1" />,
        };
      case "pending":
      default:
        return {
          label: verified ? "Under Review" : "Pending",
          color: "bg-yellow-100 text-yellow-800",
          icon: <AccessTimeOutlined className="h-4 w-4 mr-1" />,
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    try {
      setUploading(documentType);

      // Validate file type and size
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error("Only images and PDF files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("document", file);
      formData.append("type", documentType);

      // Use technician profile API to upload document
      const response = await TechnicianService.uploadDocument(formData);

      if (response.success) {
        toast.success(
          `${getDocumentTypeLabel(documentType)} uploaded successfully!`
        );

        // Refresh documents from technician profile
        await fetchTechnicianDocuments();
      } else {
        throw new Error(response.message || `Failed to upload ${documentType}`);
      }
    } catch (error: any) {
      console.error(`Error uploading ${documentType}:`, error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to upload ${getDocumentTypeLabel(documentType)}`;
      toast.error(errorMessage);
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (
    documentType: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(documentType, file);
    }
  };

  const getDocumentCategories = () => {
    return [
      { type: "idProof", label: "ID Proof", required: true },
      { type: "addressProof", label: "Address Proof", required: true },
      {
        type: "policeVerification",
        label: "Police Verification",
        required: false,
      },
      { type: "passportPhoto", label: "Passport Photo", required: true },
      { type: "tradeLicense", label: "Trade License", required: false },
    ];
  };

  if (loading) {
    return (
      <AccordionSection title="Documents & Verification" number={6}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      </AccordionSection>
    );
  }

  return (
    <AccordionSection title="Documents & Verification" number={6}>
      <div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Document Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-4">Upload Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getDocumentCategories().map((category) => {
              const existingDoc = documents.find(
                (doc) => doc.type === category.type
              );

              return (
                <div
                  key={category.type}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {category.label}
                        {category.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h4>
                      {existingDoc && (
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded on {formatDate(existingDoc.uploadedAt)}
                        </p>
                      )}
                    </div>
                    {existingDoc && (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          getStatusInfo(
                            existingDoc.status,
                            existingDoc.verified
                          ).color
                        }`}
                      >
                        {
                          getStatusInfo(
                            existingDoc.status,
                            existingDoc.verified
                          ).label
                        }
                      </span>
                    )}
                  </div>

                  {existingDoc ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => window.open(existingDoc.url, "_blank")}
                          className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
                        >
                          <DescriptionOutlined className="h-4 w-4 mr-1" />
                          View Current Document
                        </button>
                        <label className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer flex items-center">
                          <FileUploadOutlined className="h-4 w-4 mr-1" />
                          Update Document
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => handleFileChange(category.type, e)}
                            disabled={uploading === category.type}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="block w-full">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer">
                        <FileUploadOutlined className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload {category.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports images and PDF (max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(category.type, e)}
                        disabled={uploading === category.type}
                      />
                    </label>
                  )}

                  {uploading === category.type && (
                    <div className="mt-2 flex items-center text-sm text-blue-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Uploading...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> You can update your documents at any time.
            Updated documents will need to be verified again by our team.
            Required documents are marked with{" "}
            <span className="text-red-500">*</span>.
          </p>
        </div>
      </div>
    </AccordionSection>
  );
};

export default DocumentsVerification;
