import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { useAppSelector } from "../../../../hooks/redux";
import { TechnicianMangementService } from "../../../../services/admin/TechnicianManagementService";
import type {
  Address,
  DocumentDisplay,
  Location,
  PendingApplication,
} from "../../../../interface/admin/IPendingApplicationProfile";
import { AdminSidebar } from "../adminDashboard/actions/AdminSidebar";
import { AdminActions } from "./actions/AdminActions";

const PendingApplicationProfile: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<PendingApplication | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { applications, applicationsLoading } = useAppSelector(
    (state) => state.admin
  );

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);

        if (!applicationId) {
          throw new Error("Application ID is required");
        }

        const response = await TechnicianMangementService.getApplicationDetails(
          applicationId
        );

        if (response.data.success && response.data.data?.applications?.[0]) {
          const applicationData = response.data.data.applications[0];
          console.log("📋 Full application data:", applicationData); // Debug log
          setApplication(applicationData);
        } else {
          throw new Error(response.data.message || "Application not found");
        }
      } catch (error) {
        console.error("Error fetching application details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplicationDetails();
    }
  }, [applicationId]);

  useEffect(() => {
    if (applicationId && applications.length > 0) {
      const existingApplication = applications.find(
        (app) => app._id === applicationId
      );
      if (existingApplication) {
        setApplication(existingApplication as PendingApplication);
        setLoading(false);
      }
    }
  }, [applicationId, applications]);

  const getProfilePictureUrl = (): string | null => {
    if (application?.profilePictureUrl) {
      return application.profilePictureUrl;
    }

    if (application?.documents?.passportPhoto?.url) {
      return application.documents.passportPhoto.url;
    }

    if (application?.documents?.profilePhoto?.url) {
      return application.documents.profilePhoto.url;
    }

    return null;
  };

  // Function to get all available documents dynamically
  const getAvailableDocuments = (): DocumentDisplay[] => {
    if (!application?.documents) return [];

    const documentTypes: Record<string, string> = {
      idProof: "ID Proof",
      addressProof: "Address Proof",
      passportPhoto: "Passport Photo",
      profilePhoto: "Profile Photo",
      policeVerification: "Police Verification",
      tradeLicense: "Trade License",
      certifications: "Certifications",
      drivingLicense: "Driving License",
      voterId: "Voter ID",
      passport: "Passport",
      aadhaar: "Aadhaar Card",
      nationalId: "National ID",
    };

    const pdfDocumentTypes = [
      "idProof",
      "addressProof",
      "policeVerification",
      "drivingLicense",
      "tradeLicense",
      "certifications",
    ];

    const imageDocumentTypes = ["passportPhoto", "profilePhoto"];

    return Object.entries(application.documents)
      .filter(
        ([, doc]) =>
          doc && doc.url && typeof doc.url === "string" && doc.url.trim() !== ""
      )
      .map(([key, doc]) => {
        // Determine file type based on document type and URL analysis
        let isPdf = false;
        let isImage = false;

        // Check by document type
        if (pdfDocumentTypes.includes(key)) {
          isPdf = true;
        } else if (imageDocumentTypes.includes(key)) {
          isImage = true;
        }
        // Check Cloudinary URL structure
        else if (doc.url.includes("/raw/upload/")) {
          isPdf = true;
        } else if (doc.url.includes("/image/upload/")) {
          isImage = true;
        }
        // Check file extension as fallback
        else if (doc.url.toLowerCase().match(/\.(pdf)$/)) {
          isPdf = true;
        } else if (doc.url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          isImage = true;
        }

        const fileTypeIsPdf = isPdf || (!isImage && !isPdf);

        return {
          key,
          displayName:
            documentTypes[key] ||
            key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase()),
          url: doc.url,
          verified: doc.verified || false,
          type: doc.type || key,
          isPdf: fileTypeIsPdf,
          uploadedAt: doc.uploadedAt,
        };
      });
  };

  const refreshApplicationData = async () => {
    if (!applicationId) return;

    try {
      const response = await TechnicianMangementService.getApplicationDetails(
        applicationId
      );
      if (response.data.success && response.data.data?.applications?.[0]) {
        setApplication(response.data.data.applications[0]);
      }
    } catch (error) {
      console.error("Error refreshing application details:", error);
    }
  };

  const handleViewDocument = (url: string, isPdf: boolean) => {
    if (isPdf) {
      let viewUrl = url;

      // If this is a Cloudinary raw file, use Google Docs Viewer
      if (url.includes("res.cloudinary.com") && url.includes("/raw/upload/")) {
        viewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          url
        )}&embedded=true`;
      }

      window.open(viewUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const getFileIcon = (isPdf: boolean) => {
    return isPdf ? (
      <PictureAsPdfOutlinedIcon className="h-5 w-5 text-red-500" />
    ) : (
      <ImageOutlinedIcon className="h-5 w-5 text-blue-500" />
    );
  };

  // Updated formatAddress function
  const formatAddress = (address?: Address | string): string => {
    if (!address) return "Not provided";

    let addressObj: Address | null = null;

    if (typeof address === "string") {
      try {
        addressObj = JSON.parse(address);
      } catch (error) {
        console.error(error);
        return address;
      }
    } else {
      addressObj = address;
    }

    if (addressObj && typeof addressObj === "object") {
      const parts = [
        addressObj.street,
        addressObj.city,
        addressObj.state,
        addressObj.pincode,
      ].filter(Boolean);

      return parts.length > 0 ? parts.join(", ") : "Not provided";
    }

    return "Not provided";
  };

  // Helper function to format location
  const formatLocation = (location?: Location | string): string => {
    if (!location) return "Not provided";

    let locationObj: Location | null = null;

    if (typeof location === "string") {
      try {
        locationObj = JSON.parse(location);
      } catch (error) {
        console.error("Error parsing location:", error);
        // If it's a string but not JSON, return it as is
        return location;
      }
    } else {
      locationObj = location;
    }

    if (locationObj && typeof locationObj === "object") {
      return locationObj.formattedAddress || "Not provided";
    }

    return "Not provided";
  };

  // Enhanced helper function to display availability with times
  const formatDetailedAvailability = (): string => {
    const availabilityData = application?.availability?.availability;

    if (!availabilityData) return "Not provided";

    try {
      const availableDays = availabilityData.weeklyPattern
        ? Object.entries(availabilityData.weeklyPattern)
            .filter(([, day]) => day.available)
            .map(([day, schedule]) => {
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);
              return `${dayName} (${schedule.startTime} - ${schedule.endTime})`;
            })
        : [];

      return availableDays.length > 0
        ? availableDays.join(", ")
        : "No days selected";
    } catch (error) {
      console.error("Error parsing availability:", error);
      return "Availability data not readable";
    }
  };

  const availableDocuments = getAvailableDocuments();
  const profilePictureUrl = getProfilePictureUrl();

  if (loading || applicationsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Application not found</p>
            <Link
              to="/admin/technician-management"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4"
            >
              <ChevronLeftOutlinedIcon />
              <span className="ml-1">Back to Technicians</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage="Technicians" />

      <div className="flex-1 overflow-y-auto ml-[240px]">
        <div className="bg-white border-b border-gray-200 p-6">
          <Link
            to="/admin/technician-management"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronLeftOutlinedIcon />
            <span className="ml-1">Back to Technicians</span>
          </Link>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Profile Picture in Header */}
              {profilePictureUrl ? (
                <div className="relative">
                  <img
                    src={profilePictureUrl}
                    alt={application.personal?.fullName || "Applicant"}
                    className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="absolute inset-0 rounded-full border border-gray-200"></div>
                </div>
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {application.personal?.fullName || "Applicant"}
                </h1>
                <p className="text-gray-600">Pending Technician Application</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  application.status === "submitted"
                    ? "bg-yellow-100 text-yellow-800"
                    : application.status === "under_review"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {application.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-6">
              Complete Application Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-base font-medium mb-4 border-b pb-2">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">
                      {application.personal?.fullName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{application.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">
                      {application.personal?.phoneNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium capitalize">
                      {application.personal?.gender || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {application.personal?.dateOfBirth
                        ? new Date(
                            application.personal.dateOfBirth
                          ).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium">
                      {application.personal?.languages?.join(", ") ||
                        application.skills?.languages?.join(", ") ||
                        "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identity & Verification */}
              <div>
                <h3 className="text-base font-medium mb-4 border-b pb-2">
                  Identity & Verification
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">ID Type</p>
                    <p className="font-medium capitalize">
                      {application.identity?.idType
                        ?.replace(/([A-Z])/g, " $1")
                        .trim() || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Number</p>
                    <p className="font-medium font-mono">
                      {application.identity?.idNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Identity Address</p>
                    <p className="font-medium">
                      {formatAddress(application.identity?.address)}
                    </p>
                  </div>
                  {application.identity?.location && (
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-sm">
                        {formatLocation(application.identity.location)}
                      </p>
                    </div>
                  )}
                  {application.identity?.verificationStatus && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Verification Status
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          application.identity.verificationStatus === "approved"
                            ? "bg-green-100 text-green-800"
                            : application.identity.verificationStatus ===
                              "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {application.identity.verificationStatus
                          .charAt(0)
                          .toUpperCase() +
                          application.identity.verificationStatus.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills & Services */}
              <div>
                <h3 className="text-base font-medium mb-4 border-b pb-2">
                  Skills & Services
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">
                      {application.skills?.yearsOfExperience || 0} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Services</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.skills?.services?.map((service, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {service}
                        </span>
                      )) || "No services specified"}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium">
                      {application.skills?.languages?.join(", ") ||
                        "Not specified"}
                    </p>
                  </div>
                  {application.skills?.bio && (
                    <div>
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="font-medium text-sm mt-1 text-gray-700 bg-gray-50 p-3 rounded-md">
                        {application.skills.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability & Work Preferences */}
              <div>
                <h3 className="text-base font-medium mb-4 border-b pb-2">
                  Availability & Work Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Service Areas</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.availability?.serviceAreas?.map(
                        (area, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                          >
                            {area}
                          </span>
                        )
                      ) || "No areas specified"}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Work Radius</p>
                    <p className="font-medium">
                      {application.availability?.workRadius
                        ? `${application.availability.workRadius} km`
                        : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Available Days & Times
                    </p>
                    <p className="font-medium text-sm">
                      {formatDetailedAvailability()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Banking Details */}
              <div>
                <h3 className="text-base font-medium mb-4 border-b pb-2">
                  Banking Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Holder Name</p>
                    <p className="font-medium">
                      {application.bank?.accountHolderName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium">
                      {application.bank?.bankName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium font-mono">
                      {application.bank?.accountNumber
                        ? `•••• ${application.bank.accountNumber.slice(-4)}`
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">IFSC Code</p>
                    <p className="font-medium font-mono">
                      {application.bank?.ifscCode || "Not provided"}
                    </p>
                  </div>
                  {application.bank?.upiId && (
                    <div>
                      <p className="text-sm text-gray-500">UPI ID</p>
                      <p className="font-medium">{application.bank.upiId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Agreement */}
              <div>
                <h3 className="text-base font-medium mb-4 border-b pb-2">
                  Agreement & Consent
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                        application.agreement
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {application.agreement ? "✓" : "✗"}
                    </div>
                    <span
                      className={
                        application.agreement
                          ? "text-green-700"
                          : "text-red-700"
                      }
                    >
                      Terms & Conditions:{" "}
                      {application.agreement ? "Agreed" : "Not agreed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Documents Section */}
              <div className="md:col-span-2">
                <h3 className="text-base font-medium mb-4 border-b pb-2">
                  Documents ({availableDocuments.length} provided)
                </h3>

                {availableDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableDocuments.map((doc) => (
                      <div
                        key={doc.key}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(doc.isPdf)}
                            <h4 className="font-medium text-gray-800">
                              {doc.displayName}
                            </h4>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              doc.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {doc.verified ? "Verified" : "Submitted"}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {doc.isPdf ? "PDF Document" : "Image"}
                            </span>
                            <button
                              onClick={() =>
                                handleViewDocument(doc.url, doc.isPdf)
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 cursor-pointer"
                            >
                              <span>
                                {doc.isPdf ? "View PDF" : "View Image"}
                              </span>
                            </button>
                          </div>

                          {doc.uploadedAt && (
                            <div className="text-xs text-gray-400">
                              Uploaded:{" "}
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ImageOutlinedIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No documents provided</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Applicant has not uploaded any documents yet
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Meta */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Application ID</p>
                  <p className="font-medium font-mono text-xs">
                    {application._id}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted On</p>
                  <p className="font-medium">
                    {application.submittedAt
                      ? new Date(application.submittedAt).toLocaleDateString()
                      : "Not submitted"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created On</p>
                  <p className="font-medium">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            <AdminActions
              type="pending"
              applicationId={application._id}
              technicianName={application.personal?.fullName || "Applicant"}
              onStatusUpdate={refreshApplicationData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApplicationProfile;
