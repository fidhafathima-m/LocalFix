import React, { useState, useEffect } from "react";
import type { TechnicianOrder } from "../../../../../../interface/technician/IOrderService";
import { SparePartsModal } from "./SparePartsModal";
import toast from "react-hot-toast";
import { SparePartsService } from "../../../../../../services/technician/sparePartsService";

interface SparePart {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selected: boolean;
}

interface ActionButtonsProps {
  order: TechnicianOrder;
  onUpdateOrderStatus: (status: string, reason?: string) => Promise<void>;
  technicianId?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  order,
  onUpdateOrderStatus,
  technicianId,
}) => {
  const [showSparePartsModal, setShowSparePartsModal] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if spare parts request already exists
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!order._id) return;

      try {
        setLoading(true);
        const request = await SparePartsService.getSparePartsRequestsByOrder(
          order._id
        );
        // If any request exists (regardless of status), set hasExistingRequest to true
        setHasExistingRequest(!!request);
      } catch (error) {
        console.error("Error checking spare parts request:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only check when order is in statuses where spare parts can be requested
    if (order.status === "in_progress" || order.status === "on_the_way") {
      checkExistingRequest();
    }
  }, [order._id, order.status]);

  // Enhanced function to get technician ID
  const getTechnicianId = () => {
    // Try from props first
    if (technicianId) {
      return technicianId;
    }

    // Try from localStorage (fallback)
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const id = user.id || user._id || user.userId;
        if (id) {
          return id;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    // Try other storage locations
    const techId =
      localStorage.getItem("technicianId") ||
      sessionStorage.getItem("technicianId") ||
      localStorage.getItem("userId") ||
      sessionStorage.getItem("userId");

    if (techId) {
      return techId;
    }

    console.error("No technician ID found in any storage");
    return null;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await onUpdateOrderStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Error in updating status");
      console.error("Failed to update status:", error);
    }
  };

  const handleCancelJob = async () => {
    if (window.confirm("Are you sure you want to cancel this job?")) {
      const reason = prompt("Please provide a reason for cancellation:");
      if (reason) {
        await handleStatusUpdate("cancelled");
      }
    }
  };

  const handleSparePartsSubmit = async (parts: SparePart[]) => {
    try {
      const currentTechnicianId = getTechnicianId();

      if (!currentTechnicianId) {
        toast.error("Technician ID not found. Please log in again.");
        return;
      }

      // Transform parts to match backend DTO
      const requestItems = parts.map((part) => ({
        itemId: part.id,
        name: part.name,
        price: part.price,
        quantity: part.quantity,
      }));

      const createDto = {
        orderId: order._id,
        technicianId: currentTechnicianId,
        items: requestItems,
        technicianNotes: `Spare parts requested for ${order.serviceName}`,
      };

      // Call the service
      const response = await SparePartsService.createSparePartsRequest(
        createDto
      );

      toast.success("Spare parts request submitted successfully!");
      setShowSparePartsModal(false);
      setHasExistingRequest(true); // Hide the button after successful submission

      console.log("Spare parts request created:", response);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Failed to submit spare parts request:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit spare parts request";
      toast.error(errorMessage);
    }
  };

  // Simple function to render spare parts button only if no existing request
  const renderSparePartsButton = () => {
    // Don't show button if loading or if request already exists
    if (loading || hasExistingRequest) {
      return null;
    }

    return (
      <button
        onClick={() => setShowSparePartsModal(true)}
        className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
      >
        Request Spare Parts
      </button>
    );
  };

  const renderButtons = () => {
    switch (order.status) {
      case "pending":
        return (
          <>
            <button
              onClick={() => handleStatusUpdate("accepted")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Accept Order
            </button>
            <button
              onClick={handleCancelJob}
              className="w-full text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
            >
              Decline Order
            </button>
          </>
        );

      case "accepted":
        return (
          <>
            <button
              onClick={() => handleStatusUpdate("confirmed")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Confirm Service
            </button>
            <button
              onClick={() => handleStatusUpdate("on_the_way")}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600"
            >
              Start Journey
            </button>
            <button
              onClick={handleCancelJob}
              className="w-full text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
            >
              Cancel Job
            </button>
          </>
        );

      case "confirmed":
        return (
          <>
            <button
              onClick={() => handleStatusUpdate("on_the_way")}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg font-medium hover:bg-yellow-600"
            >
              Start Journey
            </button>
            <button
              onClick={handleCancelJob}
              className="w-full text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
            >
              Cancel Job
            </button>
          </>
        );

      case "on_the_way":
        return (
          <>
            <button
              onClick={() => handleStatusUpdate("in_progress")}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700"
            >
              Mark as "Reached Location"
            </button>
            {renderSparePartsButton()}
            <button
              onClick={handleCancelJob}
              className="w-full text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
            >
              Cancel Job
            </button>
          </>
        );

      case "in_progress":
        return (
          <>
            <button
              onClick={() => handleStatusUpdate("completed")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
            >
              Mark as Completed
            </button>
            {renderSparePartsButton()}
            <button
              onClick={handleCancelJob}
              className="w-full text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
            >
              Cancel Job
            </button>
          </>
        );

      case "completed":
        return (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">Order Completed</p>
            {hasExistingRequest && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Spare parts were requested for this service
                </p>
              </div>
            )}
          </div>
        );

      case "cancelled":
        return (
          <div className="text-center py-4">
            <p className="text-red-600 font-medium">Order Cancelled</p>
          </div>
        );

      default:
        return (
          <button
            onClick={handleCancelJob}
            className="w-full text-red-600 py-3 rounded-lg font-medium hover:bg-red-50"
          >
            Cancel Job
          </button>
        );
    }
  };

  return (
    <>
      <div className="mt-6 space-y-3">{renderButtons()}</div>

      {/* Spare Parts Modal */}
      <SparePartsModal
        isOpen={showSparePartsModal}
        onClose={() => setShowSparePartsModal(false)}
        onSubmit={handleSparePartsSubmit}
        serviceId={order.serviceId}
        serviceName={order.serviceName}
      />
    </>
  );
};

export default ActionButtons;
