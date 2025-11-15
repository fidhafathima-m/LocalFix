import React, { useState } from "react";
import type { TechnicianOrder } from "../../../../../../interface/technician/IOrderService";
import { SparePartsModal } from "./SparePartsModal";
import toast from "react-hot-toast";

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

  console.log("ServiceId: ", order.serviceId);

  React.useEffect(() => {
    console.log("Full order object:", order);
    console.log("Available keys:", Object.keys(order));
  }, [order]);

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
      console.log("Selected spare parts:", parts);
      console.log("Order ID:", order._id);
      console.log("Technician ID:", technicianId);

      // Here you would typically send the spare parts request to your backend
      // You might need to create a new endpoint like:
      // await technicianOrderService.requestSpareParts(order._id, parts, technicianId);

      // For now, we'll just log and show success
      const totalAmount = parts.reduce(
        (sum, part) => sum + part.price * part.quantity,
        0
      );

      alert(
        `Spare parts request submitted successfully!\nTotal Amount: ₹${totalAmount}\nItems: ${parts.length}`
      );

      // Close the modal
      setShowSparePartsModal(false);
    } catch (error) {
      console.error("Failed to submit spare parts request:", error);
      alert("Failed to submit spare parts request. Please try again.");
    }
  };

  // Show different buttons based on current status
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
            <button
              onClick={() => setShowSparePartsModal(true)}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700"
            >
              Request spare parts
            </button>
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
            <button
              onClick={() => setShowSparePartsModal(true)}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700"
            >
              Request spare parts
            </button>
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
