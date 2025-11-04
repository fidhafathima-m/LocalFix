import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminSidebar } from '../adminDashboard/actions/AdminSidebar'
import { OrderManagementService } from '../../../../services/admin/OrderManagementService';

export interface OrderResponseDto {
  _id: string;
  orderCode: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  technicianId: {
    _id: string;
    displayName: string;
    profilePictureUrl?: string;
  };
  serviceName: string;
  problemDescription: string;
  scheduledAt: string;
  timeSlot: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  status: 'pending' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';
  payment: {
    method: 'online' | 'cod';
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: string;
  };
  totalAmount: number;
  orderItems: Array<{
    _id: string;
    customName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    status: string;
  }>;
  history: Array<{
    status: string;
    description: string;
    updatedBy: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface OrderHistory {
  status: string;
  description: string;
  updatedBy: string;
  timestamp: string;
}

interface OrderItem {
  _id: string;
  customName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  status: string;
}

interface Address {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const ViewOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        const response = await OrderManagementService.getOrderById(id)
        const orderData = response.order || response

        console.log('Fetched order data:', orderData)
        setOrder(orderData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch order details')
        console.error('Error fetching order:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return 'Invalid Date'
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting time:', dateString, error)
      return 'Invalid Time'
    }
  }

  const getStatusBadge = (status: string | undefined) => {
    console.log('getStatusBadge called with status:', status)
    
    if (!status) {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
          Unknown
        </span>
      )
    }

    const statusConfig: { [key: string]: { bg: string; text: string } } = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800' },
      in_progress: { bg: 'bg-orange-100', text: 'text-orange-800' },
      completed: { bg: 'bg-green-100', text: 'text-green-800' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800' }
    }

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' }
    
    const statusText = status
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
        {statusText}
      </span>
    )
  }

  const getPaymentStatusBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
          Unknown
        </span>
      )
    }

    const statusConfig: { [key: string]: { bg: string; text: string } } = {
      paid: { bg: 'bg-green-100', text: 'text-green-800' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      failed: { bg: 'bg-red-100', text: 'text-red-800' },
      refunded: { bg: 'bg-blue-100', text: 'text-blue-800' }
    }

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' }
    
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activePage='orders' />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="space-y-4">
                  {[...Array(10)].map((_, i: number) => (
                    <div key={i} className="grid grid-cols-3 gap-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar activePage='orders' />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-red-800 font-semibold mb-2">Error Loading Order</h2>
              <p className="text-red-600">{error || 'Order not found'}</p>
              <Link
                to="/admin/order-management"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log('Rendering order with status:', order.status)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activePage='orders' />
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order Details</h1>
              <p className="text-gray-600">
                Detailed information for order: {order.orderCode || 'N/A'}
              </p>
            </div>
            <Link
              to="/admin/order-management"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Back to Orders
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Order Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-6">Order Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Order Code</div>
                  <div className="col-span-2 font-medium">{order.orderCode || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Customer</div>
                  <div className="col-span-2 font-medium">
                    {order.userId?.fullName || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Customer Contact</div>
                  <div className="col-span-2 font-medium">
                    {order.userId?.email || 'N/A'} {order.userId?.phone ? `| ${order.userId.phone}` : ''}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Service</div>
                  <div className="col-span-2 font-medium">{order.serviceName || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Description</div>
                  <div className="col-span-2 font-medium">
                    {order.problemDescription || 'No description provided'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Technician</div>
                  <div className="col-span-2 font-medium">
                    {order.technicianId?.displayName || 'Not assigned'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Scheduled Date</div>
                  <div className="col-span-2 font-medium">
                    {formatDate(order.scheduledAt)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Time Slot</div>
                  <div className="col-span-2 font-medium">{order.timeSlot || 'N/A'}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Address</div>
                  <div className="col-span-2 font-medium">
                    {order.address ? (
                      typeof order.address === 'string' ? order.address : 
                      `${(order.address as Address).street || ''}, ${(order.address as Address).city || ''}, ${(order.address as Address).state || ''} ${(order.address as Address).pincode || ''}`
                    ) : 'No address provided'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Total Amount</div>
                  <div className="col-span-2 font-medium">
                    ₹{order.totalAmount?.toFixed(2) || '0.00'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Status</div>
                  <div className="col-span-2">
                    {getStatusBadge(order.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Payment Status</div>
                  <div className="col-span-2">
                    {getPaymentStatusBadge(order.payment?.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Payment Method</div>
                  <div className="col-span-2 font-medium capitalize">
                    {order.payment?.method || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Transaction ID</div>
                  <div className="col-span-2 font-medium">
                    {order.payment?.transactionId || 'N/A'}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">Order Created</div>
                  <div className="col-span-2 font-medium">
                    {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {order.orderItems && order.orderItems.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-6">Order Items</h2>
                <div className="space-y-4">
                  {order.orderItems.map((item: OrderItem) => (
                    <div key={item._id} className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="font-medium">{item.customName}</div>
                      <div>${item.unitPrice?.toFixed(2)}</div>
                      <div>Qty: {item.quantity}</div>
                      <div className="font-semibold">${item.totalPrice?.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order History */}
            {order.history && order.history.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-6">Order History</h2>
                <div className="space-y-4">
                  {order.history.map((history: OrderHistory, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium capitalize">
                            {history.status ? 
                              history.status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
                              : 'Unknown Status'
                            }
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(history.timestamp)} at {formatTime(history.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{history.description}</p>
                        <p className="text-gray-500 text-xs mt-1">Updated by: {history.updatedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewOrder