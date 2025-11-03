import React from 'react'
import { Link } from 'react-router-dom'
import {
    CheckCircleOutlineOutlined,
    PlaceOutlined,
    DownloadOutlined,
    HomeOutlined
} from '@mui/icons-material'
import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'
const PaymentSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleOutlineOutlined className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Your booking has been confirmed and the technician has been
              notified.
            </p>
          </div>
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-semibold">BK338580</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">AC Repair</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Technician</span>
                <span className="font-semibold">Rajesh Kumar</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Schedule</span>
                <span className="font-semibold">
                  03/09/2025 , 10:00 AM - 12:00 PM
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Address</span>
                <span className="font-semibold">
                  Home - 123 Main St, Kanpur
                </span>
              </div>
              <div className="flex justify-between py-2 border-t pt-3">
                <span className="text-gray-900 font-semibold">Total Paid</span>
                <span className="font-bold text-lg">₹550</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <PlaceOutlined className="w-5 h-5" />
              Track Service
            </button>
            <button className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
              <DownloadOutlined className="w-5 h-5" />
              Download Invoice
            </button>
            <Link
              to="/"
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <HomeOutlined className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            A confirmation email has been sent to your registered email address.
          </p>
          <p>
            Need help?{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Contact our support team
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
export default PaymentSuccess
