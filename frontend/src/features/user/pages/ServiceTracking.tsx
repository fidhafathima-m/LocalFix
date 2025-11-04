import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowBackIosNewOutlined,
  BuildOutlined,
  QueryBuilderOutlined,
  LocationOnOutlined,
  LocalPhoneOutlined,
  ChatBubbleOutlineOutlined,
  CheckCircleOutlineOutlined,
  LocalShippingOutlined,
  StarBorderOutlined,
  NavigationOutlined,
  PersonOutlined,
  RefreshOutlined,
} from '@mui/icons-material'
import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import { trackingService } from '../../../services/user/trackingService'
import { type ServiceTracking } from '../../../interface/user/ITracking'
import toast from 'react-hot-toast'

const ServiceTracking: React.FC = () => {
  const navigate = useNavigate()
  const { bookingId } = useParams<{ bookingId: string }>()
  const [trackingData, setTrackingData] = useState<ServiceTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (bookingId) {
      fetchTrackingData()
    }
  }, [bookingId])

  const fetchTrackingData = async () => {
    try {
      setLoading(true)
      const response = await trackingService.getTrackingDetails(bookingId!)
      
      if (response.success && response.data) {
        setTrackingData(response.data)
      } else {
        toast.error('Failed to fetch tracking details')
        navigate('/bookings')
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error)
      toast.error('Failed to load tracking information')
      navigate('/bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchTrackingData()
    setRefreshing(false)
  }

  const handleCallTechnician = () => {
    if (trackingData?.technicianId.phone) {
      window.open(`tel:${trackingData.technicianId.phone}`, '_self')
    } else {
      toast.error('Technician phone number not available')
    }
  }

  const handleMessageTechnician = () => {
    // In a real app, this would open a chat interface
    toast.success('Messaging feature coming soon!')
  }

  const handleContactSupport = () => {
    navigate('/contact')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot
      .split(' - ')
      .map(time => time.replace(/(:\d{2})(?::\d{2})? (AM|PM)/, '$1 $2'))
      .join(' - ')
  }

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-gray-200', icon: CheckCircleOutlineOutlined, textColor: 'text-gray-400' },
      accepted: { color: 'bg-green-100', icon: CheckCircleOutlineOutlined, textColor: 'text-green-600' },
      assigned: { color: 'bg-blue-100', icon: LocalShippingOutlined, textColor: 'text-blue-600' },
      on_the_way: { color: 'bg-blue-100', icon: LocalShippingOutlined, textColor: 'text-blue-600' },
      in_progress: { color: 'bg-orange-100', icon: BuildOutlined, textColor: 'text-orange-600' },
      completed: { color: 'bg-green-100', icon: CheckCircleOutlineOutlined, textColor: 'text-green-600' },
      cancelled: { color: 'bg-red-100', icon: CheckCircleOutlineOutlined, textColor: 'text-red-600' }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getStatusDisplayText = (status: string) => {
    const statusText = {
      pending: 'Booking Confirmed',
      accepted: 'Booking Accepted',
      assigned: 'Technician Assigned',
      on_the_way: 'Technician on the way',
      in_progress: 'Service in progress',
      completed: 'Service Completed',
      cancelled: 'Service Cancelled'
    }
    return statusText[status as keyof typeof statusText] || status
  }

  const isStatusCompleted = (status: string, currentStatus: string) => {
    const statusOrder = ['pending', 'accepted', 'assigned', 'on_the_way', 'in_progress', 'completed']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const statusIndex = statusOrder.indexOf(status)
    return statusIndex <= currentIndex
  }

  const isStatusActive = (status: string, currentStatus: string) => {
    return status === currentStatus
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tracking information...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildOutlined className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Tracking Not Found</h2>
            <p className="text-gray-600 mb-6">Unable to find tracking information for this booking.</p>
            <button
              onClick={() => navigate('/bookings')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View My Bookings
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowBackIosNewOutlined className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-semibold disabled:opacity-50"
          >
            <RefreshOutlined className="w-5 h-5" />
            Refresh
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Tracking Service</h1>
          <span className="text-sm text-gray-600">Booking ID: {trackingData.bookingId}</span>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Service Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <BuildOutlined className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <div className="font-semibold text-lg">{trackingData.serviceName}</div>
                  <div className="text-gray-600">{trackingData.problemDescription || 'Standard service'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <QueryBuilderOutlined className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <div className="font-semibold">
                    {formatDate(trackingData.scheduledAt)}, {formatTimeSlot(trackingData.timeSlot)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated service time: {trackingData.estimatedDuration || '1-2 hours'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LocationOnOutlined className="w-5 h-5 text-gray-600 mt-1" />
                <div>
                  <div className="font-semibold">
                    {trackingData.address.street}, {trackingData.address.city}
                  </div>
                  <div className="text-sm text-gray-600">{trackingData.address.label}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Technician</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {trackingData.technicianId.profilePictureUrl ? (
                    <img
                      src={trackingData.technicianId.profilePictureUrl}
                      alt={trackingData.technicianId.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <PersonOutlined className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">{trackingData.technicianId.displayName}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{trackingData.technicianId.averageRating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{trackingData.technicianId.ratingCount} reviews</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={handleCallTechnician}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <LocalPhoneOutlined className="w-4 h-4" />
                  Call Technician
                </button>
                <button 
                  onClick={handleMessageTechnician}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  <ChatBubbleOutlineOutlined className="w-4 h-4" />
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Service Status</h2>
          <div className="space-y-6">
            {['pending', 'accepted', 'assigned', 'on_the_way', 'in_progress', 'completed'].map((status, index) => {
              const isCompleted = isStatusCompleted(status, trackingData.status)
              const isActive = isStatusActive(status, trackingData.status)
              const statusConfig = getStatusConfig(status)
              const StatusIcon = statusConfig.icon
              const statusHistory = trackingData.statusHistory.find(sh => sh.status === status)
              
              return (
                <div key={status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? statusConfig.color : 'bg-gray-200'
                    }`}>
                      <StatusIcon className={`w-6 h-6 ${
                        isCompleted ? statusConfig.textColor : 'text-gray-400'
                      }`} />
                    </div>
                    {index < 5 && (
                      <div className={`w-0.5 h-16 my-2 ${
                        isCompleted ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <div className={`flex-1 pb-6 ${isActive ? 'text-current' : 'text-gray-400'}`}>
                    <h3 className={`font-semibold mb-1 ${isActive ? '' : 'text-gray-400'}`}>
                      {getStatusDisplayText(status)}
                    </h3>
                    <p className="text-sm mb-1">
                      {statusHistory?.description || getDefaultStatusDescription(status)}
                    </p>
                    {statusHistory && (
                      <p className="text-xs text-gray-500">
                        {formatDate(statusHistory.timestamp)}, {formatTime(statusHistory.timestamp)}
                      </p>
                    )}
                    {isActive && status === 'on_the_way' && trackingData.estimatedArrival && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                        <p className="font-semibold text-blue-900 mb-1">
                          Estimated arrival in {trackingData.estimatedArrival}
                        </p>
                        {trackingData.distance && (
                          <p className="text-sm text-blue-800">
                            The technician is {trackingData.distance.toFixed(1)} km away from your location
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Tracking */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Live Tracking</h2>
          <div className="bg-blue-50 rounded-lg h-64 flex flex-col items-center justify-center mb-4">
            <NavigationOutlined className="w-12 h-12 text-blue-600 mb-3" />
            <p className="text-gray-600">
              {trackingData.status === 'on_the_way' ? 'Live tracking active' : 'Live tracking will start when technician is on the way'}
            </p>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <LocationOnOutlined className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold">
                {trackingData.address.street}, {trackingData.address.city}
              </div>
              <div className="text-sm text-gray-600">{trackingData.address.label}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            My Orders
          </button>
          <button 
            onClick={handleContactSupport}
            className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Helper function for default status descriptions
function getDefaultStatusDescription(status: string): string {
  const descriptions = {
    pending: 'Your booking has been confirmed and is waiting for technician assignment.',
    accepted: 'Your booking has been accepted and a technician will be assigned soon.',
    assigned: 'A technician has been assigned to your service request.',
    on_the_way: 'The technician is on the way to your location.',
    in_progress: 'The technician is currently working on your service.',
    completed: 'The service has been completed successfully.'
  }
  return descriptions[status as keyof typeof descriptions] || 'Status updated'
}

export default ServiceTracking