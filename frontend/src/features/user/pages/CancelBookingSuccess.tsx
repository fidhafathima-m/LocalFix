import React from 'react'
import { Link } from 'react-router-dom'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';

const CancelBookingSuccess: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleOutlineOutlinedIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Your booking has been cancelled
          </h1>
          <p className="text-gray-600 mb-6">
            Booking ID: <span className="font-mono">:bookingId</span>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800">
              <span className="font-semibold">₹1200</span> will be refunded to
              your account within 3-5 days.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Another Service
            </Link>
            <Link
              to="/my-orders"
              className="block w-full text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CancelBookingSuccess
