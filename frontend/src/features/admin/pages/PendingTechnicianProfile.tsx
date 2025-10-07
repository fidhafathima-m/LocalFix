import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminSidebar } from '../components/AdminSidebar'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../utils/axiosConfig'
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { AdminActions } from '../components/technicianManagement/AdminActions'

interface DocumentInfo {
  url: string
  verified?: boolean
  type?: string
  uploadedAt?: string
}

interface PendingApplication {
  _id: string
  technicianId: string
  email: string
  profilePictureUrl?: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  personal: {
    fullName?: string
    phoneNumber?: string
    email?: string
    gender?: string
    dateOfBirth?: string
    address?: {
      street?: string
      city?: string
      state?: string
      pincode?: string
    }
  }
  skills: {
    services?: string[]
    yearsOfExperience?: number
    bio?: string
    
  },
  availability: {
    serviceAreas?: string[]
    workRadius?: string
  }
  documents?: Record<string, DocumentInfo>
  submittedAt?: string
  createdAt: string
}

export const PendingApplicationProfile: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>()
  const [application, setApplication] = useState<PendingApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(
          `${import.meta.env.VITE_BASE_URL}/technicians/applications/${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        
        // Handle different response structures
        const applicationData = response.data.data?.application || 
                               response.data.application || 
                               response.data.data ||
                               response.data;
        
        console.log('Application data:', applicationData); // Debug log
        console.log('Documents data:', applicationData?.documents); // Debug documents
        setApplication(applicationData);
        
      } catch (error) {
        console.error('Error fetching application details:', error)
      } finally {
        setLoading(false)
      }
    }

    if (applicationId) {
      fetchApplicationDetails()
    }
  }, [applicationId, token])

  // Function to get profile picture URL from documents
  const getProfilePictureUrl = () => {
    if (application?.profilePictureUrl) {
      return application.profilePictureUrl;
    }
    
    // Check for passport photo in documents
    if (application?.documents?.passportPhoto?.url) {
      return application.documents.passportPhoto.url;
    }
    
    // Check for profile photo in documents
    if (application?.documents?.profilePhoto?.url) {
      return application.documents.profilePhoto.url;
    }
    
    return null;
  }

  // Function to get all available documents dynamically
const getAvailableDocuments = () => {
  if (!application?.documents) return [];

const documentTypes: Record<string, string> = {
  // Map backend field names to display names
  'idProof': 'ID Proof',
  'addressProof': 'Address Proof',
  'passportPhoto': 'Passport Photo',
  'profilePhoto': 'Profile Photo',
  'policeVerification': 'Police Verification',
  'tradeLicense': 'Trade License',
  'certifications': 'Certifications',
  'drivingLicense': 'Driving License',
  'voterId': 'Voter ID',
  'passport': 'Passport',
  'aadhaar': 'Aadhaar Card',
  'nationalId': 'National ID'
};

  // Document types that should ALWAYS be treated as PDFs
const pdfDocumentTypes = ['idProof', 'addressProof', 'policeVerification', 'drivingLicense', 'tradeLicense', 'certifications'];
  
  // Document types that should ALWAYS be treated as images
  const imageDocumentTypes = ['passportPhoto', 'profilePhoto'];

  return Object.entries(application.documents)
    .filter(([, doc]) => doc && doc.url && typeof doc.url === 'string' && doc.url.trim() !== '')
    .map(([key, doc]) => {
      // Determine file type based on document type and URL analysis
      let isPdf = false;
      let isImage = false;

      // Method 1: Check by document type (most reliable)
      if (pdfDocumentTypes.includes(key)) {
        isPdf = true;
      } else if (imageDocumentTypes.includes(key)) {
        isImage = true;
      } 
      // Method 2: Check Cloudinary URL structure
      else if (doc.url.includes('/raw/upload/')) {
        isPdf = true; // Cloudinary raw uploads are typically PDFs
      } else if (doc.url.includes('/image/upload/')) {
        isImage = true; // Cloudinary image uploads are images
      }
      // Method 3: Check file extension as fallback
      else if (doc.url.toLowerCase().match(/\.(pdf)$/)) {
        isPdf = true;
      } else if (doc.url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        isImage = true;
      }

      // Default to PDF for unknown types to be safe
      const fileTypeIsPdf = isPdf || (!isImage && !isPdf);

      let finalUrl = doc.url;
      if (isPdf && !doc.url.toLowerCase().endsWith('.pdf')) {
        finalUrl = `${doc.url}.pdf`;
      }

      return {
        key,
        displayName: documentTypes[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        url: finalUrl,
        verified: doc.verified || false,
        type: doc.type || key,
        isPdf: fileTypeIsPdf,
        uploadedAt: doc.uploadedAt
      };
    });
};

// Function to handle document viewing with Cloudinary-specific handling
const handleViewDocument = (url: string, isPdf: boolean, docName: string) => {
  if (isPdf) {
    // For Cloudinary PDFs (raw uploads), we need to force download behavior
    const link = document.createElement('a');
    
    // Add download parameter to Cloudinary URL to force PDF download
    const separator = url.includes('?') ? '&' : '?';
    const downloadUrl = `${url}${separator}flags=attachment`;
    
    link.href = downloadUrl;
    link.download = `${docName.replace(/\s+/g, '_')}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } else {
    // For images, open directly in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};


  // Function to get file type icon
  const getFileIcon = (isPdf: boolean) => {
    return isPdf ? <PictureAsPdfOutlinedIcon className="h-5 w-5 text-red-500" /> : <ImageOutlinedIcon className="h-5 w-5 text-blue-500" />;
  };

  const availableDocuments = getAvailableDocuments();
  const profilePictureUrl = getProfilePictureUrl();

  if (loading) {
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
    )
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
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage="Technicians" />
      
      <div className="flex-1 overflow-y-auto ml-[240px]">
        {/* Fixed Back Button - Moved outside the main content area */}
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
                    alt={application.personal?.fullName || 'Applicant'}
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
                  {application.personal?.fullName || 'Applicant'}
                </h1>
                <p className="text-gray-600">Pending Technician Application</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                application.status === 'submitted' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : application.status === 'under_review'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-6">Application Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-base font-medium mb-4">Personal Information</h3>
                <div className="space-y-4">
                  

                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{application.personal?.fullName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{application.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{application.personal?.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{application.personal?.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {application.personal?.dateOfBirth 
                        ? new Date(application.personal.dateOfBirth).toLocaleDateString()
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills & Services */}
              <div>
                <h3 className="text-base font-medium mb-4">Skills & Services</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{application.skills?.yearsOfExperience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Services</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.skills?.services?.map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {service}
                        </span>
                      )) || 'No services specified'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Service Areas</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.availability?.serviceAreas?.map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {area}
                        </span>
                      )) || 'No areas specified'}
                    </div>
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

              {/* Dynamic Documents Section */}
              <div className="md:col-span-2">
                <h3 className="text-base font-medium mb-4">
                  Documents ({availableDocuments.length} provided)
                </h3>
                
                {availableDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableDocuments.map((doc) => (
                      <div key={doc.key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(doc.isPdf)}
                            <h4 className="font-medium text-gray-800">{doc.displayName}</h4>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            doc.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {doc.verified ? 'Verified' : 'Submitted'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {doc.isPdf ? 'PDF Document' : 'Image'}
                            </span>
                            <button
                              onClick={() => handleViewDocument(doc.url, doc.isPdf, doc.displayName)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 cursor-pointer"
                            >
                              <span>{doc.isPdf ? 'View PDF' : 'View Image'}</span>
                            </button>
                          </div>
                          
                          {doc.uploadedAt && (
                            <div className="text-xs text-gray-400">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Application ID</p>
                  <p className="font-medium">{application._id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted On</p>
                  <p className="font-medium">
                    {application.submittedAt 
                      ? new Date(application.submittedAt).toLocaleDateString()
                      : 'Not submitted'
                    }
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
              applicationId={application?._id}
              technicianName={application?.personal?.fullName || 'Applicant'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}