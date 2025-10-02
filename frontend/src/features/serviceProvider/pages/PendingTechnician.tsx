import React, { useEffect, useState } from 'react'
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
} from '@mui/icons-material';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

interface DocumentStatus {
  verified: boolean;
  submitted?: boolean; 
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
  documents: {
    idProof?: DocumentStatus,
    addressProof?: DocumentStatus,
    policeVerification?: DocumentStatus,
    passportPhoto?: DocumentStatus,
  },
  submittedAt?: string,
  reviewNotes?: string,
  createdAt: string,
  updatedAt: string
}

// Update the TechnicianData interface in your frontend component
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

export const PendingTechnicianApplication: React.FC = () => {
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [technicianData, setTechnicianData] = useState<TechnicianData | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token} = useAuth();

  // Fixed function name - was declared as fetchTechnicianData but used as fetchApplicationData
  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const applicationId = localStorage.getItem("applicationId");
      
      if (!applicationId) {
        setError("No application found");
        setLoading(false);
        return;
      }

      // Check application status first
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
        
        // If application is draft, redirect to application form
        if (appData.status === 'draft') {
          window.location.href = '/technician/apply';
          return;
        }
        
        setApplicationData(appData);
        setApplicationStatus(appData.status);
        
        // If application is approved, try to fetch technician data
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
    } catch (error) {
      console.error("Error fetching application data:", error);
      setError("Failed to load application data");
    } finally {
      setLoading(false);
    }
  };

 // In your new PendingTechnicianApplication component - fix the useEffect
useEffect(() => {
  const checkApplicationStatus = async () => {
    // Instead of just checking localStorage, check if user has a submitted application
    try {
      setLoading(true);
      
      // First, try to get applicationId from localStorage (for draft applications)
      const applicationId = localStorage.getItem("applicationId");
      
      if (applicationId) {
        await fetchApplicationData();
        return;
      }
      
      // If no applicationId in localStorage, check if user has any applications
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
        // Store the applicationId for future use
        localStorage.setItem("applicationId", latestApplication._id);
        setApplicationData(latestApplication);
        setApplicationStatus(latestApplication.status);
        
        // Redirect based on status
        if (latestApplication.status === 'draft') {
          window.location.href = '/technician/apply';
          return;
        }
      } else {
        // No applications found, redirect to apply
        window.location.href = '/technician/apply';
        return;
      }
    } catch (error) {
      console.error("Error checking application status:", error);
      setError("Failed to load application data");
    } finally {
      setLoading(false);
    }
  };

  checkApplicationStatus();
}, []);

  const getApplicationDate = () => {
    if (!applicationData) return 'N/A';
    
    const date = applicationData.submittedAt || applicationData.createdAt;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const getDocumentStatus = (documentType: string): DocumentStatus => {
  if (!applicationData?.documents) return { verified: false, submitted: false };
  
  // Check if we have the document status object
  const docStatus = applicationData.documents[documentType as keyof typeof applicationData.documents];
  
  console.log(`📄 ${documentType} status:`, docStatus);
  
  if (!docStatus) {
    return { verified: false, submitted: false };
  }
  
  // Return the status directly if it already has the structure
  return {
    verified: docStatus.verified || false,
    submitted: docStatus.submitted !== undefined ? docStatus.submitted : (docStatus.verified || false)
  };
};

// Add this debug useEffect
useEffect(() => {
  if (applicationData) {
    console.log("🔍 DEBUG - Application Data:", applicationData);
    console.log("🔍 DEBUG - Documents Structure:", applicationData.documents);
    
    // Check each document individually
    ['idProof', 'addressProof', 'policeVerification', 'passportPhoto'].forEach(docType => {
      const doc = applicationData.documents[docType as keyof typeof applicationData.documents];
      console.log(`🔍 DEBUG - ${docType}:`, doc);
    });
  }
}, [applicationData]);

  const getVerificationProgress = () => {
    if (!applicationData) return 0;
    
    const completedSteps = applicationData.stepsCompleted || [];
    const totalSteps = 8; // Total steps in your application
    
    return Math.round((completedSteps.length / totalSteps) * 100);
  };

  // If application is approved and technician data exists, redirect to technician dashboard
  if (applicationStatus === 'approved' && technicianData) {
    window.location.href = '/technician/dashboard';
    return null;
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AccessTimeOutlined className="w-3 h-3 mr-1" />
                    {applicationData.status === 'submitted' ? 'Pending Verification' : 
                     applicationData.status === 'under_review' ? 'Under Review' : 
                     applicationData.status.charAt(0).toUpperCase() + applicationData.status.slice(1)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => window.location.href = '/technician/apply'}
                className="text-blue-500 flex items-center text-sm font-medium"
              >
                <EditOutlined className="w-4 h-4 mr-1" />
                Edit Application
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Application Date: {getApplicationDate()}
              </p>
              <p className="text-sm text-gray-500">
                Phone: {applicationData.personal?.phoneNumber || applicationData.phone}
              </p>
              <p className="text-sm text-gray-500">
                Progress: {getVerificationProgress()}% Complete
              </p>
            </div>
          </div>

          {/* Application Status */}
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
                const isSubmitted = status.submitted !== undefined ? status.submitted : status.verified;
                
                return (
                  <div key={doc.key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {status.verified ? (
                        <CheckCircleOutlineOutlined className="w-5 h-5 text-green-500 mr-2" />
                      ) : isSubmitted ? (
                        <AccessTimeOutlined className="w-5 h-5 text-yellow-500 mr-2" />
                      ) : (
                        <CircleOutlined className="w-5 h-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm">{doc.label}</span>
                    </div>
                    <span className={`text-xs ${
                      status.verified ? 'text-green-600' :
                      isSubmitted ? 'text-yellow-600' :
                      'text-gray-500'
                    }`}>
                      {status.verified ? 'Verified' :
                      isSubmitted ? 'Pending' : 'Not submitted'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-medium mb-3">Next Steps:</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">-</span>
                <span>Wait for admin verification (24-48 hours)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">-</span>
                <span>Keep your phone available for verification calls</span>
              </li>
              {!getDocumentStatus('policeVerification').submitted && (
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">-</span>
                  <span>Submit police verification certificate (recommended)</span>
                </li>
              )}
            </ul>
          </div>

          {/* Restrictions */}
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

          {/* Update Documents */}
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