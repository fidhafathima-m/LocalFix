// components/technician/order/sections/ChatSection.tsx
import React, { useState } from "react";
import { ChatBubbleOutlineOutlined, CloseOutlined } from "@mui/icons-material";
import { ChatThread } from "../../../../../user/components/messages/sections/ChatThread";

interface ChatSectionProps {
  orderId: string;
  customerId: string;
  customerName: string;
  customerProfilePhoto?: string;
  serviceName: string;
  technicianId: string;
  orderStatus: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({
  orderId,
  customerId,
  customerName,
  customerProfilePhoto,
  serviceName,
  technicianId,
  orderStatus,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatDisabledMessage, setShowChatDisabledMessage] = useState(false);

  // Chat available during active service stages
  const isChatAvailable = [
    "accepted",
    "confirmed",
    "on_the_way",
    "in_progress",
  ].includes(orderStatus);

  // Chat disabled for these statuses
  const isChatDisabled = [
    "pending",
    "completed",
    "cancelled",
    "refunded",
  ].includes(orderStatus);

  const getStatusMessage = () => {
    if (isChatAvailable) return "Chat Available";
    if (orderStatus === "pending")
      return "Chat available after order acceptance";
    if (orderStatus === "completed")
      return "Chat no longer available for completed services";
    if (orderStatus === "cancelled")
      return "Chat not available for cancelled orders";
    if (orderStatus === "refunded")
      return "Chat not available for refunded orders";
    return "Chat not available";
  };

  const getStatusColor = () => {
    if (isChatAvailable) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-600";
  };

  const handleChatClick = () => {
    if (isChatAvailable) {
      setIsChatOpen(true);
    } else {
      setShowChatDisabledMessage(true);
      setTimeout(() => setShowChatDisabledMessage(false), 3000);
    }
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Chat with Customer
        </h3>
        <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusMessage()}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {customerProfilePhoto ? (
              <img
                src={customerProfilePhoto}
                alt={customerName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-medium text-sm">
                {customerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{customerName}</p>
            <p className="text-sm text-gray-500">{serviceName}</p>
            <p className="text-xs text-gray-400 mt-1">
              Order Status:{" "}
              <span className="font-medium capitalize">
                {orderStatus.replace("_", " ")}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={handleChatClick}
          disabled={!isChatAvailable}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
            isChatAvailable
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          } transition-colors`}
        >
          <ChatBubbleOutlineOutlined className="w-5 h-5" />
          {isChatAvailable ? "Open Chat" : "Chat Not Available"}
        </button>

        {showChatDisabledMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              {orderStatus === "pending" &&
                "Chat will be available once you accept this order."}
              {orderStatus === "completed" &&
                "Chat is no longer available for completed services."}
              {orderStatus === "cancelled" &&
                "Chat is not available for cancelled orders."}
              {orderStatus === "refunded" &&
                "Chat is not available for refunded orders."}
            </p>
          </div>
        )}

        {isChatAvailable && (
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-medium text-blue-900">Chat is now available!</p>
            <p className="mt-1 text-blue-800">
              You can communicate with the customer about service details,
              arrival time, or any questions.
            </p>
          </div>
        )}

        {isChatDisabled && (
          <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p>
              {orderStatus === "pending" &&
                "Once you accept this order, you'll be able to chat with the customer."}
              {orderStatus === "completed" &&
                "This service has been completed. For new inquiries, please ask the customer to book a new service."}
              {orderStatus === "cancelled" &&
                "This order has been cancelled. Chat is no longer available."}
              {orderStatus === "refunded" &&
                "This order has been refunded. Chat is no longer available."}
            </p>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col min-h-0">
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4 bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {customerProfilePhoto ? (
                    <img
                      src={customerProfilePhoto}
                      alt={customerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-medium text-sm">
                      {customerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {customerName}
                  </div>
                  <div className="text-sm text-gray-600">{serviceName}</div>
                  <div className="text-xs text-green-600 font-medium">
                    ● Active Service
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                <CloseOutlined className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Thread - Make scrollable */}
            <div className="flex-1 min-h-0">
              <ChatThread
                orderId={orderId}
                recipientId={customerId}
                recipientName={customerName}
                recipientProfilePhoto={customerProfilePhoto}
                recipientService={serviceName}
                currentUserId={technicianId}
                currentUserType="technician"
                onClose={handleCloseChat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSection;
