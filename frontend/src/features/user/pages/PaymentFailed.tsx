import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  HighlightOffOutlined,
  AutorenewOutlined,
  ChatBubbleOutlineOutlined,
  HomeOutlined,
  ReceiptLongOutlined
} from '@mui/icons-material'
import Header from '../../../components/common/Header'
import Footer from '../../../components/common/Footer'

interface PaymentFailedState {
  bookingId?: string;
  error?: string;
  errorCode?: string;
}

const PaymentFailed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentFailedState;

  const handleTryAgain = () => {
    if (state?.bookingId) {
      // Navigate back to checkout with the same booking data
      navigate('/checkout', { 
        state: { 
          retry: true,
          bookingId: state.bookingId 
        } 
      });
    } else {
      // Go back to services page if no specific booking
      navigate('/services');
    }
  };

  const handleContactSupport = () => {
    const supportMessage = `Payment Failed - Booking: ${state?.bookingId || 'N/A'} - Error: ${state?.error || 'Unknown error'}`;
    console.log('Contact support with:', supportMessage);
    // In a real app, this would open a support chat or form
    alert('Support team will contact you shortly regarding the payment failure.');
  };

  const getErrorMessage = () => {
    if (state?.error) {
      return state.error;
    }
    return "Your payment could not be processed at this time.";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <HighlightOffOutlined className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-2">
              {getErrorMessage()}
            </p>
            {state?.bookingId && (
              <p className="text-sm text-gray-500">
                Booking ID: <span className="font-mono">{state.bookingId}</span>
              </p>
            )}
            {state?.errorCode && (
              <p className="text-sm text-gray-500 mt-1">
                Error Code: <span className="font-mono">{state.errorCode}</span>
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold mb-4 text-center">
              Common Reasons for Payment Failure:
            </h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>Insufficient funds in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>Card has expired or is invalid</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>Bank declined the transaction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>Network or connectivity issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>Incorrect payment details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>Daily transaction limit exceeded</span>
              </li>
            </ul>
          </div>

          {state?.bookingId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <ReceiptLongOutlined className="w-5 h-5" />
                <span className="font-semibold">Your booking is pending</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Booking <span className="font-mono">{state.bookingId}</span> was created but payment failed. 
                Complete the payment to confirm your booking.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={handleTryAgain}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <AutorenewOutlined className="w-5 h-5" />
              Try Again
            </button>
            
            <button 
              onClick={handleContactSupport}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChatBubbleOutlineOutlined className="w-5 h-5" />
              Contact Support
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
      </main>
      <Footer />
    </div>
  )
}

export default PaymentFailed