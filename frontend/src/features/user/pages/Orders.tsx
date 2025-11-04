import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  FmdGoodOutlined,
  CreditCardOutlined,
  StarBorderOutlined,
  CheckCircleOutlineOutlined,
  CancelOutlined,
  LocalShippingOutlined,
  PersonOutlined,
  RefreshOutlined,
} from '@mui/icons-material'
import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
import { orderService } from '../../../services/user/orderService'
import { type OrderResponse } from '../../../services/user/orderService'
import { useAppSelector } from '../../../hooks/redux'
import { selectUser } from '../../../store/slices/authSlice'
import toast from 'react-hot-toast'

const MyOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useAppSelector(selectUser)
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderService.getUserOrders()
      
      if (response.success && response.data) {
        setOrders(response.data.orders)
      } else {
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
      pending: { color: 'text-gray-600', icon: AccessTimeOutlined, text: 'Pending' },
      confirmed: { color: 'text-green-600', icon: CheckCircleOutlineOutlined, text: 'Confirmed' },
      in_progress: { color: 'text-blue-600', icon: LocalShippingOutlined, text: 'In Progress' },
      on_the_way: { color: 'text-blue-600', icon: LocalShippingOutlined, text: 'Technician on the way' },
      completed: { color: 'text-green-600', icon: CheckCircleOutlineOutlined, text: 'Completed' },
      cancelled: { color: 'text-red-600', icon: CancelOutlined, text: 'Cancelled' },
      refunded: { color: 'text-red-600', icon: CancelOutlined, text: 'Refunded' }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const getActiveOrders = () => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'in_progress', 'on_the_way'].includes(order.status)
    )
  }

  const getHistoryOrders = () => {
    return orders.filter(order => 
      ['completed', 'cancelled', 'refunded'].includes(order.status)
    )
  }

  const handleCancelOrder = async (orderId: string) => {
    navigate(`/cancel-order/${orderId}`)
  }

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const blob = await orderService.downloadInvoice(orderId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLeaveReview = (orderId: string) => {
    // Navigate to review page or open review modal
    toast.success('Review feature coming soon!')
  }

  const handleBookAgain = (technicianId: string, serviceName: string) => {
    // Navigate to booking page with pre-filled technician and service
    toast.success(`Redirecting to book ${serviceName} again`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const activeOrders = getActiveOrders()
  const historyOrders = getHistoryOrders()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchOrders}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              <RefreshOutlined className="w-5 h-5" />
              Refresh
            </button>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Book New Service
            </Link>
          </div>
        </div>

        <div className="flex gap-8 border-b mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-1 font-semibold transition-colors relative ${activeTab === 'active' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2">
              <LocalShippingOutlined className="w-5 h-5" />
              Active Orders ({activeOrders.length})
            </div>
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-1 font-semibold transition-colors relative ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2">
              <AccessTimeOutlined className="w-5 h-5" />
              Order History ({historyOrders.length})
            </div>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LocalShippingOutlined className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link
              to="/services"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Book Your First Service
            </Link>
          </div>
        ) : activeTab === 'active' ? (
          <div className="space-y-6">
            {activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleOutlineOutlined className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Active Orders</h2>
                <p className="text-gray-600 mb-6">You don't have any active orders at the moment.</p>
                <Link
                  to="/services"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                >
                  Book a Service
                </Link>
              </div>
            ) : (
              activeOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                    {/* ... existing order display code ... */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-semibold">{statusConfig.text}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Order ID: {order.orderCode}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{order.serviceName}</h3>
                        <p className="text-gray-600 mb-4">{order.problemDescription || 'Standard service'}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <CalendarTodayOutlined className="w-4 h-4" />
                            <span>Date</span>
                            <span className="ml-auto">{formatDate(order.scheduledAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <AccessTimeOutlined className="w-4 h-4" />
                            <span>Time Slot</span>
                            <span className="ml-auto">{formatTimeSlot(order.timeSlot)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <FmdGoodOutlined className="w-4 h-4" />
                            <span>Address</span>
                            <span className="ml-auto">{order.address.street}, {order.address.city}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <CreditCardOutlined className="w-4 h-4" />
                            <span>Payment</span>
                            <span className="ml-auto">
                              ₹{order.totalAmount} • {order.payment.method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Technician</h3>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            {order.technicianId.profilePictureUrl ? (
                              <img
                                src={order.technicianId.profilePictureUrl}
                                alt={order.technicianId.displayName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <PersonOutlined className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{order.technicianId.displayName}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{order.technicianId.averageRating.toFixed(1)}</span>
                              <span>•</span>
                              <span>{order.technicianId.ratingCount} reviews</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      {order.status === 'on_the_way' && (
                        <Link
                          to={`/service-tracking/${order.bookingId}`}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Track Service
                        </Link>
                      )}
                      
                      {['pending', 'confirmed'].includes(order.status) && (
                        <>
                          <button className="border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancelOrder(order._id)}
                            className="text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {historyOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AccessTimeOutlined className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Orders Yet Completed</h2>
                <p className="text-gray-600 mb-6">You don't have any completed orders in your history yet.</p>
                <Link
                  to="/services"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                >
                  Book a Service
                </Link>
              </div>
            ) : (
              historyOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-semibold">{statusConfig.text}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      Order ID: {order.orderCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{order.serviceName}</h3>
                      <p className="text-gray-600 mb-4">{order.problemDescription || 'Standard service'}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <CalendarTodayOutlined className="w-4 h-4" />
                          <span>Date</span>
                          <span className="ml-auto">{formatDate(order.scheduledAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <AccessTimeOutlined className="w-4 h-4" />
                          <span>Time Slot</span>
                          <span className="ml-auto">{formatTimeSlot(order.timeSlot)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <FmdGoodOutlined className="w-4 h-4" />
                          <span>Address</span>
                          <span className="ml-auto">{order.address.street}, {order.address.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <CreditCardOutlined className="w-4 h-4" />
                          <span>Payment</span>
                          <span className="ml-auto">
                            ₹{order.totalAmount} • {order.payment.method === 'online' ? 'Online Payment' : 'Cash on Delivery'}
                            {order.status === 'cancelled' && order.payment.method === 'online' && ' (Refunded)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Technician</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {order.technicianId.profilePictureUrl ? (
                            <img
                              src={order.technicianId.profilePictureUrl}
                              alt={order.technicianId.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <PersonOutlined className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{order.technicianId.displayName}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{order.technicianId.averageRating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{order.technicianId.ratingCount} reviews</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.status === 'completed' && (
                    <div className="flex justify-between items-center mt-6 pt-6 border-t">
                      <button 
                        onClick={() => handleDownloadInvoice(order._id)}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Download Invoice
                      </button>
                      <div className="flex gap-3">
                        {!order.technicianRating && (
                          <button 
                            onClick={() => handleLeaveReview(order._id)}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            Leave Review
                          </button>
                        )}
                        <button 
                          onClick={() => handleBookAgain(order.technicianId._id, order.serviceName)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Book Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                )
              })
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default MyOrders