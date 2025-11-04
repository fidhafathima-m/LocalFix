import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { useEffect } from 'react';

interface CancelBookingSuccessState {
  orderCode?: string;
  refundAmount?: number;
  orderId?: string;
}

const CancelBookingSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CancelBookingSuccessState;

  useEffect(() => {
    // If no state data, redirect to orders page
    if (!state?.orderCode) {
      navigate('/my-orders');
    }
  }, [state, navigate]);

  if (!state?.orderCode) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cancellation details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            Order ID: <span className="font-mono font-semibold">{state.orderCode}</span>
          </p>

          {state.refundAmount && state.refundAmount > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800">
                <span className="font-semibold">₹{state.refundAmount}</span> will be refunded to
                your account within 3-5 days.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                The refund will be processed to your original payment method.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
              <p className="text-gray-800">
                Your booking has been cancelled successfully.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                No refund applicable for this cancellation.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/services"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Book Another Service
            </Link>
            
            <Link
              to="/orders"
              className="block w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View My Orders
            </Link>
          </div>

          {/* Additional Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">What happens next?</h3>
            <div className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
              {state.refundAmount && state.refundAmount > 0 ? (
                <>
                  <p>• Refund initiated and will be processed shortly</p>
                  <p>• You'll receive email confirmation of cancellation</p>
                  <p>• Refund will reflect in 3-5 business days</p>
                </>
              ) : (
                <>
                  <p>• You'll receive email confirmation of cancellation</p>
                  <p>• The technician has been notified</p>
                  <p>• You can book another service anytime</p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CancelBookingSuccess