/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react'
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
  AddCircleOutlineOutlined
} from '@mui/icons-material';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import axios from 'axios';
import toast from 'react-hot-toast'
import { useAppSelector } from '../../../hooks/redux';
import { useNavigate } from 'react-router-dom';

interface DocumentInfo {
  url: string;
  verified?: boolean;
  publicId?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  uploadedAt?: string;
  uploadFailed?: boolean
}

interface ApplicationData {
  _id: string,
  phone: string,
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected",
  stepsCompleted: string[],
  personal: {
    fullName?: string,
    phoneNumber?: string 
    email?: string 
    dateOfBirth?: string,
    gender?: string 
  },
  identity: {
    idType?: string,
    idNumber?: string,
    currentAddress?: string
  },
  documents?: Record<string, DocumentInfo>,
  submittedAt?: string,
  reviewNotes?: string,
  rejectionReason?: string,
  rejectedAt?: string,
  createdAt: string,
  updatedAt: string
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
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  profilePictureUrl?: string;
  rating?: number;
  totalJobs?: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

const PendingTechnicianApplication: React.FC = () => {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [technicianData, setTechnicianData] = useState<TechnicianData | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const { token, isLoggedIn } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchApplicationData = useCallback(async () => {
    // ✅ Check if user is logged in and has a valid token
    if (!isLoggedIn || !token) {
      console.log('🔐 User not logged in or token missing, skipping API call');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const applicationId = localStorage.getItem("applicationId");
      
      if (!applicationId) {
        setError("No application found");
        setLoading(false);
        return;
      }

      console.log('🔐 Making API call with token:', token ? 'Token exists' : 'No token');
      
      const applicationResponse = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/technician-application/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (applicationResponse.data.data?.application) {
        const appData = applicationResponse.data.data.application;
        
        if (appData.status === 'draft') {
          navigate('/technicians/apply');
          return;
        }
        
        setApplicationData(appData);
        setApplicationStatus(appData.status);
        
        if (appData.status === 'approved') {
          try {
            const technicianResponse = await axios.get(
              `${import.meta.env.VITE_BASE_URL}/technicians/by-application/${applicationId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            if (technicianResponse.data.data?.technician) {
              setTechnicianData(technicianResponse.data.data.technician);
            }
          } catch (techError) {
            console.log("No technician data found yet", techError);
          }
        }
      } else {
        setError("Failed to load application data");
      }
    } catch (error: any) {
      console.error("Error fetching application data:", error);
      
      // ✅ Handle 401 Unauthorized specifically
      if (error.response?.status === 401) {
        console.log('🔐 Unauthorized - Token expired or invalid');
        setError("Your session has expired. Please log in again.");
        // Optionally redirect to login
        // navigate('/technicians/login');
      } else {
        setError("Failed to load application data");
      }
    } finally {
      setLoading(false);
    }
  }, [token, isLoggedIn, navigate]);

  const handleResubmitApplication = async () => {
    // ✅ Check authentication before making request
    if (!isLoggedIn || !token) {
      toast.error('Please log in to perform this action');
      navigate('/technicians/login');
      return;
    }

    if (!applicationData) return;
    
    try {
      setIsResubmitting(true);
      
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/technician-application/${applicationData._id}/resubmit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Application resubmitted successfully!', {
          duration: 4000,
          position: 'top-center',
        });
        
        await fetchApplicationData();
      } else {
        setError(response.data.message || "Failed to resubmit application");
      }
    } catch (error: any) {
      console.error("Error resubmitting application:", error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/technicians/login');
      } else {
        const errorMessage = error.response?.data?.message || "Failed to resubmit application. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 4000, position: 'top-center' });
      }
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleStartFreshApplication = async () => {
    // ✅ Check authentication before making request
    if (!isLoggedIn || !token) {
      toast.error('Please log in to perform this action');
      navigate('/technicians/login');
      return;
    }

    try {
      setIsResubmitting(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/technician-application/start-new-after-rejection`,
        {
          email: applicationData?.personal?.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        localStorage.setItem("applicationId", response.data.data.applicationId);
        
        toast.success('New application started! You can now update your information.', {
          duration: 4000,
          position: 'top-center',
        });
        
        navigate('/technicians/apply');
      } else {
        setError("Failed to start new application");
      }
    } catch (error: any) {
      console.error("Error starting new application:", error);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        navigate('/technicians/login');
      } else {
        setError("Failed to start new application. Please try again.");
      }
    } finally {
      setIsResubmitting(false);
    }
  };

  useEffect(() => {
    const checkApplicationStatus = async () => {
      // ✅ Early return if not logged in
      if (!isLoggedIn || !token) {
        console.log('🔐 User not authenticated, skipping application status check');
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
          `${import.meta.env.VITE_BASE_URL}/technician-application/user/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const applications = response.data.data?.applications || [];
        const latestApplication = applications[0];
        
        if (latestApplication) {
          localStorage.setItem("applicationId", latestApplication._id);
          setApplicationData(latestApplication);
          setApplicationStatus(latestApplication.status);
          
          if (latestApplication.status === 'draft') {
            navigate('/technicians/apply');
            return;
          }
        } else {
          navigate('/technicians/apply');
          return;
        }
      } catch (error: any) {
        console.error("Error checking application status:", error);
        
        if (error.response?.status === 401) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError("Failed to load application data");
        }
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();
  }, [token, isLoggedIn, navigate, fetchApplicationData]);

  // If application is approved and technician data exists, redirect to technician dashboard
  if (applicationStatus === 'approved' && technicianData) {
    window.location.href = '/technicians/dashboard'; // ✅ Fixed path
    return null;
  }

  const getApplicationDate = () => {
    if (!applicationData) return 'N/A';
    
    const date = applicationData.submittedAt || applicationData.createdAt;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getRejectionDate = () => {
  if (!applicationData?.rejectedAt) {
    // Fallback to updatedAt if rejectedAt is not available
    const fallbackDate = applicationData?.updatedAt;
    if (fallbackDate) {
      return new Date(fallbackDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Date not available';
  }
  
  
  try {
    const date = new Date(applicationData.rejectedAt);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("🔍 Error parsing rejectedAt:", error);
    return 'Invalid Date';
  }
};

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const getDocumentStatus = (documentType: string): { verified: boolean; submitted: boolean; uploadFailed: boolean } => {
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
      uploadFailed: uploadFailed
    };
  };

  // Status badge configuration
  const getStatusBadge = () => {
    const status = applicationData?.status;
    
    switch (status) {
      case 'submitted':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: <AccessTimeOutlined className="w-3 h-3 mr-1" />,
          text: 'Pending Verification'
        };
      case 'under_review':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: <AccessTimeOutlined className="w-3 h-3 mr-1" />,
          text: 'Under Review'
        };
      case 'approved':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: <CheckCircleOutlineOutlined className="w-3 h-3 mr-1" />,
          text: 'Approved'
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: <CancelOutlined className="w-3 h-3 mr-1" />,
          text: 'Rejected'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: <CircleOutlined className="w-3 h-3 mr-1" />,
          text: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
        };
    }
  };

  // If application is approved and technician data exists, redirect to technician dashboard
  if (applicationStatus === 'approved' && technicianData) {
    window.location.href = '/technician/dashboard';
    return null;
  }

  if (!isLoggedIn) {
    return (
      <>
        <Header userType='serviceProvider' isApproved={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ErrorOutlineOutlined className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view your application status.</p>
            <button 
              onClick={() => navigate('/technicians/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header userType='serviceProvider' isApproved={false} />
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
        <Header userType='serviceProvider' isApproved={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ErrorOutlineOutlined className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Application</h2>
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
        <Header userType='serviceProvider' isApproved={false} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ErrorOutlineOutlined className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Application Found</h2>
            <p className="text-gray-600">Please start a new application to continue.</p>
            <button 
              onClick={() => window.location.href = '/technician/apply'}
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

  return (
    <>
      <Header userType='serviceProvider' isApproved={false} />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 text-lg font-medium">
                  {getInitials(applicationData.personal?.fullName || 'User')}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold">
                  {applicationData.personal?.fullName || 'Not Provided'}
                </h1>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bgColor} ${statusBadge.textColor}`}>
                    {statusBadge.icon}
                    {statusBadge.text}
                  </span>
                </div>
              </div>
              {applicationData.status !== 'rejected' && (
                <button 
                  onClick={() => window.location.href = '/technician/apply'}
                  className="text-blue-500 flex items-center text-sm font-medium"
                >
                  <EditOutlined className="w-4 h-4 mr-1" />
                  Edit Application
                </button>
              )}
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Application Date: {getApplicationDate()}
              </p>
              {applicationData.status === 'rejected' && (
                <p className="text-sm text-gray-500">
                  Rejected Date: {getRejectionDate()}
                </p>
              )}
              <p className="text-sm text-gray-500">
                Phone: {applicationData.personal?.phoneNumber || applicationData.phone}
              </p>
            </div>
          </div>


          {applicationData.status === 'rejected' && (
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
                      Unfortunately, your technician application has been rejected.
                    </p>
                    
                    {/* Display Rejection Reason */}
                    {applicationData.rejectionReason ? (
                      <div className="mb-3">
                        <strong className="block mb-1">Rejection Reason:</strong> 
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
                      You can review the issues mentioned above and submit a new application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Application Status - Hide for rejected applications */}
          {applicationData.status !== 'rejected' && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium mb-4">Application Status</h2>
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    applicationData.stepsCompleted.includes('Personal Information') ? 
                    'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CheckCircleOutlineOutlined className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">
                    Profile Completed
                  </span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${
                  applicationData.stepsCompleted.includes('Identity & Verification') ? 
                  'bg-green-200' : 'bg-gray-200'
                }`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    applicationData.stepsCompleted.includes('Documents') ? 
                    'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <CheckCircleOutlineOutlined className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">
                    Documents Submitted
                  </span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${
                  applicationData.status === 'under_review' ? 'bg-yellow-200' : 'bg-gray-200'
                }`}></div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                    applicationData.status === 'under_review' ? 
                    'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <AccessTimeOutlined className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">
                    Admin Verification
                  </span>
                </div>
                <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                    <CircleOutlined className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-600 text-center">
                    Start Accepting Jobs
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className={`border rounded-lg p-4 mb-4 ${
                applicationData.status === 'submitted' ? 'bg-blue-50 border-blue-100' :
                applicationData.status === 'under_review' ? 'bg-yellow-50 border-yellow-100' :
                'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ErrorOutlineOutlined className={`h-5 w-5 ${
                      applicationData.status === 'submitted' ? 'text-blue-500' :
                      applicationData.status === 'under_review' ? 'text-yellow-500' :
                      'text-gray-500'
                    }`} />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${
                      applicationData.status === 'submitted' ? 'text-blue-800' :
                      applicationData.status === 'under_review' ? 'text-yellow-800' :
                      'text-gray-800'
                    }`}>
                      {applicationData.status === 'submitted' ? 'Verification Pending' :
                       applicationData.status === 'under_review' ? 'Under Review' :
                       'Application Status'}
                    </h3>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>
                        {applicationData.status === 'submitted' 
                          ? 'Your application has been submitted and is waiting for admin review. This typically takes 24-48 hours.'
                          : applicationData.status === 'under_review'
                          ? 'Your application is currently being reviewed by our admin team. You will be notified once the review is complete.'
                          : 'Your application is being processed.'
                        }
                      </p>
                      {applicationData.reviewNotes && (
                        <p className="mt-2 text-sm text-gray-600">
                          <strong>Admin Note:</strong> {applicationData.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Document Status */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-medium mb-4">Document Status</h2>
            <div className="space-y-3">
              {[
                { key: 'idProof', label: 'ID Proof' },
                { key: 'addressProof', label: 'Address Proof' },
                { key: 'policeVerification', label: 'Police Verification' },
                { key: 'passportPhoto', label: 'Passport Photo' }
              ].map((doc) => {
                const status = getDocumentStatus(doc.key);
                
                return (
                  <div key={doc.key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {status.verified ? (
                        <CheckCircleOutlineOutlined className="w-5 h-5 text-green-500 mr-2" />
                      ) : status.uploadFailed ? (
                        <ErrorOutlineOutlined className="w-5 h-5 text-red-500 mr-2" />
                      ) : status.submitted ? (
                        <CheckCircleOutlineOutlined className="w-5 h-5 text-blue-500 mr-2" />
                      ) : (
                        <CircleOutlined className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm">{doc.label}</span>
                    </div>
                    <span className={`text-xs ${
                      status.verified ? 'text-green-600' :
                      status.uploadFailed ? 'text-red-600' :
                      status.submitted ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {status.verified ? 'Verified' :
                      status.uploadFailed ? 'Upload Failed' :
                      status.submitted ? 'Submitted' :
                      'Not submitted'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons for Rejected Applications */}
          {applicationData.status === 'rejected' && (
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
                  {isResubmitting ? 'Resubmitting...' : 'Quick Resubmit'}
                </button>
                
                <button 
                  onClick={handleStartFreshApplication}
                  disabled={isResubmitting}
                  className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <AddCircleOutlineOutlined className="w-4 h-4 mr-2" />
                  {isResubmitting ? 'Creating...' : 'Start Completely Fresh'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <strong>Quick Resubmit:</strong> Resubmit your current application as-is<br />
                <strong>Edit & Improve:</strong> Modify your current application before resubmitting<br />
                <strong>Start Completely Fresh:</strong> Create a new application (keeps your documents)
              </p>
            </div>
          )}

          {/* Next Steps - Different for rejected applications */}
          {applicationData.status === 'rejected' ? (
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
                {!getDocumentStatus('policeVerification').submitted && (
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Submit police verification certificate (recommended)</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Restrictions - Hide for rejected applications */}
          {applicationData.status !== 'rejected' && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium mb-3">Restrictions During Verification</h2>
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

          {/* Update Documents - Hide for rejected applications */}
          {applicationData.status !== 'rejected' && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium mb-3">Update Documents</h2>
              <p className="text-sm text-gray-600 mb-4">
                Need to update or add missing documents? You can do that here.
              </p>
              <button 
                onClick={() => window.location.href = '/technician/apply'}
                className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="text-sm font-medium">Manage Documents</span>
              </button>
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

export default PendingTechnicianApplication