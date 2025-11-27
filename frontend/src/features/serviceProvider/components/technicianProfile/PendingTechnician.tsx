/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import {
  ErrorOutlineOutlined,
  CheckCircleOutlineOutlined,
  AccessTimeOutlined,
  CircleOutlined,
  ChevronRightOutlined,
  ClearOutlined,
  EditOutlined,
  MarkChatUnreadOutlined,
  HelpOutlineOutlined,
  CancelOutlined,
  RefreshOutlined,
  AddCircleOutlineOutlined,
  PictureAsPdfOutlined,
  ImageOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppSelector } from "../../../../hooks/redux";
import { useNavigate } from "react-router-dom";

interface DocumentInfo {
  url: string;
  verified?: boolean;
  publicId?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  uploadedAt?: string;
  uploadFailed?: boolean;
  type?: string;
}

interface ApplicationData {
  _id: string;
  phone: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  stepsCompleted: string[];

  // Personal Information
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
    languages?: string[];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      landmark?: string;
    };
  };

  // Identity & Verification
  identity: {
    idType?: string;
    idNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      landmark?: string;
    };
    location?: {
      coordinates: number[];
      formattedAddress: string;
      type?: string;
    };
    verified?: boolean;
    verificationStatus?: "pending" | "approved" | "rejected";
    verifiedAt?: string;
  };

  // Skills & Services
  skills: {
    services?: string[];
    yearsOfExperience?: number;
    languages?: string[];
    bio?: string;
    serviceAreas?: string[];
    workRadius?: number;
  };

  // Availability & Work Preferences - UPDATED STRUCTURE
  availability: {
    serviceAreas?: string[];
    workRadius?: string;
    availability?: {
      availableWeeks?: number[];
      weeklyPattern?: {
        [key: string]: {
          available: boolean;
          startTime: string;
          endTime: string;
        };
      };
    };
  };

  // Banking Details
  bank: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
    bankName?: string;
    withdrawalPreference?: string;
  };

  // Documents
  documents?: Record<string, DocumentInfo>;

  // Agreement
  agreement?: boolean;

  // Timestamps
  submittedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TechnicianData {
  _id: string;
  userId: string;
  displayName: string;
  bio?: string;
  experienceYears: number;
  services: string[];
  serviceRates: Record<string, number>;
  workAreas: string[];
  serviceRadiusKm: number;
  status: "pending" | "active" | "inactive" | "suspended";
  profilePictureUrl?: string;
  rating?: number;
  totalJobs?: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AvailableDocument {
  key: string;
  displayName: string;
  url: string;
  verified: boolean;
  type: string;
  isPdf: boolean;
  isImage: boolean;
  uploadedAt?: string;
  filename?: string;
  mimetype?: string;
}

const PendingTechnicianApplication: React.FC = () => {
  const [applicationData, setApplicationData] =
    useState<ApplicationData | null>(null);
  const [technicianData, setTechnicianData] = useState<TechnicianData | null>(
    null
  );
  const [applicationStatus, setApplicationStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const { user, accessToken, isLoggedIn } = useAppSelector(
    (state) => state.auth
  );
  const navigate = useNavigate();

  const fetchApplicationData = useCallback(async () => {
    if (!isLoggedIn || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const applicationId = localStorage.getItem("applicationId");

      if (!applicationId) {
        try {
          const userApplicationsResponse = await axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/technician-application/user/applications`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          let applications: ApplicationData[] = [];

          if (userApplicationsResponse.data.data?.applications) {
            applications = userApplicationsResponse.data.data.applications;
          } else if (userApplicationsResponse.data.applications) {
            applications = userApplicationsResponse.data.applications;
          } else if (userApplicationsResponse.data.data) {
            applications = Array.isArray(userApplicationsResponse.data.data)
              ? userApplicationsResponse.data.data
              : [];
          }

          const latestApplication = applications[0];

          if (latestApplication) {
            localStorage.setItem("applicationId", latestApplication._id);
            setApplicationData(latestApplication);
            setApplicationStatus(latestApplication.status);

            if (latestApplication.status === "draft") {
              navigate("/technicians/apply");
              return;
            }
            return;
          } else {
            setError("No application found. Please start a new application.");
            setLoading(false);
            return;
          }
        } catch (userAppsError) {
          console.error("Error fetching user applications:", userAppsError);
          setError("Failed to load your applications");
          setLoading(false);
          return;
        }
      }

      const applicationResponse = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/technician-application/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      let appData: ApplicationData | null = null;

      if (
        applicationResponse.data.data &&
        applicationResponse.data.data.application
      ) {
        appData = applicationResponse.data.data.application;
      } else if (applicationResponse.data.data) {
        appData = applicationResponse.data.data;
      } else if (applicationResponse.data.application) {
        appData = applicationResponse.data.application;
      } else if (applicationResponse.data) {
        appData = applicationResponse.data;
      }

      if (
        appData &&
        (appData as unknown as { data: { application: ApplicationData } }).data
          ?.application
      ) {
        appData = (
          appData as unknown as { data: { application: ApplicationData } }
        ).data.application;
      }

      if (appData) {
        if (appData.status === "draft") {
          navigate("/technicians/apply");
          return;
        }

        setApplicationData(appData);
        setApplicationStatus(appData.status);

        if (appData.status === "approved") {
          try {
            const technicianResponse = await axios.get(
              `${
                import.meta.env.VITE_BASE_URL
              }/technicians/by-application/${applicationId}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            // Handle different response structures for technician data
            let technicianData: TechnicianData | null = null;
            if (technicianResponse.data.data?.technician) {
              technicianData = technicianResponse.data.data.technician;
            } else if (technicianResponse.data.technician) {
              technicianData = technicianResponse.data.technician;
            } else if (technicianResponse.data.data) {
              technicianData = technicianResponse.data.data;
            }

            if (technicianData) {
              setTechnicianData(technicianData);
            }
          } catch (techError) {
            console.log("No technician data found yet", techError);
          }
        }
      } else {
        console.error("No application data found in response");
        setError(
          "Failed to load application data - invalid response structure"
        );
      }
    } catch (error: unknown) {
      console.error("Error fetching application data:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (axios.isAxiosError(error) && error.response?.status === 404) {
        localStorage.removeItem("applicationId");
        localStorage.removeItem("currentTechnicianApplication");
        setError("Application not found. Please start a new application.");
      } else {
        setError("Failed to load application data");
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, isLoggedIn, navigate]);

  useEffect(() => {}, [applicationData?.status]);

  // Function to get all available documents dynamically
  const getAvailableDocuments = (): AvailableDocument[] => {
    if (!applicationData?.documents) return [];

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
      experienceCertificate: "Experience Certificate",
      educationCertificate: "Education Certificate",
      other: "Other Document",
    };

    const pdfDocumentTypes = [
      "idProof",
      "addressProof",
      "policeVerification",
      "drivingLicense",
      "tradeLicense",
      "certifications",
      "experienceCertificate",
      "educationCertificate",
      "voterId",
      "passport",
      "aadhaar",
      "nationalId",
      "other",
    ];

    const imageDocumentTypes = ["passportPhoto", "profilePhoto"];

    return Object.entries(applicationData.documents)
      .filter(
        ([, doc]) =>
          doc &&
          doc.url &&
          typeof doc.url === "string" &&
          doc.url.trim() !== "" &&
          !doc.uploadFailed
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
        } else if (
          doc.url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)
        ) {
          isImage = true;
        }

        // Default to PDF if we can't determine
        if (!isPdf && !isImage) {
          isPdf = true;
        }

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
          isPdf,
          isImage,
          uploadedAt: doc.uploadedAt,
          filename: doc.filename,
          mimetype: doc.mimetype,
        };
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName)); // Sort alphabetically
  };

  const handleViewDocument = (
    url: string,
    isPdf: boolean,
    filename?: string
  ) => {
    if (isPdf) {
      let viewUrl = url;

      // If this is a Cloudinary raw file, use Google Docs Viewer for better compatibility
      if (url.includes("res.cloudinary.com") && url.includes("/raw/upload/")) {
        viewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
          url
        )}&embedded=true`;
      }

      window.open(
        viewUrl,
        "_blank",
        `noopener,noreferrer,width=800,height=600,title=${
          filename || "Document"
        }`
      );
    } else {
      // For images, open in new tab
      window.open(
        url,
        "_blank",
        `noopener,noreferrer,title=${filename || "Image"}`
      );
    }
  };

  const getFileIcon = (isPdf: boolean, isImage: boolean) => {
    if (isPdf) {
      return <PictureAsPdfOutlined className="h-5 w-5 text-red-500" />;
    } else if (isImage) {
      return <ImageOutlined className="h-5 w-5 text-blue-500" />;
    } else {
      return <DescriptionOutlined className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileTypeText = (isPdf: boolean, isImage: boolean) => {
    if (isPdf) return "PDF Document";
    if (isImage) return "Image";
    return "Document";
  };

  const getDocumentStatus = (
    documentType: string
  ): { verified: boolean; submitted: boolean; uploadFailed: boolean } => {
    if (!applicationData || !applicationData.documents) {
      return { verified: false, submitted: false, uploadFailed: false };
    }

    const doc = applicationData.documents[documentType];

    if (!doc) {
      return { verified: false, submitted: false, uploadFailed: false };
    }

    const hasDocument = !!doc.url && doc.url.trim().length > 0;
    const isVerified = doc.verified || false;
    const uploadFailed = doc.uploadFailed || false;

    return {
      verified: isVerified,
      submitted: hasDocument && !uploadFailed,
      uploadFailed: uploadFailed,
    };
  };

  const handleResubmitApplication = async () => {
    if (!isLoggedIn || !accessToken) {
      toast.error("Please log in to perform this action");
      navigate("/technicians/login");
      return;
    }

    if (!applicationData) return;

    try {
      setIsResubmitting(true);

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/technician-application/${
          applicationData._id
        }/resubmit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Application resubmitted successfully!", {
          duration: 4000,
          position: "top-center",
        });

        await fetchApplicationData();
      } else {
        setError(response.data.message || "Failed to resubmit application");
      }
    } catch (error: unknown) {
      console.error("Error resubmitting application:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/technicians/login");
      } else {
        const errorMessage =
          (axios.isAxiosError(error) && error.response?.data?.message) ||
          "Failed to resubmit application. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 4000, position: "top-center" });
      }
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleStartFreshApplication = async () => {
    if (!isLoggedIn || !accessToken) {
      toast.error("Please log in to perform this action");
      navigate("/technicians/login");
      return;
    }

    try {
      setIsResubmitting(true);

      const response = await axios.post(
        `${
          import.meta.env.VITE_BASE_URL
        }/technician-application/start-new-after-rejection`,
        {
          email: applicationData?.personal?.email,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        localStorage.removeItem("applicationId");
        localStorage.removeItem("currentTechnicianApplication");
        localStorage.removeItem("technicianApplicationData");

        if (user?._id) {
          localStorage.removeItem(`techApp-${user._id}`);
          localStorage.removeItem(`techApp-step-${user._id}`);
          localStorage.removeItem(`techApp-applicationId-${user._id}`);
          localStorage.removeItem(`techApp-timestamp-${user._id}`);
        }

        const newApplicationId = response.data.data.applicationId;
        localStorage.setItem("applicationId", newApplicationId);

        toast.success(
          "New application started! You can now update your information.",
          {
            duration: 4000,
            position: "top-center",
          }
        );

        window.location.href = "/technicians/apply";
      } else {
        setError(response.data.message || "Failed to start new application");
      }
    } catch (error: unknown) {
      console.error("Error starting new application:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/technicians/login");
      } else {
        const errorMessage =
          (axios.isAxiosError(error) && error.response?.data?.message) ||
          "Failed to start new application. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 4000, position: "top-center" });
      }
    } finally {
      setIsResubmitting(false);
    }
  };

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!isLoggedIn || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const applicationId = localStorage.getItem("applicationId");

        if (applicationId) {
          await fetchApplicationData();
          return;
        }

        const response = await axios.get(
          `${
            import.meta.env.VITE_BASE_URL
          }/technician-application/user/applications`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const applications = response.data.data?.applications || [];
        const latestApplication = applications[0];

        if (latestApplication) {
          localStorage.setItem("applicationId", latestApplication._id);
          setApplicationData(latestApplication);
          setApplicationStatus(latestApplication.status);

          if (latestApplication.status === "draft") {
            navigate("/technicians/apply");
            return;
          }
        } else {
          navigate("/technicians/apply");
          return;
        }
      } catch (error: unknown) {
        console.error("Error checking application status:", error);

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load application data");
        }
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();
  }, [accessToken, isLoggedIn, navigate, fetchApplicationData]);

  if (applicationStatus === "approved" && technicianData) {
    window.location.href = "/technicians/dashboard";
    return null;
  }

  const getApplicationDate = () => {
    if (!applicationData) return "N/A";

    const date = applicationData.submittedAt || applicationData.createdAt;
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const getRejectionDate = () => {
    if (!applicationData?.rejectedAt) {
      const fallbackDate = applicationData?.updatedAt;
      if (fallbackDate) {
        return new Date(fallbackDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return "Date not available";
    }

    try {
      const date = new Date(applicationData.rejectedAt);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error parsing rejectedAt:", error);
      return "Invalid Date";
    }
  };

  const getProfilePhotoUrl = (): string | null => {
    if (!applicationData?.documents) return null;

    const passportPhoto = applicationData.documents.passportPhoto;
    if (passportPhoto?.url && !passportPhoto.uploadFailed) {
      return passportPhoto.url;
    }

    const profilePhoto = applicationData.documents.profilePhoto;
    if (profilePhoto?.url && !profilePhoto.uploadFailed) {
      return profilePhoto.url;
    }

    return null;
  };

  // Helper function to get initials as fallback
  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  const handleEditStep = (stepName: string) => {
    if (!applicationData?._id) {
      toast.error("Application ID not found");
      return;
    }

    const authData = {
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: localStorage.getItem("refreshToken"),
      user: localStorage.getItem("user"),
      isLoggedIn: localStorage.getItem("isLoggedIn"),
    };

    // Clear only application data
    localStorage.removeItem("applicationId");
    localStorage.removeItem("currentTechnicianApplication");
    localStorage.removeItem("technicianApplicationData");
    localStorage.removeItem("isEditMode");

    if (user?._id) {
      localStorage.removeItem(`techApp-${user._id}`);
      localStorage.removeItem(`techApp-step-${user._id}`);
      localStorage.removeItem(`techApp-applicationId-${user._id}`);
      localStorage.removeItem(`techApp-timestamp-${user._id}`);
    }

    // Restore authentication data
    if (authData.accessToken)
      localStorage.setItem("accessToken", authData.accessToken);
    if (authData.refreshToken)
      localStorage.setItem("refreshToken", authData.refreshToken);
    if (authData.user) localStorage.setItem("user", authData.user);
    if (authData.isLoggedIn)
      localStorage.setItem("isLoggedIn", authData.isLoggedIn);

    // Set edit mode, application ID, and target step
    localStorage.setItem("applicationId", applicationData._id);
    localStorage.setItem("isEditMode", "true");
    localStorage.setItem("editStep", stepName);

    // Use a small timeout to ensure the state is properly set
    setTimeout(() => {
      window.location.href = "/technicians/apply";
    }, 100);
  };

  const getStatusBadge = () => {
    const status = applicationData?.status;

    switch (status) {
      case "submitted":
        return {
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          icon: <AccessTimeOutlined className="w-3 h-3 mr-1" />,
          text: "Pending Verification",
        };
      case "under_review":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: <AccessTimeOutlined className="w-3 h-3 mr-1" />,
          text: "Under Review",
        };
      case "approved":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: <CheckCircleOutlineOutlined className="w-3 h-3 mr-1" />,
          text: "Approved",
        };
      case "rejected":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: <CancelOutlined className="w-3 h-3 mr-1" />,
          text: "Rejected",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: <CircleOutlined className="w-3 h-3 mr-1" />,
          text: status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : "Unknown",
        };
    }
  };

  if (loading) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application data...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ErrorOutlineOutlined className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Error Loading Application
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchApplicationData}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!applicationData) {
    return (
      <>
        <Header userType="serviceProvider" isApproved={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ErrorOutlineOutlined className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Application Found
            </h2>
            <p className="text-gray-600">
              Please start a new application to continue.
            </p>
            <button
              onClick={() => (window.location.href = "/technician/apply")}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 mt-4"
            >
              Start Application
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusBadge = getStatusBadge();
  const availableDocuments = getAvailableDocuments();

  return (
    <>
      <Header userType="serviceProvider" isApproved={false} />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              {/* Profile photo section */}
              {getProfilePhotoUrl() ? (
                <div className="h-12 w-12 rounded-full overflow-hidden mr-4 border-2 border-gray-200">
                  <img
                    src={getProfilePhotoUrl()!}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                <div class="h-full w-full bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 text-lg font-medium">
                    ${getInitials(applicationData.personal?.fullName || "User")}
                  </span>
                </div>
              `;
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-lg font-medium">
                    {getInitials(applicationData.personal?.fullName || "User")}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-xl font-semibold">
                  {applicationData.personal?.fullName || "Not Provided"}
                </h1>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bgColor} ${statusBadge.textColor}`}
                  >
                    {statusBadge.icon}
                    {statusBadge.text}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Application Date: {getApplicationDate()}
              </p>
              {applicationData.status === "rejected" && (
                <p className="text-sm text-gray-500">
                  Rejected Date: {getRejectionDate()}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Phone:{" "}
                {applicationData.personal?.phoneNumber || applicationData.phone}
              </p>
            </div>
          </div>

          <ApplicationDetailsDisplay
            application={applicationData}
            onEditStep={
              applicationData.status !== "rejected" ? handleEditStep : undefined
            }
          />

          {applicationData.status === "rejected" && (
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CancelOutlined className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Application Rejected
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="mb-3">
                      Unfortunately, your technician application has been
                      rejected.
                    </p>

                    {/* Display Rejection Reason */}
                    {applicationData.rejectionReason ? (
                      <div className="mb-3">
                        <strong className="block mb-1">
                          Rejection Reason:
                        </strong>
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-red-700 whitespace-pre-wrap">
                            {applicationData.rejectionReason}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <p className="text-red-600 italic">
                          No specific rejection reason provided.
                        </p>
                      </div>
                    )}

                    {/* Display Additional Notes if any */}
                    {applicationData.reviewNotes && (
                      <div className="mb-3">
                        <strong className="block mb-1">Admin Notes:</strong>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-yellow-700 whitespace-pre-wrap">
                            {applicationData.reviewNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Display Rejection Date */}
                    {applicationData.rejectedAt && (
                      <p className="text-sm text-red-600 mt-3">
                        <strong>Rejected on:</strong> {getRejectionDate()}
                      </p>
                    )}

                    <p className="mt-4 text-red-800 font-medium">
                      You can review the issues mentioned above and submit a new
                      application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Documents Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-medium mb-4">
              Uploaded Documents ({availableDocuments.length})
            </h2>

            {availableDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableDocuments.map((doc) => (
                  <div
                    key={doc.key}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(doc.isPdf, doc.isImage)}
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {doc.displayName}
                          </h4>
                          {doc.filename && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">
                              {doc.filename}
                            </p>
                          )}
                        </div>
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
                          {getFileTypeText(doc.isPdf, doc.isImage)}
                        </span>
                        <button
                          onClick={() =>
                            handleViewDocument(doc.url, doc.isPdf, doc.filename)
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{doc.isPdf ? "View PDF" : "View Image"}</span>
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
                <ImageOutlined className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No documents uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload documents in your application to proceed with
                  verification
                </p>
                <button
                  onClick={() => (window.location.href = "/technicians/apply")}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Upload Documents
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons for Rejected Applications */}
          {applicationData.status === "rejected" && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium mb-3">Apply Again</h2>
              <p className="text-sm text-gray-600 mb-4">
                Choose how you want to proceed with your application:
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleResubmitApplication}
                  disabled={isResubmitting}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshOutlined className="w-4 h-4 mr-2" />
                  {isResubmitting ? "Resubmitting..." : "Quick Resubmit"}
                </button>

                <button
                  onClick={handleStartFreshApplication}
                  disabled={isResubmitting}
                  className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AddCircleOutlineOutlined className="w-4 h-4 mr-2" />
                  {isResubmitting ? "Creating..." : "Start Completely Fresh"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <strong>Quick Resubmit:</strong> Resubmit your current
                application as-is
                <br />
                <strong>Start Completely Fresh:</strong> Create a new
                application (keeps your documents)
              </p>
            </div>
          )}

          {/* Next Steps */}
          {applicationData.status === "rejected" ? (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium mb-3">Next Steps After Rejection:</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Review the rejection reason above carefully</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Update any incorrect or missing information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Ensure all documents are clear and valid</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Resubmit your application when ready</span>
                </li>
              </ul>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium mb-3">Next Steps:</h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Wait for admin verification (24-48 hours)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Keep your phone available for verification calls</span>
                </li>
                {!getDocumentStatus("policeVerification").submitted && (
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>
                      Submit police verification certificate (recommended)
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Restrictions*/}
          {applicationData.status !== "rejected" && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium mb-3">
                Restrictions During Verification
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                      <ClearOutlined className="h-3 w-3 text-red-500" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700 font-medium">
                      Cannot accept bookings
                    </p>
                    <p className="text-xs text-gray-500">
                      You'll be able to accept job requests after verification
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                      <ClearOutlined className="h-3 w-3 text-red-500" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700 font-medium">
                      Limited profile visibility
                    </p>
                    <p className="text-xs text-gray-500">
                      Your profile won't be visible to customers until verified
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Need Help */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-medium mb-4">Need Help?</h2>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">
                Frequently Asked Questions
              </h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between text-left p-2 hover:bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">
                    How long does verification take?
                  </span>
                  <ChevronRightOutlined className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between text-left p-2 hover:bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">
                    Can I update my documents?
                  </span>
                  <ChevronRightOutlined className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between text-left p-2 hover:bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">
                    What happens after verification?
                  </span>
                  <ChevronRightOutlined className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Contact Support</h3>
              <button className="w-full bg-blue-600 text-white rounded-md py-2.5 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center mb-2">
                <MarkChatUnreadOutlined className="w-4 h-4 mr-2" />
                Chat with Support
              </button>
              <button className="w-full text-gray-700 flex items-center justify-center py-2 hover:bg-gray-50 rounded-md">
                <HelpOutlineOutlined className="w-4 h-4 mr-2 text-gray-500" />
                View Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PendingTechnicianApplication;

const ApplicationDetailsDisplay: React.FC<{
  application: ApplicationData;
  onEditStep?: (stepName: string) => void;
}> = ({ application, onEditStep }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold border-b pb-3">
        Application Details
      </h2>

      {/* Personal Information */}
      <div className="border rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-blue-600">
            Personal Information
          </h3>
          {onEditStep && (
            <button
              onClick={() => onEditStep("Personal Information")}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium cursor-pointer"
            >
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Full Name
            </label>
            <p className="text-gray-900">
              {application.personal?.fullName || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Phone Number
            </label>
            <p className="text-gray-900">
              {application.personal?.phoneNumber ||
                application.phone ||
                "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">
              {application.personal?.email || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Date of Birth
            </label>
            <p className="text-gray-900">
              {application.personal?.dateOfBirth
                ? new Date(
                    application.personal.dateOfBirth
                  ).toLocaleDateString()
                : "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Gender</label>
            <p className="text-gray-900 capitalize">
              {application.personal?.gender || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Languages
            </label>
            <p className="text-gray-900">
              {application.personal?.languages?.join(", ") ||
                application.skills?.languages?.join(", ") ||
                "Not provided"}
            </p>
          </div>
        </div>

        {/* Address */}
        {application.personal?.address && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-gray-500">Street</label>
                <p className="text-gray-900">
                  {application.personal.address.street || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">City</label>
                <p className="text-gray-900">
                  {application.personal.address.city || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">State</label>
                <p className="text-gray-900">
                  {application.personal.address.state || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">PIN Code</label>
                <p className="text-gray-900">
                  {application.personal.address.pincode || "Not provided"}
                </p>
              </div>
              {application.personal.address.landmark && (
                <div className="md:col-span-2">
                  <label className="text-gray-500">Landmark</label>
                  <p className="text-gray-900">
                    {application.personal.address.landmark}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Identity & Verification */}
      <div className="border rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-blue-600">
            Identity & Verification
          </h3>
          {onEditStep && (
            <button
              onClick={() => onEditStep("Identity & Verification")}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium cursor-pointer"
            >
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">ID Type</label>
            <p className="text-gray-900 capitalize">
              {application.identity?.idType
                ?.replace(/([A-Z])/g, " $1")
                .trim() || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              ID Number
            </label>
            <p className="text-gray-900 font-mono">
              {application.identity?.idNumber || "Not provided"}
            </p>
          </div>
          {application.identity?.verificationStatus && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Verification Status
              </label>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  application.identity.verificationStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : application.identity.verificationStatus === "rejected"
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

        {/* Identity Address (if different from personal address) */}
        {application.identity?.address && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Identity Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="text-gray-500">Street</label>
                <p className="text-gray-900">
                  {application.identity.address.street || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">City</label>
                <p className="text-gray-900">
                  {application.identity.address.city || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">State</label>
                <p className="text-gray-900">
                  {application.identity.address.state || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-gray-500">PIN Code</label>
                <p className="text-gray-900">
                  {application.identity.address.pincode || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills & Services */}
      <div className="border rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-blue-600">
            Skills & Services
          </h3>
          {onEditStep && (
            <button
              onClick={() => onEditStep("Skills & Services")}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium cursor-pointer"
            >
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">
              Services
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {application.skills?.services &&
              application.skills.services.length > 0 ? (
                application.skills.services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {service}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No services selected</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Years of Experience
            </label>
            <p className="text-gray-900">
              {application.skills?.yearsOfExperience
                ? `${application.skills.yearsOfExperience} years`
                : "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Languages
            </label>
            <p className="text-gray-900">
              {application.skills?.languages?.join(", ") || "Not provided"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">
              Bio/Description
            </label>
            <p className="text-gray-900 mt-1 whitespace-pre-wrap">
              {application.skills?.bio || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Availability & Work Preferences */}
      <div className="border rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-blue-600">
            Availability & Work Preferences
          </h3>
          {onEditStep && (
            <button
              onClick={() => onEditStep("Availability & Work Preferences")}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium cursor-pointer"
            >
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">
              Service Areas
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {application.availability?.serviceAreas &&
              application.availability.serviceAreas.length > 0 ? (
                application.availability.serviceAreas.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No service areas selected</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Work Radius
            </label>
            <p className="text-gray-900">
              {application.availability?.workRadius
                ? `${application.availability.workRadius} km`
                : "Not provided"}
            </p>
          </div>

          {/* Weekly Availability Display */}
          {application.availability?.availability && (
            <div className="md:col-span-2 mt-4 pt-4 border-t">
              <h4 className="font-medium mb-3">Weekly Availability</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-blue-600 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This schedule is automatically effective for{" "}
                      <strong>1 month</strong>. After 1 month, it will
                      automatically reset and you can update it from your
                      profile.
                    </p>
                  </div>
                </div>
              </div>

              {(() => {
                try {
                  const availability =
                    typeof application.availability.availability === "string"
                      ? JSON.parse(application.availability.availability)
                      : application.availability.availability;

                  const availableDays = Object.entries(
                    availability.weeklyPattern || {}
                  ).filter(([, dayData]: [string, any]) => dayData.available);

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-gray-500 font-medium">
                            Available Weeks
                          </label>
                          <p className="text-gray-900 mt-1">
                            Weeks{" "}
                            {availability.availableWeeks?.sort().join(", ") ||
                              "1, 2, 3, 4"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-500 font-medium mb-2 block">
                          Available Days & Times
                        </label>
                        {availableDays.length > 0 ? (
                          <div className="space-y-2">
                            {availableDays.map(
                              ([day, dayData]: [string, any]) => (
                                <div
                                  key={day}
                                  className="flex justify-between items-center py-2 px-3 bg-green-50 border border-green-200 rounded-md"
                                >
                                  <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-3"></span>
                                    <span className="capitalize font-medium text-green-800">
                                      {day}
                                    </span>
                                  </div>
                                  <span className="text-green-700 font-medium">
                                    {dayData.startTime || "09:00"} -{" "}
                                    {dayData.endTime || "18:00"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <AccessTimeOutlined className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">
                              No available days selected
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Update your availability in the application form
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error("Error parsing availability data:", error);
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-yellow-700">
                        Availability data format not recognized
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Banking Details */}
      <div className="border rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-blue-600">Banking Details</h3>
          {onEditStep && (
            <button
              onClick={() => onEditStep("Banking Details")}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium cursor-pointer"
            >
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Account Holder Name
            </label>
            <p className="text-gray-900">
              {application.bank?.accountHolderName || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Bank Name
            </label>
            <p className="text-gray-900">
              {application.bank?.bankName || "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Account Number
            </label>
            <p className="text-gray-900 font-mono">
              {application.bank?.accountNumber
                ? `•••• ${application.bank.accountNumber.slice(-4)}`
                : "Not provided"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              IFSC Code
            </label>
            <p className="text-gray-900 font-mono">
              {application.bank?.ifscCode || "Not provided"}
            </p>
          </div>
          {application.bank?.upiId && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                UPI ID
              </label>
              <p className="text-gray-900">{application.bank.upiId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents Section - Add Edit button */}
      <div className="border rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-blue-600">Documents</h3>
          {onEditStep && (
            <button
              onClick={() => onEditStep("Documents")}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium cursor-pointer"
            >
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          {application.documents
            ? `${
                Object.keys(application.documents).length
              } document(s) uploaded`
            : "No documents uploaded"}
        </p>
      </div>

      {/* Agreement */}
      <div className="border rounded-lg p-4 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-lg text-blue-600">
            Agreement & Consent
          </h3>
          {onEditStep && (
            <button
              onClick={() => onEditStep("Agreement & Consent")}
              className="text-blue-500 hover:text-blue-700 flex items-center text-sm font-medium cursor-pointer"
            >
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        <div className="flex items-center">
          <div
            className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
              application.agreement
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {application.agreement ? (
              <CheckCircleOutlineOutlined className="h-4 w-4" />
            ) : (
              <CancelOutlined className="h-4 w-4" />
            )}
          </div>
          <span
            className={
              application.agreement ? "text-green-700" : "text-red-700"
            }
          >
            {application.agreement
              ? "Terms and conditions agreed"
              : "Terms and conditions not agreed"}
          </span>
        </div>
      </div>
    </div>
  );
};
