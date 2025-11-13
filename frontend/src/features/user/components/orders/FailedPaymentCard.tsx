// FailedPaymentCard.tsx
import React from "react";
import {
  CalendarTodayOutlined,
  AccessTimeOutlined,
  FmdGoodOutlined,
  CreditCardOutlined,
  PersonOutlined,
  StarBorderOutlined,
  PaymentOutlined,
  WarningOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import type { OrderResponse } from "../../../../services/user/orderService";
import { Link } from "react-router-dom";

interface FailedPaymentCardProps {
  order: OrderResponse;
  formatDate: (date: string) => string;
  formatTimeSlot: (time: string) => string;
  onRetryPayment: () => void;
  onDismissPayment: (orderId: string) => void;
}

const FailedPaymentCard: React.FC<FailedPaymentCardProps> = ({
  order,
  formatDate,
  formatTimeSlot,
  onRetryPayment,
  onDismissPayment,
}) => {
  const handleDismiss = () => {
    onDismissPayment(order._id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500 relative">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        title="Dismiss this failed payment"
      >
        <CloseOutlined className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-red-600">
          <WarningOutlined className="w-5 h-5" />
          <span className="font-semibold">Payment Failed</span>
        </div>
        <span className="text-sm text-gray-600">
          Order ID: {order.orderCode}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-2">{order.serviceName}</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarTodayOutlined className="w-4 h-4" />
              <span className="font-medium">Scheduled Date:</span>
              <span className="ml-auto">{formatDate(order.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <AccessTimeOutlined className="w-4 h-4" />
              <span className="font-medium">Time Slot:</span>
              <span className="ml-auto">{formatTimeSlot(order.timeSlot)}</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <CreditCardOutlined className="w-4 h-4" />
              <span className="font-medium">Amount:</span>
              <span className="ml-auto font-semibold">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Assigned Technician</h3>
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
              <div className="font-semibold">
                {order.technicianId.displayName}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{order.technicianId.averageRating.toFixed(1)}</span>
                <span>({order.technicianId.ratingCount} reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
            <FmdGoodOutlined className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Service at:</span>
              <div className="text-xs mt-1">
                {order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Failed Payment Alert */}
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <WarningOutlined className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800 text-sm mb-1">
              Payment Failed
            </h4>
            <p className="text-red-700 text-sm">
              Your payment for this booking failed. Complete the payment to confirm your booking, 
              or cancel if you've changed your mind.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <button
          onClick={onRetryPayment}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none"
        >
          <PaymentOutlined className="w-5 h-5" />
          Retry Payment - ₹{order.totalAmount}
        </button>
        
        <Link
          to="/services"
          className="border-2 border-blue-300 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-center flex-1 sm:flex-none"
        >
          Book Different Service
        </Link>
      </div>

      {/* Quick Info Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 justify-center">
          <span>• Same technician reserved</span>
          <span>• Same schedule maintained</span>
          <span>• Quick payment retry</span>
        </div>
      </div>
    </div>
  );
};

export default FailedPaymentCard;