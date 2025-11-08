import React from "react";
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

const OrdersTab: React.FC<TabProps> = ({
  orders,
  ordersLoading,
  onUpdateOrderStatus,
}) => {
  const handleCancelOrder = async (orderId: string, orderCode: string, serviceName: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
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
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel order!',
      cancelButtonText: 'No, keep order',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-4 py-2 text-sm font-medium',
        cancelButton: 'px-4 py-2 text-sm font-medium'
      }
    });

    if (result.isConfirmed) {
      // Show reason input for cancellation
      const { value: reason } = await Swal.fire({
        title: 'Cancellation Reason',
        input: 'textarea',
        inputLabel: 'Please provide a reason for cancellation:',
        inputPlaceholder: 'Enter the reason for cancelling this order...',
        inputAttributes: {
          'aria-label': 'Enter cancellation reason'
        },
        showCancelButton: true,
        confirmButtonText: 'Confirm Cancellation',
        cancelButtonText: 'Go Back',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        inputValidator: (value) => {
          if (!value) {
            return 'Please provide a cancellation reason!';
          }
          if (value.length < 10) {
            return 'Reason should be at least 10 characters long';
          }
          return null;
        },
        customClass: {
          popup: 'rounded-lg',
          input: 'resize-none',
          confirmButton: 'px-4 py-2 text-sm font-medium',
          cancelButton: 'px-4 py-2 text-sm font-medium'
        }
      });

      if (reason) {
        try {
          await onUpdateOrderStatus(orderId, "cancelled", reason);
          
          toast.success("The order has been cancelled successfully")
        } catch (error) {
          toast.error("Failed to cancel the order. Please try again.");
          console.error(error)
        }
      }
    }
  };

  const handleDeclineOrder = async (orderId: string, orderCode: string, serviceName: string) => {
    const result = await Swal.fire({
      title: 'Decline Order?',
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
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, decline order',
      cancelButtonText: 'Keep order',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-lg',
        confirmButton: 'px-4 py-2 text-sm font-medium',
        cancelButton: 'px-4 py-2 text-sm font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        await onUpdateOrderStatus(orderId, "cancelled", "Technician unavailable");
        
        toast.success("The order has been declined successfully.")
      } catch (error) {
        toast.error("Failed to decline the order. Please try again.");
        console.error(error)
      }
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, orderCode: string, serviceName: string) => {
    const statusMessages: { [key: string]: { title: string; message: string; icon: 'success' | 'info' | 'warning' } } = {
      accepted: {
        title: 'Accept Order?',
        message: `Are you sure you want to accept order ${orderCode} for ${serviceName}?`,
        icon: 'success'
      },
      confirmed: {
        title: 'Confirm Service?',
        message: `Confirm that you will perform ${serviceName} for order ${orderCode}?`,
        icon: 'info'
      },
      on_the_way: {
        title: 'Start Journey?',
        message: `Mark yourself as on the way for order ${orderCode}?`,
        icon: 'warning'
      },
      in_progress: {
        title: 'Arrived at Location?',
        message: `Confirm that you have arrived and started working on order ${orderCode}?`,
        icon: 'info'
      },
      completed: {
        title: 'Mark as Complete?',
        message: `Mark order ${orderCode} as completed? This will finalize the service.`,
        icon: 'success'
      }
    };

    const statusConfig = statusMessages[newStatus];
    
    if (statusConfig) {
      const result = await Swal.fire({
        title: statusConfig.title,
        text: statusConfig.message,
        icon: statusConfig.icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
          popup: 'rounded-lg',
          confirmButton: 'px-4 py-2 text-sm font-medium',
          cancelButton: 'px-4 py-2 text-sm font-medium'
        }
      });

      if (result.isConfirmed) {
        try {
          await onUpdateOrderStatus(orderId, newStatus);
          
          toast.success(`Order status updated to ${newStatus.replace('_', ' ')}.`)
        } catch (error) {
          toast.error("Failed to update order status. Please try again.")
          console.error(error)
        }
      }
    } else {
      // Direct status update without confirmation for other statuses
      await onUpdateOrderStatus(orderId, newStatus);
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
                  <span
                    className={`px-3 py-1 text-sm rounded-full flex items-center gap-1 ${getStatusColor(
                      order.status
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
                      ? `${order.address.street || ""}, ${order.address.city || ""}`
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
                  {/* Pending -> Accept/Decline */}
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order._id, "accepted", order.orderCode || order._id, order.serviceName || "Service")}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleDeclineOrder(order._id, order.orderCode || order._id, order.serviceName || "Service")}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {/* Accepted -> Confirm/Start Journey */}
                  {order.status === "accepted" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order._id, "confirmed", order.orderCode || order._id, order.serviceName || "Service")}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        Confirm Service
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order._id, "on_the_way", order.orderCode || order._id, order.serviceName || "Service")}
                        className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-700 transition-colors"
                      >
                        Start Journey
                      </button>
                    </>
                  )}

                  {/* Confirmed -> Start Journey */}
                  {order.status === "confirmed" && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, "on_the_way", order.orderCode || order._id, order.serviceName || "Service")}
                      className="bg-orange-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-700 transition-colors"
                    >
                      Start Journey
                    </button>
                  )}

                  {/* On the Way -> Arrived at Location */}
                  {order.status === "on_the_way" && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, "in_progress", order.orderCode || order._id, order.serviceName || "Service")}
                      className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Arrived at Location
                    </button>
                  )}

                  {/* In Progress -> Mark Complete */}
                  {order.status === "in_progress" && (
                    <button
                      onClick={() => handleStatusUpdate(order._id, "completed", order.orderCode || order._id, order.serviceName || "Service")}
                      className="bg-gray-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-900 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}

                  {/* Cancellation button for most statuses except completed and cancelled */}
                  {order.status && !["completed", "cancelled"].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order._id, order.orderCode || order._id, order.serviceName || "Service")}
                      className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Status History */}
              {order.history && order.history.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Status History ({order.history.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {[...order.history]
                        .reverse()
                        .map((history, index) => (
                          <div
                            key={index}
                            className="flex justify-between text-xs text-gray-500"
                          >
                            <span>
                              {history.status ? history.status.replace(/_/g, " ") : "Unknown"} -{" "}
                              {history.description || "No description"}
                            </span>
                            <span>
                              {history.timestamp ? formatDateTime(history.timestamp) : "Unknown time"}
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