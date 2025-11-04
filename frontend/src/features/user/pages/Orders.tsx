import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  FmdGoodOutlined,
  CreditCardOutlined,
  StarBorderOutlined,
  CheckCircleOutlineOutlined,
  CancelOutlined,
  LocalShippingOutlined,
} from '@mui/icons-material'
import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'

const MyOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Book New Service
          </Link>
        </div>
        <div className="flex gap-8 border-b mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-1 font-semibold transition-colors relative ${activeTab === 'active' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="flex items-center gap-2">
              <LocalShippingOutlined className="w-5 h-5" />
              Active Orders
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
              Order History
            </div>
            {activeTab === 'history' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
        {activeTab === 'active' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <LocalShippingOutlined className="w-5 h-5" />
                  <span className="font-semibold">Technician on the way</span>
                </div>
                <span className="text-sm text-gray-600">
                  Order ID: BK338580
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">AC Repair</h3>
                  <p className="text-gray-600 mb-4">AC not cooling properly</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarTodayOutlined className="w-4 h-4" />
                      <span>Date</span>
                      <span className="ml-auto">03/09/2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <AccessTimeOutlined className="w-4 h-4" />
                      <span>Time Slot</span>
                      <span className="ml-auto">10:00 AM - 12:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FmdGoodOutlined className="w-4 h-4" />
                      <span>Address</span>
                      <span className="ml-auto">123 Main St, Kanpur</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CreditCardOutlined className="w-4 h-4" />
                      <span>Payment</span>
                      <span className="ml-auto">₹1200 • Online Payment</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Technician</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold">Rajesh Kumar</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                        <span>•</span>
                        <span>AC Repair</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Link
                  to="/service-tracking"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Track Service
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircleOutlineOutlined className="w-5 h-5" />
                  <span className="font-semibold">Booking Confirmed</span>
                </div>
                <span className="text-sm text-gray-600">
                  Order ID: BK338591
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Washing Machine Repair
                  </h3>
                  <p className="text-gray-600 mb-4">Machine not spinning</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarTodayOutlined className="w-4 h-4" />
                      <span>Date</span>
                      <span className="ml-auto">05/09/2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <AccessTimeOutlined className="w-4 h-4" />
                      <span>Time Slot</span>
                      <span className="ml-auto">02:00 PM - 04:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FmdGoodOutlined className="w-4 h-4" />
                      <span>Address</span>
                      <span className="ml-auto">123 Main St, Kannur</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CreditCardOutlined className="w-4 h-4" />
                      <span>Payment</span>
                      <span className="ml-auto">₹800 • Cash on Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button className="border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Reschedule
                </button>
                <Link
                  to="/cancel-booking"
                  className="text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircleOutlineOutlined className="w-5 h-5" />
                  <span className="font-semibold">Service Completed</span>
                </div>
                <span className="text-sm text-gray-600">
                  Order ID: BK338475
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Refrigerator Repair
                  </h3>
                  <p className="text-gray-600 mb-4">Not cooling properly</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarTodayOutlined className="w-4 h-4" />
                      <span>Date</span>
                      <span className="ml-auto">25/08/2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <AccessTimeOutlined className="w-4 h-4" />
                      <span>Time Slot</span>
                      <span className="ml-auto">11:00 AM - 01:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FmdGoodOutlined className="w-4 h-4" />
                      <span>Address</span>
                      <span className="ml-auto">123 Main St, Kanpur</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CreditCardOutlined className="w-4 h-4" />
                      <span>Payment</span>
                      <span className="ml-auto">₹1500 • Online Payment</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Technician</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold">Amit Singh</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.9</span>
                        <span>•</span>
                        <span>Refrigerator Repair</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <button className="text-blue-600 hover:text-blue-700 font-semibold">
                  Download Invoice
                </button>
                <div className="flex gap-3">
                  <button className="text-blue-600 hover:text-blue-700 font-semibold">
                    Leave Review
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Book Again
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircleOutlineOutlined className="w-5 h-5" />
                  <span className="font-semibold">Service Completed</span>
                </div>
                <span className="text-sm text-gray-600">
                  Order ID: BK338390
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Fan Repair</h3>
                  <p className="text-gray-600 mb-4">Fan making noise</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarTodayOutlined className="w-4 h-4" />
                      <span>Date</span>
                      <span className="ml-auto">15/08/2025</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <AccessTimeOutlined className="w-4 h-4" />
                      <span>Time Slot</span>
                      <span className="ml-auto">09:00 AM - 11:00 AM</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <FmdGoodOutlined className="w-4 h-4" />
                      <span>Address</span>
                      <span className="ml-auto">123 Main St, Kanpur</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <CreditCardOutlined className="w-4 h-4" />
                      <span>Payment</span>
                      <span className="ml-auto">₹600 • Cash on Delivery</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Technician</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">👤</span>
                    </div>
                    <div>
                      <div className="font-semibold">Vikram Patel</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.7</span>
                        <span>•</span>
                        <span>Electrical Repairs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <button className="text-blue-600 hover:text-blue-700 font-semibold">
                  Download Invoice
                </button>
                <div className="flex gap-3">
                  <button className="text-blue-600 hover:text-blue-700 font-semibold">
                    Leave Review
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Book Again
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-600">
                  <CancelOutlined className="w-5 h-5" />
                  <span className="font-semibold">Cancelled</span>
                </div>
                <span className="text-sm text-gray-600">
                  Order ID: BK338290
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">TV Repair</h3>
                <p className="text-gray-600 mb-4">No display</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarTodayOutlined className="w-4 h-4" />
                    <span>Date</span>
                    <span className="ml-auto">05/08/2025</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <AccessTimeOutlined className="w-4 h-4" />
                    <span>Time Slot</span>
                    <span className="ml-auto">03:00 PM - 05:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FmdGoodOutlined className="w-4 h-4" />
                    <span>Address</span>
                    <span className="ml-auto">123 Main St, Kanpur</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <CreditCardOutlined className="w-4 h-4" />
                    <span>Payment</span>
                    <span className="ml-auto">
                      ₹1000 • Online Payment (Refunded)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
export default MyOrders
