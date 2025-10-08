/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import {
  CalendarTodayOutlined,
  // AccountCircleOutlined,
  FmdGoodOutlined,
  // ChevronRightOutlined,
  StarBorderOutlined,
  Star,
} from '@mui/icons-material'
import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import { fetchTechnicianProfile } from '../api/technicianDasboardApi'

interface TechnicianProfile {
  displayName: string
  email: string
  phone: string
  services: string[]
  experienceYears: number
  workAreas: string[]
  averageRating: number
  ratingCount: number
  profilePictureUrl: string
  isVerified: boolean
  personalInfo: {
    fullName: string
    gender: string
    phoneNumber: string
    dateOfBirth: string
    address: {
      street: string
      city: string
      state: string
      pincode: string
    }
    languages: string
  }
  bio?: string
  status: string
}

interface DashboardData {
  overview: {
    upcomingBookings: number
    monthlyEarnings: number
    totalJobs: number
    averageRating: number
  }
  bookings: {
    bookings: any[]
    isNewTechnician?: boolean
  }
  earnings: {
    earnings: any[]
    isNewTechnician?: boolean
  }
  reviews: {
    reviews: any[]
    isNewTechnician?: boolean
  }
  profile: TechnicianProfile
}

export const ApprovedTechnicianDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadTechnicianData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch real technician profile from backend
        const profileResponse = await fetchTechnicianProfile()
        const profile = profileResponse.profile
        
        setDashboardData({
          overview: {
            upcomingBookings: 0, // Will be populated when bookings are implemented
            monthlyEarnings: 0,  // Will be populated when earnings are implemented
            totalJobs: 0,        // Will be populated when jobs are implemented
            averageRating: profile.averageRating || 0
          },
          bookings: {
            bookings: [],
            isNewTechnician: true
          },
          earnings: {
            earnings: [],
            isNewTechnician: true
          },
          reviews: {
            reviews: [],
            isNewTechnician: true
          },
          profile: {
            ...profile,
            status: profile.status ?? "approved",
            personalInfo: {
              fullName: profile.personalInfo?.fullName ?? '',
              gender: profile.personalInfo?.gender ?? '',
              phoneNumber: profile.personalInfo?.phoneNumber ?? '',
              dateOfBirth: profile.personalInfo?.dateOfBirth ?? '',
              address: {
                street: profile.personalInfo?.address?.street ?? '',
                city: profile.personalInfo?.address?.city ?? '',
                state: profile.personalInfo?.address?.state ?? '',
                pincode: profile.personalInfo?.address?.pincode ?? '',
              },
              languages: profile.personalInfo?.languages ?? '',
            }
          }
        })
      } catch (err) {
        console.error('Failed to load technician data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load technician profile')
        // Fallback to empty data
        setDashboardData(getEmptyDashboardData())
      } finally {
        setLoading(false)
      }
    }

    loadTechnicianData()
  }, [])

  const getEmptyDashboardData = (): DashboardData => {
    return {
      overview: {
        upcomingBookings: 0,
        monthlyEarnings: 0,
        totalJobs: 0,
        averageRating: 0
      },
      bookings: {
        bookings: [],
        isNewTechnician: true
      },
      earnings: {
        earnings: [],
        isNewTechnician: true
      },
      reviews: {
        reviews: [],
        isNewTechnician: true
      },
      profile: {
        displayName: "",
        email: "",
        phone: "",
        services: [],
        experienceYears: 0,
        workAreas: [],
        averageRating: 0,
        ratingCount: 0,
        profilePictureUrl: "",
        isVerified: false,
        status: "approved",
        personalInfo: {
          fullName: '',
          gender: '',
          phoneNumber: '',
          dateOfBirth: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
          },
          languages: ''
        }
      }
    }
  }

  const renderStars = (rating: number, filled = false) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const StarIcon = filled && i < Math.floor(rating) ? Star : StarBorderOutlined
          return (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          )
        })}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getLocation = (profile: TechnicianProfile) => {
    if (profile.personalInfo?.address?.city && profile.personalInfo?.address?.state) {
      return `${profile.personalInfo.address.city}, ${profile.personalInfo.address.state}`
    }
    if (profile.workAreas && profile.workAreas.length > 0) {
      return profile.workAreas[0]
    }
    return 'Location not set'
  }

  if (loading) {
    return (
      <>
        <Header userType='serviceProvider' isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading technician profile...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error && (!dashboardData || !dashboardData.profile.displayName)) {
    return (
      <>
        <Header userType='serviceProvider' isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!dashboardData) {
    return (
      <>
        <Header userType='serviceProvider' isApproved={true} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Failed to load dashboard data</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const { overview, profile } = dashboardData

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarTodayOutlined className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-xs text-gray-500">Upcoming</span>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="text-xl font-bold">{overview.upcomingBookings}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-green-500 text-lg mr-1">₹</span>
                    <span className="text-xs text-gray-500">This Month</span>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="text-xl font-bold">{formatCurrency(overview.monthlyEarnings)}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-purple-500 text-xs mr-1">Jobs</span>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="text-xl font-bold">{overview.totalJobs}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarBorderOutlined className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="text-xs text-gray-500">Average</span>
                  </div>
                </div>
                <div className="mt-1">
                  <div className="text-xl font-bold">{overview.averageRating.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upcoming Bookings */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <CalendarTodayOutlined className="h-4 w-4 text-blue-500 mr-2" />
                    Upcoming Bookings
                  </h3>
                </div>
                <div className="text-center py-8">
                  <CalendarTodayOutlined className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Bookings section</p>
                  <p className="text-gray-400 text-xs mt-1">Currently unavailable - Under development</p>
                </div>
              </div>

              {/* Recent Earnings */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <span className="text-green-500 text-lg mr-2">₹</span>
                    Recent Earnings
                  </h3>
                </div>
                <div className="text-center py-8">
                  <span className="text-green-500 text-2xl mx-auto mb-3">₹</span>
                  <p className="text-gray-500 text-sm">Earnings section</p>
                  <p className="text-gray-400 text-xs mt-1">Currently unavailable - Under development</p>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium flex items-center">
                  <StarBorderOutlined className="h-4 w-4 text-yellow-500 mr-2 fill-yellow-400" />
                  Recent Reviews
                </h3>
              </div>
              <div className="text-center py-8">
                <StarBorderOutlined className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Reviews section</p>
                <p className="text-gray-400 text-xs mt-1">Currently unavailable - Under development</p>
              </div>
            </div>
          </div>
        )

      case 'bookings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CalendarTodayOutlined className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bookings Section</h3>
            <p className="text-gray-500 mb-4">This section is currently being developed.</p>
            <p className="text-gray-400 text-sm">You'll be able to manage your bookings here soon.</p>
          </div>
        )

      case 'earnings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <span className="text-green-500 text-4xl mx-auto mb-4">₹</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Earnings Section</h3>
            <p className="text-gray-500 mb-4">This section is currently being developed.</p>
            <p className="text-gray-400 text-sm">Detailed earnings reports will be available here soon.</p>
          </div>
        )

      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Profile Information</h3>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                Edit Profile
              </button>
            </div>
            
            {/* Bio Section */}
            {profile.bio && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">About Me</h4>
                <p className="text-gray-600 text-sm">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Personal Details</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Full Name</dt>
                    <dd className="text-sm font-medium">
                      {profile.displayName || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Email</dt>
                    <dd className="text-sm font-medium">{profile.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Phone</dt>
                    <dd className="text-sm font-medium">{profile.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Gender</dt>
                    <dd className="text-sm font-medium">
                      {profile.personalInfo?.gender || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Date of Birth</dt>
                    <dd className="text-sm font-medium">
                      {formatDate(profile.personalInfo?.dateOfBirth || '')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Languages</dt>
                    <dd className="text-sm font-medium">
                      {profile.personalInfo?.languages || 'Not specified'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Professional Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Professional Details</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Experience</dt>
                    <dd className="text-sm font-medium">{profile.experienceYears} years</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Services</dt>
                    <dd className="text-sm font-medium">
                      {profile.services.length > 0 ? profile.services.join(', ') : 'No services specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Work Areas</dt>
                    <dd className="text-sm font-medium">
                      {profile.workAreas.length > 0 ? profile.workAreas.join(', ') : 'No work areas specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Rating</dt>
                    <dd className="text-sm font-medium">
                      {profile.averageRating.toFixed(1)} ({profile.ratingCount} reviews)
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Status</dt>
                    <dd className="text-sm font-medium">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.isVerified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {profile.isVerified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Address Section */}
            {profile.personalInfo?.address && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Street</dt>
                    <dd className="text-sm font-medium">
                      {profile.personalInfo.address.street || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">City</dt>
                    <dd className="text-sm font-medium">
                      {profile.personalInfo.address.city || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">State</dt>
                    <dd className="text-sm font-medium">
                      {profile.personalInfo.address.state || 'Not specified'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Pincode</dt>
                    <dd className="text-sm font-medium">
                      {profile.personalInfo.address.pincode || 'Not specified'}
                    </dd>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Section Under Development</h3>
            <p className="text-gray-500 mb-4">This section is currently unavailable.</p>
            <p className="text-gray-400 text-sm">Please check back later for updates.</p>
          </div>
        )
    }
  }

  return (
    <>
      <Header userType='serviceProvider' isApproved={true} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  {profile.profilePictureUrl ? (
                    <img 
                      src={profile.profilePictureUrl} 
                      alt={profile.displayName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-yellow-700 text-lg font-medium">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <h1 className="text-lg font-semibold mr-2">{profile.displayName}</h1>
                    {profile.isVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {renderStars(profile.averageRating, true)}
                      <span className="ml-1 text-sm text-gray-600">
                        {profile.averageRating.toFixed(1)} ({profile.ratingCount})
                      </span>
                    </div>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-600 flex items-center">
                      <FmdGoodOutlined className="h-3 w-3 mr-1" />
                      {getLocation(profile)}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'bookings', label: 'Bookings' },
                { id: 'earnings', label: 'Earnings' },
                { id: 'profile', label: 'Profile' },
                { id: 'settings', label: 'Settings' },
                { id: 'documents', label: 'Documents' },
                { id: 'messages', label: 'Messages' },
                { id: 'notifications', label: 'Notifications' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-4 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-3xl mx-auto px-4 py-6">
          {renderTabContent()}
        </div>
      </div>
      <Footer />
    </>
  )
}