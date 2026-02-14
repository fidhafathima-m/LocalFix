import React, { useState } from "react";
import { CalendarTodayOutlined } from "@mui/icons-material";
import Swal from "sweetalert2";
import type { TabProps } from "../types";
import {
  formatCurrency,
  formatDateTime,
  getStatusColor,
  getStatusIcon,
  getCustomerInfo,
} from "../utils/helpers";
import toast from "react-hot-toast";
import { useSocket } from "../../../../../../context/SocketContext";
import { useAppSelector } from "../../../../../../hooks/redux";
import { selectTechnicianProfile } from "../../../../../../store/slices/technicianSlice";
import { selectUser } from "../../../../../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const OrdersTab: React.FC<TabProps> = ({
  orders,
  ordersLoading,
  onUpdateOrderStatus,
}) => {
  const { socket } = useSocket();
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState<{
    [key: string]: boolean;
  }>({});
  const navigate = useNavigate();

  const technicianProfile = useAppSelector(selectTechnicianProfile);
  const authUser = useAppSelector(selectUser);

  const technicianId = technicianProfile?._id || authUser?._id;

  const handleCancelOrder = async (
    orderId: string,
    orderCode: string,
    serviceName: string,
  ) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      html: `
        <div class="text-left">
          <p>You are about to cancel the following order:</p>
          <div class="mt-2 p-3 bg-red-50 rounded border border-red-200">
            <p class="font-medium text-gray-900">${serviceName}</p>
            <p class="text-sm text-gray-600">Order #: ${orderCode}</p>
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
      customClass: {
        popup: "rounded-lg",
        confirmButton: "px-4 py-2 text-sm font-medium",
        cancelButton: "px-4 py-2 text-sm font-medium",
      },
    });

    if (result.isConfirmed) {
      // Show reason input for cancellation
      const { value: reason } = await Swal.fire({
        title: "Cancellation Reason",
        input: "textarea",
        inputLabel: "Please provide a reason for cancellation:",
        inputPlaceholder: "Enter the reason for cancelling this order...",
        inputAttributes: {
          "aria-label": "Enter cancellation reason",
        },
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
        customClass: {
          popup: "rounded-lg",
          input: "resize-none",
          confirmButton: "px-4 py-2 text-sm font-medium",
          cancelButton: "px-4 py-2 text-sm font-medium",
        },
      });

      if (reason) {
        try {
          await onUpdateOrderStatus(orderId, "cancelled", reason);

          toast.success("The order has been cancelled successfully");
        } catch (error) {
          toast.error("Failed to cancel the order. Please try again.");
          console.error(error);
        }
      }
    }
  };

  const handleDeclineOrder = async (
    orderId: string,
    orderCode: string,
    serviceName: string,
  ) => {
    const result = await Swal.fire({
      title: "Decline Order?",
      html: `
        <div class="text-left">
          <p>You are about to decline the following order:</p>
          <div class="mt-2 p-3 bg-yellow-50 rounded border border-yellow-200">
            <p class="font-medium text-gray-900">${serviceName}</p>
            <p class="text-sm text-gray-600">Order #: ${orderCode}</p>
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
      customClass: {
        popup: "rounded-lg",
        confirmButton: "px-4 py-2 text-sm font-medium",
        cancelButton: "px-4 py-2 text-sm font-medium",
      },
    });

    if (result.isConfirmed) {
      try {
        await onUpdateOrderStatus(
          orderId,
          "cancelled",
          "Technician unavailable",
        );

        toast.success("The order has been declined successfully.");
      } catch (error) {
        toast.error("Failed to decline the order. Please try again.");
        console.error(error);
      }
    }
  };

  const isOrderExpired = (scheduledAt: string): boolean => {
    if (!scheduledAt) return false;
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();
    const oneHourAfterScheduled = new Date(
      scheduledDate.getTime() + 60 * 60 * 1000,
    );
    return now > oneHourAfterScheduled;
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: string,
    orderCode: string,
    serviceName: string,
  ) => {
    const statusMessages: {
      [key: string]: {
        title: string;
        message: string;
        icon: "success" | "info" | "warning";
      };
    } = {
      accepted: {
        title: "Accept Order?",
        message: `Are you sure you want to accept order ${orderCode} for ${serviceName}?`,
        icon: "success",
      },
      confirmed: {
        title: "Confirm Service?",
        message: `Confirm that you will perform ${serviceName} for order ${orderCode}?`,
        icon: "info",
      },
      on_the_way: {
        title: "Start Journey?",
        message: `Mark yourself as on the way for order ${orderCode}?`,
        icon: "warning",
      },
      in_progress: {
        title: "Arrived at Location?",
        message: `Confirm that you have arrived and started working on order ${orderCode}?`,
        icon: "info",
      },
      completed: {
        title: "Mark as Complete?",
        message: `Mark order ${orderCode} as completed? This will finalize the service.`,
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
        try {
          if (newStatus === "on_the_way") {
            await handleOnTheWayStatus(orderId);
          } else {
            // Capture the response from the API call
            const response = await onUpdateOrderStatus(orderId, newStatus);

            // Check if the response contains an error message from backend
            if (response && response.success === false) {
              toast.error(response.message || "Failed to update order status");
              return;
            }

            toast.success(
              `Order status updated to ${newStatus.replace("_", " ")}.`,
            );
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // Handle validation errors from backend
          if (error.response?.data?.message) {
            toast.error(error.response.data.message);

            // Show detailed error in SweetAlert for better UX
            Swal.fire({
              title: "Cannot Update Status",
              text: error.response.data.message,
              icon: "error",
              confirmButtonColor: "#3085d6",
              confirmButtonText: "Got it",
            });
          } else {
            toast.error("Failed to update order status. Please try again.");
          }
          console.error(error);
        }
      }
    } else {
      // Direct status update without confirmation for other statuses
      await onUpdateOrderStatus(orderId, newStatus);
    }
  };

  // Add this helper function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getCompletionWaitTime = (order: any): string => {
    if (order.status !== "in_progress") return "";

    const inProgressHistory = order.history?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (h: any) => h.status === "in_progress",
    );

    if (inProgressHistory) {
      const inProgressTime = new Date(inProgressHistory.timestamp);
      const now = new Date();
      const timeSinceStart = now.getTime() - inProgressTime.getTime();
      const thirtyMinutes = 30 * 60 * 1000;

      if (timeSinceStart < thirtyMinutes) {
        const remainingMs = thirtyMinutes - timeSinceStart;
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
        return ` (${remainingMinutes} min remaining)`;
      }
    }

    return "";
  };

  // Add this to check if order can be accepted/confirmed
  const canModifyOrder = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: any,
  ): { allowed: boolean; reason: string } => {
    const scheduledAt = order.scheduledAt;

    if (isOrderExpired(scheduledAt)) {
      return {
        allowed: false,
        reason:
          "This order's scheduled date/time has passed and can no longer be modified.",
      };
    }

    return { allowed: true, reason: "" };
  };

  const handleOnTheWayStatus = async (orderId: string) => {
    // Ask if technician wants to share location
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
      // Update status to "on_the_way" regardless of location sharing choice
      await onUpdateOrderStatus(orderId, "on_the_way");

      if (locationResult.isConfirmed) {
        // Start location sharing
        await startLocationSharing(orderId);
      } else {
        toast.success("Status updated to 'on the way'");
      }
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
      console.error(error);
    }
  };

  const startLocationSharing = async (orderId: string) => {
    const order = orders.find((o) => o._id === orderId);
    const getTechnicianId = (): string | null => {
      if (!order?.technicianId) return null;

      if (
        typeof order.technicianId === "object" &&
        order.technicianId !== null
      ) {
        return order.technicianId._id;
      } else if (typeof order.technicianId === "string") {
        return order.technicianId;
      }

      return null;
    };

    const correctTechnicianId = getTechnicianId() || technicianId;

    if (!correctTechnicianId) {
      toast.error("Unable to identify technician. Please try again.");
      return;
    }

    // Get current position first with better error handling
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Define locationData here
        const locationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          heading: position.coords.heading || 0,
          timestamp: new Date(),
        };

        // Send to backend via socket
        socket?.emit("technician-location-share", {
          technicianId: correctTechnicianId,
          orderId: orderId,
          location: locationData,
        });

        // Start watching position for continuous updates
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

            // Send update to backend
            socket?.emit("technician-location-update", {
              technicianId: correctTechnicianId,
              orderId: orderId,
              location: updatedLocation,
            });
          },
          (error) => {
            console.error("Location watch error:", {
              code: error.code,
              message: error.message,
              PERMISSION_DENIED: error.PERMISSION_DENIED,
              POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
              TIMEOUT: error.TIMEOUT,
            });

            let errorMessage = "Location sharing failed: ";
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage +=
                  "Permission denied. Please enable location services in your browser settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage +=
                  "Location information unavailable. Check your device location settings.";
                break;
              case error.TIMEOUT:
                errorMessage += "Location request timed out. Please try again.";
                break;
              default:
                errorMessage += error.message;
            }

            toast.error(errorMessage);
            stopLocationSharing(orderId);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 30000,
          },
        );

        // Store watchId to stop later
        setLocationWatchId(watchId);
        setIsSharingLocation((prev) => ({ ...prev, [orderId]: true }));

        toast.success("Location sharing started! Customer can now track you.");
      },
      (error) => {
        console.error("Error getting initial location:", {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT,
        });

        let errorMessage = "Failed to get your location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Location permission denied. Please allow location access and try again.";
            showLocationPermissionInstructions();
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

  const handleRestartLocationSharing = async (orderId: string) => {
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
        await startLocationSharing(orderId);
        toast.success(
          "Location sharing restarted! Customer can now track you again.",
        );
      } catch (error) {
        toast.error("Failed to restart location sharing. Please try again.");
        console.error(error);
      }
    }
  };

  const showLocationPermissionInstructions = () => {
    Swal.fire({
      title: "Location Permission Required",
      html: `
      <div class="text-left">
        <p class="mb-3">To share your location, please allow location access:</p>
        <div class="space-y-2 text-sm">
          <div class="flex items-start gap-2">
            <span class="font-semibold">Chrome:</span>
            <span>Click the lock icon in address bar → Site settings → Location → Allow</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="font-semibold">Firefox:</span>
            <span>Click the lock icon → More Information → Permissions → Location Access → Allow</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="font-semibold">Edge:</span>
            <span>Click the lock icon → Permissions for this site → Location → Allow</span>
          </div>
        </div>
        <p class="mt-3 text-blue-600">After allowing, click "Share Location" again.</p>
      </div>
    `,
      icon: "info",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6",
    });
  };

  // Function to stop location sharing
  const stopLocationSharing = (orderId: string) => {
    if (locationWatchId) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }

    setIsSharingLocation((prev) => ({ ...prev, [orderId]: false }));

    if (socket && technicianId) {
      socket.emit("technician-location-stop", {
        technicianId: technicianId,
        bookingId: orderId,
      });
    }
  };

  if (ordersLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <CalendarTodayOutlined className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Orders Yet
        </h3>
        <p className="text-gray-500 mb-4">
          You don't have any orders at the moment.
        </p>
        <p className="text-gray-400 text-sm">
          New orders will appear here when customers book your services.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">All Orders</h3>
          <div className="flex gap-2">
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="confirmed">Confirmed</option>
              <option value="on_the_way">On the Way</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {order.serviceName || "Service"}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #: {order.orderCode || order._id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isOrderExpired(order.scheduledAt) &&
                    order.status === "pending" && (
                      <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        Expired - Auto-cancelling
                      </span>
                    )}
                  <span
                    className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status ? order.status.replace(/_/g, " ") : "Unknown"}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalAmount || 0)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">
                    <strong>Customer:</strong> {getCustomerInfo(order).name}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Phone:</strong> {getCustomerInfo(order).phone}
                  </p>
                  <p className="text-gray-600">
                    <strong>Email:</strong> {getCustomerInfo(order).email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">
                    <strong>When:</strong>{" "}
                    {order.scheduledAt
                      ? formatDateTime(order.scheduledAt)
                      : "Not scheduled"}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <strong>Time Slot:</strong> {order.timeSlot || "Not set"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Address:</strong>{" "}
                    {order.address
                      ? `${order.address.street || ""}, ${
                          order.address.city || ""
                        }`
                      : "Address not available"}
                  </p>
                </div>
              </div>

              {order.problemDescription && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    <strong>Notes:</strong> {order.problemDescription}
                  </p>
                </div>
              )}

              {/* Order Items */}
              {order.orderItems && order.orderItems.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Additional Items:
                  </h5>
                  <div className="space-y-1">
                    {order.orderItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span>
                          {item.customName || "Item"} × {item.quantity || 1}
                        </span>
                        <span>{formatCurrency(item.totalPrice || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Created:{" "}
                  {order.createdAt
                    ? formatDateTime(order.createdAt)
                    : "Date not available"}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {/* Location Sharing Controls */}
                  {order.status === "on_the_way" && (
                    <div className="flex gap-2">
                      {isSharingLocation[order._id] ? (
                        <button
                          onClick={() => stopLocationSharing(order._id)}
                          className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Stop Sharing
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleRestartLocationSharing(order._id)
                          }
                          className="bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          Share Location Again
                        </button>
                      )}
                    </div>
                  )}

                  {/* Pending -> Accept/Decline */}
                  {order.status === "pending" && (
                    <>
                      {(() => {
                        const modification = canModifyOrder(order);
                        return (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                order._id,
                                "accepted",
                                order.orderCode || order._id,
                                order.serviceName || "Service",
                              )
                            }
                            disabled={!modification.allowed}
                            className={`${
                              modification.allowed
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed"
                            } text-white px-4 py-2 rounded text-sm font-medium transition-colors`}
                            title={modification.reason}
                          >
                            Accept Order
                          </button>
                        );
                      })()}
                      {(() => {
                        const modification = canModifyOrder(order);
                        return (
                          <button
                            onClick={() =>
                              handleDeclineOrder(
                                order._id,
                                order.orderCode || order._id,
                                order.serviceName || "Service",
                              )
                            }
                            disabled={!modification.allowed}
                            className={`${
                              modification.allowed
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-gray-400 cursor-not-allowed"
                            } text-white px-4 py-2 rounded text-sm font-medium transition-colors`}
                            title={modification.reason}
                          >
                            Decline
                          </button>
                        );
                      })()}
                    </>
                  )}

                  {/* Accepted -> Confirm/Start Journey */}
                  {order.status === "accepted" && (
                    <>
                      {(() => {
                        const acceptance = canModifyOrder(order);
                        return (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                order._id,
                                "confirmed",
                                order.orderCode || order._id,
                                order.serviceName || "Service",
                              )
                            }
                            disabled={!acceptance.allowed}
                            className={`${
                              acceptance.allowed
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                            } text-white px-4 py-2 rounded text-sm font-medium transition-colors`}
                            title={acceptance.reason}
                          >
                            Confirm Service
                          </button>
                        );
                      })()}
                      {(() => {
                        const acceptance = canModifyOrder(order);
                        return (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                order._id,
                                "on_the_way",
                                order.orderCode || order._id,
                                order.serviceName || "Service",
                              )
                            }
                            disabled={!acceptance.allowed}
                            className={`${
                              acceptance.allowed
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "bg-gray-400 cursor-not-allowed"
                            } text-white px-4 py-2 rounded text-sm font-medium transition-colors`}
                            title={acceptance.reason}
                          >
                            Start Journey
                          </button>
                        );
                      })()}
                    </>
                  )}

                  {/* Confirmed -> Start Journey */}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          order._id,
                          "on_the_way",
                          order.orderCode || order._id,
                          order.serviceName || "Service",
                        )
                      }
                      className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                      Start Journey
                    </button>
                  )}

                  {/* On the Way -> Arrived at Location */}
                  {order.status === "on_the_way" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          order._id,
                          "in_progress",
                          order.orderCode || order._id,
                          order.serviceName || "Service",
                        )
                      }
                      className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Arrived at Location
                    </button>
                  )}

                  {/* In Progress -> Mark Complete */}
                  {order.status === "in_progress" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          order._id,
                          "completed",
                          order.orderCode || order._id,
                          order.serviceName || "Service",
                        )
                      }
                      className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900 transition-colors"
                    >
                      Mark Complete{getCompletionWaitTime(order)}
                    </button>
                  )}

                  {/* Cancellation button for most statuses except completed and cancelled */}
                  {order.status &&
                    !["completed", "cancelled"].includes(order.status) &&
                    (() => {
                      const modification = canModifyOrder(order);
                      return (
                        <button
                          onClick={() =>
                            handleCancelOrder(
                              order._id,
                              order.orderCode || order._id,
                              order.serviceName || "Service",
                            )
                          }
                          disabled={!modification.allowed}
                          className={`${
                            modification.allowed
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-400 cursor-not-allowed"
                          } text-white px-3 py-2 rounded text-sm font-medium transition-colors`}
                          title={modification.reason}
                        >
                          Cancel Order
                        </button>
                      );
                    })()}
                </div>
                <button
                  onClick={() => navigate(`/technician/order/${order._id}`)}
                  className="bg-blue-700 text-white py-2 px-7 rounded"
                >
                  View Details
                </button>
              </div>

              {/* Status History */}
              {order.history && order.history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Status History ({order.history.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {[...order.history].reverse().map((history, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs text-gray-500"
                        >
                          <span>
                            {history.status
                              ? history.status.replace(/_/g, " ")
                              : "Unknown"}{" "}
                            - {history.description || "No description"}
                          </span>
                          <span>
                            {history.timestamp
                              ? formatDateTime(history.timestamp)
                              : "Unknown time"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;
