import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowBackIosNewOutlined,
  CalendarTodayOutlined,
  QueryBuilderOutlined,
  FmdGoodOutlined,
  InfoOutlined,
  StarBorderOutlined,
} from '@mui/icons-material'
import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'

const CancelBooking: React.FC = () => {
  const navigate = useNavigate()
  const [selectedReason, setSelectedReason] = useState('not-available')
  const handleConfirmCancellation = () => {
    navigate('/cancel-booking-success')
  }
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowBackIosNewOutlined className="w-5 h-5" />
          <span className="text-xl font-bold">Cancel Booking</span>
        </button>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Booking Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">AC Repair</h3>
              <p className="text-gray-600 mb-4">AC not cooling properly</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <CalendarTodayOutlined className="w-5 h-5" />
                  <span>05/09/2025</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <QueryBuilderOutlined className="w-5 h-5" />
                  <span>02:00 PM - 4:00 PM</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FmdGoodOutlined className="w-5 h-5" />
                  <span>123 Main St, Kannur</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 mb-1">Price: ₹800</div>
                <div className="text-sm text-gray-600">Cash on Delivery</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Technician</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600">👤</span>
                </div>
                <div>
                  <div className="font-semibold">Rajesh Kumar</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Why are you cancelling this booking?
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="not-available"
                checked={selectedReason === 'not-available'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">
                Technician not available at preferred time
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="better-price"
                checked={selectedReason === 'better-price'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">
                Found a better price elsewhere
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="resolved"
                checked={selectedReason === 'resolved'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">
                Issue resolved / no longer needed
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="wrong-booking"
                checked={selectedReason === 'wrong-booking'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">Wrong booking made</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="other"
                checked={selectedReason === 'other'}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">Other</span>
            </label>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <InfoOutlined className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Cancellation Policy
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                If you cancel more than 2 hours before the appointment, you will
                receive a full refund. For late cancellations, a ₹100
                cancellation fee applies.
              </p>
              <p className="text-sm text-blue-800">
                Refunds will be credited to your wallet or original payment
                method within 3-5 days.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleConfirmCancellation}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Confirm Cancellation
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CancelBooking