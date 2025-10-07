import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { AdminSidebar } from '../components/AdminSidebar'
import { TechnicianProfileHeader } from '../components/technicianManagement/TechnicianProfileHeader'
import { TechnicianProfileTabs } from '../components/technicianManagement/TechnicianProfileTabs'
import { AdminActions } from '../components/technicianManagement/AdminActions'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../utils/axiosConfig'

interface TechnicianDetails {
  _id: string
  userId: string
  displayName: string
  email?: string
  phone?: string
  services: string[]
  experienceYears: number
  workAreas: string[]
  serviceRadiusKm: number
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  averageRating: number
  ratingCount: number
  totalJobs?: number
  completedJobs?: number
  ongoingJobs?: number
  totalEarnings?: number
  profilePictureUrl?: string
  createdAt: string
  updatedAt: string
  user?: {
    email: string
    phone: string
    fullName: string
    createdAt: string
  }
  personalInfo?: {
    fullName: string
    gender?: string
    phoneNumber: string
    dateOfBirth?: string
    languages?: string[]
    address?: {
      street: string
      city: string
      state: string
      pincode: string
    }
  }
  documents?: {
    aadhaarCard?: { url: string; verified: boolean }
    panCard?: { url: string; verified: boolean }
    drivingLicense?: { url: string; verified: boolean }
  }
  availability?: {
    isAvailable: boolean
    schedule: Array<{
      day: string
      slots: Array<{ start: string; end: string }>
    }>
  }
}

