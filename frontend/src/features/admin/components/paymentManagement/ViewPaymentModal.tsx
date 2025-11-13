import React from "react";
import {
  CloseOutlined,
  PersonOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  ReplayOutlined,
  BuildOutlined,
  ReceiptOutlined,
} from "@mui/icons-material";
import type { IPayment } from "../../../../interface/admin/IPayment";

interface ViewPaymentModalProps {
  payment: IPayment;
  onClose: () => void;
  onRefund: (paymentId: string) => void;
}

export const ViewPaymentModal: React.FC<ViewPaymentModalProps> = ({
  payment,
  onClose,
  onRefund,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: IPayment["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-purple-100 text-purple-700";
      case "initiated":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const serviceTax = payment.amount * 0.1;
  const technicianPayout = payment.amount - serviceTax;

  // Safely extract service name and order ID
  const serviceName =
    payment.serviceName && payment.serviceName !== "Unknown Service"
      ? payment.serviceName
      : "Service Information";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const orderId =
    payment.orderId && payment.orderId !== "Unknown Order"
      ? payment.orderId
      : "Order Information";

  const formatAddress = () => {
    if (!payment.address) {
      return "Address information not available";
    }

    const { label, street, city, state, pincode, landmark } = payment.address;

    const addressParts = [
      label,
      street,
      landmark,
      `${city}, ${state} - ${pincode}`,
    ].filter(Boolean);

    return addressParts.join(", ") || "Address details incomplete";
  };

  const hasAddressDetails = () => {
    if (!payment.address) return false;

    const { street, city, state, pincode } = payment.address;
    return !!(street || city || state || pincode);
  };

  return (
    <div className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Details
              </h1>
              <p className="text-gray-600">
                Complete information about this payment transaction
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(
                payment.status
              )}`}
            >
              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
            </span>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseOutlined className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          <div className="bg-blue-50 rounded-lg p-4 flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-3">
              <CreditCardOutlined className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Amount</p>
              <p className="text-xl font-bold">
                ₹{payment.amount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex items-start">
            <div className="bg-green-100 p-3 rounded-lg mr-3">
              <CheckCircleOutlined className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Tax (10%)</p>
              <p className="text-xl font-bold">
                ₹{serviceTax.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 flex items-start">
            <div className="bg-purple-100 p-3 rounded-lg mr-3">
              <PersonOutlined className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Technician Payout</p>
              <p className="text-xl font-bold">
                ₹{technicianPayout.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCardOutlined className="w-5 h-5 mr-2 text-blue-600" />
              Payment Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Payment ID</span>
                <span className="font-medium text-gray-900">
                  {payment.providerOrderId}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-medium text-gray-900">
                  {payment.providerPaymentId || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Initiated</span>
                <span className="font-medium text-gray-900">
                  {formatDate(payment.initiatedAt)}
                </span>
              </div>
              {payment.confirmedAt && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Confirmed</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(payment.confirmedAt)}
                  </span>
                </div>
              )}
              {payment.refundedAt && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Refunded</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(payment.refundedAt)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {payment.paymentProvider}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PersonOutlined className="w-5 h-5 mr-2 text-green-600" />
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Name</span>
                <span className="font-medium text-gray-900">
                  {payment.userName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-900">
                  {payment.userEmail}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Address</span>
                <div className="text-right">
                  <p className="text-gray-900 font-medium text-sm">
                    {formatAddress()}
                  </p>
                  {hasAddressDetails() && payment.address && (
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      {payment.address.label && (
                        <div>Label: {payment.address.label}</div>
                      )}
                      {payment.address.street && (
                        <div>Street: {payment.address.street}</div>
                      )}
                      {payment.address.landmark && (
                        <div>Landmark: {payment.address.landmark}</div>
                      )}
                      {(payment.address.city ||
                        payment.address.state ||
                        payment.address.pincode) && (
                        <div>
                          Location:{" "}
                          {[
                            payment.address.city,
                            payment.address.state,
                            payment.address.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BuildOutlined className="w-5 h-5 mr-2 text-orange-600" />
              Service Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Order ID</span>
                <span className="font-medium text-gray-900">
                  {payment.orderId}
                </span>
              </div>
              {payment.bookingCode &&
                payment.bookingCode !== "Unknown Booking" && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Booking ID</span>
                    <span className="font-medium text-gray-900">
                      {payment.bookingCode}
                    </span>
                  </div>
                )}
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Service Type</span>
                <span className="font-medium text-gray-900 capitalize">
                  {payment.type}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Service</span>
                <span className="font-medium text-gray-900 capitalize">
                  {serviceName}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ReceiptOutlined className="w-5 h-5 mr-2 text-purple-600" />
              Transaction Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium text-gray-900">
                  ₹{payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Currency</span>
                <span className="font-medium text-gray-900">
                  {payment.currency}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Service Tax (10%)</span>
                <span className="font-medium text-gray-900">
                  ₹{serviceTax.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Technician Payout</span>
                <span className="font-medium text-gray-900">
                  ₹{technicianPayout.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {payment.status === "success" && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => onRefund(payment.id)}
              className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <ReplayOutlined className="w-5 h-5" />
              <span>Process Refund</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
