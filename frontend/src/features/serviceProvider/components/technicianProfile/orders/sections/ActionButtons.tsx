import React, { useState, useEffect } from "react";
import type { TechnicianOrder } from "../../../../../../interface/technician/IOrderService";
import { SparePartsModal } from "./SparePartsModal";
import toast from "react-hot-toast";
import { SparePartsService } from "../../../../../../services/technician/sparePartsService";
import Swal from "sweetalert2";
import { useSocket } from "../../../../../../context/SocketContext";
import { useAppSelector } from "../../../../../../hooks/redux";
import { selectTechnicianProfile } from "../../../../../../store/slices/technicianSlice";
import { selectUser } from "../../../../../../store/slices/authSlice";

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
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const { socket } = useSocket();
  const technicianProfile = useAppSelector(selectTechnicianProfile);
  const authUser = useAppSelector(selectUser);

  const currentTechnicianId =
    technicianId || technicianProfile?._id || authUser?._id;

  // Add helper function to check if order is expired
  const isOrderExpired = (scheduledAt: string): boolean => {
    if (!scheduledAt) return false;

    const scheduledDate = new Date(scheduledAt);
    const now = new Date();

    // Consider order expired if scheduled time has passed by more than 1 hour
    const oneHourAfterScheduled = new Date(
      scheduledDate.getTime() + 60 * 60 * 1000,
    );

    return now > oneHourAfterScheduled;
  };

  // Add helper to check if order can be modified
  const canModifyOrder = (): { allowed: boolean; reason: string } => {
    const scheduledAt = order.scheduledAt;

    // Don't allow modifications on completed or cancelled orders
    if (["completed", "cancelled"].includes(order.status)) {
      return {
        allowed: false,
        reason: `This order is already ${order.status} and cannot be modified.`,
      };
    }

    // Check if order is expired
    if (isOrderExpired(scheduledAt)) {
      return {
        allowed: false,
        reason:
          "This order's scheduled date/time has passed and can no longer be modified.",
      };
    }

    return { allowed: true, reason: "" };
  };

  // Add helper to get button status
  const getButtonStatus = (
    defaultText: string,
  ): { text: string; disabled: boolean; reason: string } => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      return {
        text: modification.reason.includes("expired") ? "Expired" : defaultText,
        disabled: true,
        reason: modification.reason,
      };
    }

    return {
      text: defaultText,
      disabled: false,
      reason: "",
    };
  };

  // Check if spare parts request already exists
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!order._id) return;

      try {
        setLoading(true);
        const response = await SparePartsService.getSparePartsRequestsByOrder(
          order._id,
        );

        // Handle different response structures
        if (response && Array.isArray(response)) {
          setHasExistingRequest(response.length > 0);
        } else if (response && typeof response === "object") {
          const requests = response.data || response.requests || response;
          if (Array.isArray(requests)) {
            setHasExistingRequest(requests.length > 0);
          } else {
            setHasExistingRequest(!!requests);
          }
        } else {
          setHasExistingRequest(false);
        }
      } catch (error) {
        console.error("Error checking spare parts request:", error);
        setHasExistingRequest(false);
      } finally {
        setLoading(false);
      }
    };

    if (order.status === "in_progress" || order.status === "on_the_way") {
      checkExistingRequest();
    } else {
      setHasExistingRequest(false);
    }
  }, [order._id, order.status]);

  const handleStatusUpdate = async (newStatus: string) => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      toast.error(modification.reason);
      return;
    }

    try {
      await onUpdateOrderStatus(newStatus);
      toast.success(`Order status updated to ${newStatus.replace("_", " ")}.`);
    } catch (error) {
      toast.error("Failed to update order status. Please try again.");
      console.error(error);
    }
  };

  const handleCancelOrder = async () => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      toast.error(modification.reason);
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      html: `
        <div class="text-left">
          <p>You are about to cancel the following order:</p>
          <div class="mt-2 p-3 bg-red-50 rounded border border-red-200">
            <p class="font-medium text-gray-900">${order.serviceName}</p>
            <p class="text-sm text-gray-600">Order #: ${order.orderCode}</p>
          </div>
          <p class="mt-3 text-red-600 font-medium">This action cannot be undone!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel order!",
      cancelButtonText: "No, keep order",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      const { value: reason } = await Swal.fire({
        title: "Cancellation Reason",
        input: "textarea",
        inputLabel: "Please provide a reason for cancellation:",
        inputPlaceholder: "Enter the reason for cancelling this order...",
        showCancelButton: true,
        confirmButtonText: "Confirm Cancellation",
        cancelButtonText: "Go Back",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        inputValidator: (value) => {
          if (!value) {
            return "Please provide a cancellation reason!";
          }
          if (value.length < 10) {
            return "Reason should be at least 10 characters long";
          }
          return null;
        },
      });

      if (reason) {
        try {
          await onUpdateOrderStatus("cancelled", reason);
          toast.success("The order has been cancelled successfully");
        } catch (error) {
          toast.error("Failed to cancel the order. Please try again.");
          console.error(error);
        }
      }
    }
  };

  const handleDeclineOrder = async () => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      toast.error(modification.reason);
      return;
    }

    const result = await Swal.fire({
      title: "Decline Order?",
      html: `
        <div class="text-left">
          <p>You are about to decline the following order:</p>
          <div class="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p class="font-medium text-gray-900">${order.serviceName}</p>
            <p class="text-sm text-gray-600">Order #: ${order.orderCode}</p>
          </div>
          <p class="mt-3 text-yellow-600 font-medium">The customer will be notified about this.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, decline order",
      cancelButtonText: "Keep order",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await onUpdateOrderStatus("cancelled", "Technician unavailable");
        toast.success("The order has been declined successfully.");
      } catch (error) {
        toast.error("Failed to decline the order. Please try again.");
        console.error(error);
      }
    }
  };

  const handleStatusUpdateWithConfirmation = async (newStatus: string) => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      toast.error(modification.reason);
      return;
    }

    const statusMessages: {
      [key: string]: {
        title: string;
        message: string;
        icon: "success" | "info" | "warning";
      };
    } = {
      accepted: {
        title: "Accept Order?",
        message: `Are you sure you want to accept order ${order.orderCode} for ${order.serviceName}?`,
        icon: "success",
      },
      confirmed: {
        title: "Confirm Service?",
        message: `Confirm that you will perform ${order.serviceName} for order ${order.orderCode}?`,
        icon: "info",
      },
      on_the_way: {
        title: "Start Journey?",
        message: `Mark yourself as on the way for order ${order.orderCode}?`,
        icon: "warning",
      },
      in_progress: {
        title: "Arrived at Location?",
        message: `Confirm that you have arrived and started working on order ${order.orderCode}?`,
        icon: "info",
      },
      completed: {
        title: "Mark as Complete?",
        message: `Mark order ${order.orderCode} as completed? This will finalize the service.`,
        icon: "success",
      },
    };

    const statusConfig = statusMessages[newStatus];

    if (statusConfig) {
      const result = await Swal.fire({
        title: statusConfig.title,
        text: statusConfig.message,
        icon: statusConfig.icon,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, proceed",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        if (newStatus === "on_the_way") {
          await handleOnTheWayStatus();
        } else {
          await handleStatusUpdate(newStatus);
        }
      }
    } else {
      await handleStatusUpdate(newStatus);
    }
  };

  const handleOnTheWayStatus = async () => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      toast.error(modification.reason);
      return;
    }

    const locationResult = await Swal.fire({
      title: "Share Location?",
      html: `
        <div class="text-left">
          <p>Do you want to share your live location with the customer?</p>
          <div class="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p class="text-sm text-blue-800">
              • Customer can track your real-time location<br>
              • They'll see your estimated arrival time<br>
              • Location sharing stops when you arrive
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Share Location",
      cancelButtonText: "No, Just Update Status",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    try {
      await handleStatusUpdate("on_the_way");

      if (locationResult.isConfirmed) {
        await startLocationSharing();
      }
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
      console.error(error);
    }
  };

  const startLocationSharing = async () => {
    if (!currentTechnicianId) {
      toast.error("Unable to identify technician. Please try again.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          timestamp: new Date(),
        };

        socket?.emit("technician-location-share", {
          technicianId: currentTechnicianId,
          orderId: order._id,
          location: locationData,
        });

        const watchId = navigator.geolocation.watchPosition(
          (updatedPosition) => {
            const updatedLocation = {
              lat: updatedPosition.coords.latitude,
              lng: updatedPosition.coords.longitude,
              accuracy: updatedPosition.coords.accuracy,
              speed: updatedPosition.coords.speed || 0,
              heading: updatedPosition.coords.heading || 0,
              timestamp: new Date(),
            };

            socket?.emit("technician-location-update", {
              technicianId: currentTechnicianId,
              orderId: order._id,
              location: updatedLocation,
            });
          },
          (error) => {
            console.error("Location watch error:", error);
            toast.error("Location sharing failed. Please try again.");
            stopLocationSharing();
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000,
          },
        );

        setLocationWatchId(watchId);
        setIsSharingLocation(true);

        toast.success("Location sharing started! Customer can now track you.");
      },
      (error) => {
        console.error("Error getting initial location:", error);
        let errorMessage = "Failed to get your location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Location permission denied. Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Location information unavailable. Make sure location services are enabled on your device.";
            break;
          case error.TIMEOUT:
            errorMessage +=
              "Location request timed out. Please check your internet connection.";
            break;
          default:
            errorMessage += error.message;
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  };

  const stopLocationSharing = () => {
    if (locationWatchId) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }

    setIsSharingLocation(false);

    if (socket && currentTechnicianId) {
      socket.emit("technician-location-stop", {
        technicianId: currentTechnicianId,
        orderId: order._id,
      });
    }
  };

  const handleRestartLocationSharing = async () => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      toast.error(modification.reason);
      return;
    }

    const result = await Swal.fire({
      title: "Restart Location Sharing?",
      html: `
        <div class="text-left">
          <p>Do you want to restart sharing your live location with the customer?</p>
          <div class="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p class="text-sm text-blue-800">
              • Customer will see your real-time location again<br>
              • They'll get updated estimated arrival time<br>
              • Make sure location services are enabled
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Restart Sharing",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await startLocationSharing();
        toast.success(
          "Location sharing restarted! Customer can now track you again.",
        );
      } catch (error) {
        toast.error("Failed to restart location sharing. Please try again.");
        console.error(error);
      }
    }
  };

  const handleSparePartsSubmit = async (parts: SparePart[]) => {
    try {
      if (!currentTechnicianId) {
        toast.error("Technician ID not found. Please log in again.");
        return;
      }

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

      await SparePartsService.createSparePartsRequest(createDto);

      toast.success("Spare parts request submitted successfully!");
      setShowSparePartsModal(false);
      setHasExistingRequest(true);

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

  const renderSparePartsButton = () => {
    const modification = canModifyOrder();

    if (!modification.allowed) {
      return null;
    }

    if (loading) {
      return (
        <button
          disabled
          className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
        >
          Checking Spare Parts...
        </button>
      );
    }

    if (hasExistingRequest) {
      return (
        <button
          disabled
          className="w-full bg-gray-400 text-white py-3 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
        >
          Spare Parts Requested ✓
        </button>
      );
    }

    if (order.status !== "in_progress" && order.status !== "on_the_way") {
      return null;
    }

    return (
      <button
        onClick={() => setShowSparePartsModal(true)}
        className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        Request Spare Parts
      </button>
    );
  };

  const renderButtons = () => {
    const modification = canModifyOrder();
    const isExpired = isOrderExpired(order.scheduledAt);
    const buttonStatus = getButtonStatus("");

    // If order is expired and not in terminal state, show expired message
    if (isExpired && !["completed", "cancelled"].includes(order.status)) {
      return (
        <div className="space-y-3">
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
            <span className="text-gray-600 font-medium block mb-2">
              ⏰ Order Expired
            </span>
            <p className="text-sm text-gray-500">
              This order was scheduled for{" "}
              {new Date(order.scheduledAt).toLocaleString()}
              {` `}and can no longer be modified.
            </p>
          </div>
          <button
            onClick={handleCancelOrder}
            disabled={!modification.allowed}
            className={`w-full ${
              modification.allowed
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white py-3 rounded-lg font-medium transition-colors`}
            title={modification.reason}
          >
            {modification.allowed ? "Cancel Order" : "Expired"}
          </button>
        </div>
      );
    }

    switch (order.status) {
      case "pending":
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleStatusUpdateWithConfirmation("accepted")}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Accept Order" : buttonStatus.text}
            </button>
            <button
              onClick={handleDeclineOrder}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Decline Order" : buttonStatus.text}
            </button>
          </div>
        );

      case "accepted":
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleStatusUpdateWithConfirmation("confirmed")}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Confirm Service" : buttonStatus.text}
            </button>
            <button
              onClick={() => handleStatusUpdateWithConfirmation("on_the_way")}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Start Journey" : buttonStatus.text}
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Cancel Order" : buttonStatus.text}
            </button>
          </div>
        );

      case "confirmed":
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleStatusUpdateWithConfirmation("on_the_way")}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Start Journey" : buttonStatus.text}
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Cancel Order" : buttonStatus.text}
            </button>
          </div>
        );

      case "on_the_way":
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleStatusUpdateWithConfirmation("in_progress")}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Arrived at Location" : buttonStatus.text}
            </button>

            {/* Location Sharing Controls */}
            {modification.allowed && (
              <div className="flex gap-2">
                {isSharingLocation ? (
                  <button
                    onClick={stopLocationSharing}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Stop Sharing Location
                  </button>
                ) : (
                  <button
                    onClick={handleRestartLocationSharing}
                    disabled={!modification.allowed}
                    className={`flex-1 ${
                      modification.allowed
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                    } text-white py-3 rounded-lg font-medium transition-colors`}
                    title={modification.reason}
                  >
                    Share Location Again
                  </button>
                )}
              </div>
            )}

            {renderSparePartsButton()}
            <button
              onClick={handleCancelOrder}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Cancel Order" : buttonStatus.text}
            </button>
          </div>
        );

      case "in_progress":
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleStatusUpdateWithConfirmation("completed")}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-gray-800 hover:bg-gray-900"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Mark Complete" : buttonStatus.text}
            </button>
            {renderSparePartsButton()}
            <button
              onClick={handleCancelOrder}
              disabled={!modification.allowed}
              className={`w-full ${
                modification.allowed
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white py-3 rounded-lg font-medium transition-colors`}
              title={modification.reason}
            >
              {modification.allowed ? "Cancel Order" : buttonStatus.text}
            </button>
          </div>
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
            onClick={handleCancelOrder}
            disabled={!modification.allowed}
            className={`w-full ${
              modification.allowed
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-400 cursor-not-allowed"
            } text-white py-3 rounded-lg font-medium transition-colors`}
            title={modification.reason}
          >
            {modification.allowed ? "Cancel Order" : buttonStatus.text}
          </button>
        );
    }
  };

  return (
    <>
      <div className="mt-6">{renderButtons()}</div>

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