export const TechnicianProfile: React.FC = () => {
  const { technicianId } = useParams<{ technicianId: string }>()
  const location = useLocation()
  const [technician, setTechnician] = useState<TechnicianDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()

  // Determine active tab from URL
  const getActiveTab = () => {
    const pathSegments = location.pathname.split('/')
    return pathSegments[pathSegments.length - 1] || 'personal-info'
  }

  const activeTab = getActiveTab()

  // Determine admin actions type and availability based on technician status
 const getAdminActionsType = () => {
  if (!technician) return 'approved'
  
  // Return the actual status for proper handling
  return technician.status as 'approved' | 'pending' | 'suspended' | 'rejected'
}

  // Check if technician is currently suspended
  const isSuspended = technician?.status === 'suspended'

  const fetchTechnicianDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `${import.meta.env.VITE_BASE_URL}/technicians/${technicianId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      setTechnician(response.data.data?.technician || response.data.technician)
    } catch (error) {
      console.error('Error fetching technician details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (technicianId) {
      fetchTechnicianDetails()
    }
  }, [technicianId, token])

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading technician details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!technician) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Technicians" />
        <div className="flex-1 overflow-y-auto ml-[240px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Technician not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage="Technicians" />
      
      <div className="flex-1 overflow-y-auto ml-[240px]">
        <TechnicianProfileHeader
          name={technician.displayName}
          technicianId={technician._id.slice(-8).toUpperCase()}
          joinDate={new Date(technician.createdAt).toLocaleDateString()}
          isActive={technician.status === 'approved'}
          isApproved={technician.status === 'approved'}
          isRejected={technician.status === 'rejected'}
          isSuspended={technician.status === 'suspended'}
          rating={technician.averageRating}
          jobsCompleted={technician.completedJobs || 0}
          totalEarnings={technician.totalEarnings || 0}
          activeBookings={technician.ongoingJobs || 0}
          profilePictureUrl={technician.profilePictureUrl}
        />
        
        <TechnicianProfileTabs 
          technicianId={technicianId!}
          activeTab={activeTab}
        />

        <div className="p-6">
          {/* Suspension Banner */}
          {isSuspended && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-500 mr-3"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                  <h3 className="text-red-800 font-medium">Technician Suspended</h3>
                  <p className="text-red-600 text-sm">
                    This technician is currently suspended and cannot accept new bookings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'personal-info' && (
            <PersonalInfoTab technician={technician} isSuspended={isSuspended} />
          )}
          {activeTab === 'services-skills' && (
            <ServicesSkillsTab technician={technician} isSuspended={isSuspended} />
          )}
          {activeTab === 'verification-documents' && (
            <VerificationDocumentsTab technician={technician} isSuspended={isSuspended} />
          )}
          {activeTab === 'availability' && (
            <AvailabilityTab technician={technician} isSuspended={isSuspended} />
          )}
          {activeTab === 'earnings-jobs' && (
            <EarningsJobsTab technician={technician} isSuspended={isSuspended} />
          )}
          {activeTab === 'reviews-ratings' && (
            <ReviewsRatingsTab technician={technician} />
          )}
          {activeTab === 'active-bookings' && (
            <ActiveBookingsTab technician={technician}  />
          )}

          {/* Admin Actions - Dynamic based on status */}
          <AdminActions
            type={getAdminActionsType()}
            technicianId={technician?._id}
            technicianName={technician?.displayName || 'Technician'}
            onStatusUpdate={() => {
              // Refresh technician data
              fetchTechnicianDetails()
            }}
          />
        </div>
      </div>
    </div>
  )
}
// Personal Information Tab Component
const PersonalInfoTab: React.FC<{ technician: TechnicianDetails, isSuspended?: boolean }> = ({ technician, isSuspended }) => {

   // Helper function to get phone number from multiple possible sources
  const getPhoneNumber = () => {
    return technician.personalInfo?.phoneNumber || 
           technician.user?.phone || 
           technician.phone || 
           'Not provided';
  };

  // Helper function to format address
  const getFormattedAddress = () => {
    if (!technician.personalInfo?.address) {
      return 'Not specified';
    }
    
    const { street, city, state, pincode } = technician.personalInfo.address;
    const addressParts = [street, city, state, pincode].filter(part => part && part.trim() !== '');
    return addressParts.length > 0 ? addressParts.join(', ') : 'Not specified';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> Personal information is view-only while technician is suspended.
          </p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Personal Information</h2>
         {!isSuspended && (
        <button className="flex items-center text-blue-600 hover:text-blue-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Edit</span>
        </button>
         )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Full Name */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p className="text-sm text-gray-500">Full Name</p>
          </div>
          <p className="font-medium">
            {technician.personalInfo?.fullName || technician.displayName}
          </p>
        </div>

        {/* Gender */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4l3 3"></path>
            </svg>
            <p className="text-sm text-gray-500">Gender</p>
          </div>
          <p className="font-medium">{technician.personalInfo?.gender || 'Not specified'}</p>
        </div>

        {/* Date of Birth */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p className="text-sm text-gray-500">Date of Birth</p>
          </div>
          <p className="font-medium">
            {technician.personalInfo?.dateOfBirth 
              ? new Date(technician.personalInfo.dateOfBirth).toLocaleDateString()
              : 'Not specified'
            }
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <p className="text-sm text-gray-500">Phone Number</p>
          </div>
          <p className="font-medium">{getPhoneNumber()}</p>
        </div>

        {/* Email Address */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <p className="text-sm text-gray-500">Email Address</p>
          </div>
          <p className="font-medium">{technician.user?.email || technician.email || 'Not provided'}</p>
        </div>

        {/* Address */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <p className="text-sm text-gray-500">Address</p>
          </div>
          <p className="font-medium">
            {getFormattedAddress() }
          </p>
        </div>
      </div>

      {/* Languages Spoken */}
      {technician.personalInfo?.languages && technician.personalInfo.languages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-medium mb-4">Languages Spoken</h3>
          <div className="flex flex-wrap gap-2">
            {technician.personalInfo.languages.map((language, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm border border-gray-200"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Services & Skills Tab Component
const ServicesSkillsTab: React.FC<{ technician: TechnicianDetails, isSuspended?: boolean }> = ({ technician, isSuspended }) => {
  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      'AC Repair': 'bg-blue-100 text-blue-800 border border-blue-200',
      'AC Installation': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Refrigerator': 'bg-green-100 text-green-800 border border-green-200',
      'Washing Machine': 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      'Fan Repair': 'bg-purple-100 text-purple-800 border border-purple-200',
      'TV Repair': 'bg-pink-100 text-pink-800 border border-pink-200',
      'Microwave Oven': 'bg-orange-100 text-orange-800 border border-orange-200',
      'Water Purifier': 'bg-cyan-100 text-cyan-800 border border-cyan-200',
      'Geyser/Water Heater': 'bg-red-100 text-red-800 border border-red-200',
      'Plumbing': 'bg-teal-100 text-teal-800 border border-teal-200',
      'Electrical': 'bg-amber-100 text-amber-800 border border-amber-200',
    }
    return colors[service] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> Services are temporarily unavailable while technician is suspended.
          </p>
        </div>
      )}
      <h2 className="text-lg font-medium mb-6">Services & Skills</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Services Offered */}
        <div>
          <h3 className="text-base font-medium mb-4">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {technician.services.map((service, index) => (
              <span 
                key={index}
                className={`px-3 py-2 rounded-full text-sm font-medium ${getServiceColor(service)}`}
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Work Areas */}
        <div>
          <h3 className="text-base font-medium mb-4">Service Areas</h3>
          <div className="flex flex-wrap gap-2">
            {technician.workAreas.map((area, index) => (
              <span 
                key={index}
                className="px-3 py-2 bg-gray-100 rounded-full text-sm border border-gray-200"
              >
                {area}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Service Radius: {technician.serviceRadiusKm} km
          </p>
        </div>

        {/* Experience */}
        <div>
          <h3 className="text-base font-medium mb-4">Experience</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-800">
              {technician.experienceYears} {technician.experienceYears === 1 ? 'Year' : 'Years'}
            </p>
            <p className="text-blue-600 text-sm">Professional Experience</p>
          </div>
        </div>

        {/* Service Statistics */}
        <div>
          <h3 className="text-base font-medium mb-4">Service Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Jobs Completed</span>
              <span className="font-medium">{technician.completedJobs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ongoing Jobs</span>
              <span className="font-medium">{technician.ongoingJobs || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Success Rate</span>
              <span className="font-medium text-green-600">
                {technician.completedJobs && technician.totalJobs 
                  ? `${Math.round((technician.completedJobs / technician.totalJobs) * 100)}%`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Other Tab Components (Verification, Availability, Earnings, Reviews, Bookings)
const VerificationDocumentsTab: React.FC<{ technician: TechnicianDetails, isSuspended?: boolean }> = ({ technician, isSuspended }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
       {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> Document verification status is view-only while technician is suspended.
          </p>
        </div>
      )}
      <h2 className="text-lg font-medium mb-6">Verification & Documents</h2>
      <div className="space-y-6">
        {/* Document Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3">Aadhaar Card</h3>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs ${
                technician.documents?.aadhaarCard?.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {technician.documents?.aadhaarCard?.verified ? 'Verified' : 'Pending'}
              </span>
              {technician.documents?.aadhaarCard?.url && (
                <a 
                  href={technician.documents.aadhaarCard.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Document
                </a>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium mb-3">PAN Card</h3>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs ${
                technician.documents?.panCard?.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {technician.documents?.panCard?.verified ? 'Verified' : 'Pending'}
              </span>
              {technician.documents?.panCard?.url && (
                <a 
                  href={technician.documents.panCard.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Document
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Overall Verification Status</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Account Status</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                technician.status === 'approved' 
                  ? 'bg-green-100 text-green-800'
                  : technician.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {technician.status.charAt(0).toUpperCase() + technician.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const AvailabilityTab: React.FC<{ technician: TechnicianDetails, isSuspended?: boolean }> = ({ technician, isSuspended }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Availability</h2>
      <div className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Current Availability</p>
            <p className="text-sm text-gray-600">
              {isSuspended 
                ? 'Not available due to suspension' 
                : technician.availability?.isAvailable 
                  ? 'Available for bookings' 
                  : 'Not available'
              }
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            technician.availability?.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isSuspended ? 'Suspended' : (technician.availability?.isAvailable ? 'Available' : 'Unavailable')}
          </span>
        </div>

        {/* Weekly Schedule */}
        {technician.availability?.schedule && (
          <div>
            <h3 className="font-medium mb-4">Weekly Schedule</h3>
            <div className="space-y-2">
              {technician.availability.schedule.map((daySchedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="font-medium capitalize">{daySchedule.day}</span>
                  <div className="text-sm text-gray-600">
                    {daySchedule.slots.length > 0 
                      ? daySchedule.slots.map(slot => `${slot.start} - ${slot.end}`).join(', ')
                      : 'Not available'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const EarningsJobsTab: React.FC<{ technician: TechnicianDetails, isSuspended?: boolean }> = ({ technician, isSuspended }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> No new earnings while technician is suspended.
          </p>
        </div>
      )}
      <h2 className="text-lg font-medium mb-6">Earnings & Jobs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-2xl font-bold text-green-800">
            ₹{technician.totalEarnings?.toLocaleString() || '0'}
          </p>
          <p className="text-green-600 text-sm">Total Earnings</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-2xl font-bold text-blue-800">{technician.totalJobs || 0}</p>
          <p className="text-blue-600 text-sm">Total Jobs</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-2xl font-bold text-purple-800">{technician.completedJobs || 0}</p>
          <p className="text-purple-600 text-sm">Completed Jobs</p>
        </div>
      </div>
    </div>
  )
}

const ReviewsRatingsTab: React.FC<{ technician: TechnicianDetails }> = ({ technician }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          i < Math.floor(rating) ? (
            <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg key={i} className="h-5 w-5 text-gray-300" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Reviews & Ratings</h2>
      
      {/* Rating Overview */}
      <div className="flex items-center space-x-6 mb-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{technician.averageRating.toFixed(1)}</p>
          <div className="flex justify-center mt-1">
            {renderStars(technician.averageRating)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {technician.ratingCount} {technician.ratingCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          Detailed reviews and ratings will be displayed here as customers provide feedback.
        </p>
      </div>
    </div>
  )
}

const ActiveBookingsTab: React.FC<{ technician: TechnicianDetails }> = ({ technician }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Active Bookings</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-2">
          {technician.ongoingJobs && technician.ongoingJobs > 0 
            ? `${technician.ongoingJobs} active ${technician.ongoingJobs === 1 ? 'booking' : 'bookings'}`
            : 'No active bookings'
          }
        </p>
        <p className="text-sm text-gray-500">
          Detailed booking information and scheduling will be displayed here.
        </p>
      </div>
    </div>
  )
}

export default TechnicianProfile