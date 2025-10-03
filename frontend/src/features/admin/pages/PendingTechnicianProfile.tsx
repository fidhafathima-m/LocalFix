import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminSidebar } from '../components/AdminSidebar'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../utils/axiosConfig'
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';


interface PendingApplication {
  _id: string
  technicianId: string
  email: string
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
    serviceAreas?: string[]
    workRadius?: string
  }
  documents?: {
    aadhaarCard?: { url: string; verified: boolean }
    panCard?: { url: string; verified: boolean }
    passportPhoto?: { url: string }
  }
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
        
        setApplication(response.data.data?.application || response.data.application)
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="mb-6">
        <Link
          to="/admin/technician-management"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeftOutlinedIcon />
          <span className="ml-1">Back to Technicians</span>
        </Link>
      </div>
    <div className="flex h-screen bg-gray-50">

        
      <AdminSidebar activePage="Technicians" />
      
      <div className="flex-1 overflow-y-auto ml-[240px]">
        <div className="bg-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {application.personal?.fullName || 'Applicant'}
              </h1>
              <p className="text-gray-600">Pending Technician Application</p>
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
                <div className="space-y-3">
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
                      {application.skills?.serviceAreas?.map((area, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {area}
                        </span>
                      )) || 'No areas specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {application.documents && (
                <div className="md:col-span-2">
                  <h3 className="text-base font-medium mb-4">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.documents.aadhaarCard && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Aadhaar Card</h4>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs ${
                            application.documents.aadhaarCard.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.documents.aadhaarCard.verified ? 'Verified' : 'Pending'}
                          </span>
                          <a 
                            href={application.documents.aadhaarCard.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {application.documents.panCard && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">PAN Card</h4>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs ${
                            application.documents.panCard.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.documents.panCard.verified ? 'Verified' : 'Pending'}
                          </span>
                          <a 
                            href={application.documents.panCard.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
          </div>
        </div>
      </div>
    </div>
    </>
  )
}