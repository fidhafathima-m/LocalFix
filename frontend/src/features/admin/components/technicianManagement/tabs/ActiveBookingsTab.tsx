import React, { useState, useEffect } from "react";
import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";
import { OrderManagementService } from "../../../../../services/admin/OrderManagementService";
import { formatDateTime} from "../utils/dateUtils";
import {
  CalendarTodayOutlined,
  FmdGoodOutlined,
  AccessTime,
} from "@mui/icons-material";

interface ActiveBookingsTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

interface Order {
  _id: string;
  orderCode: string;
  serviceName: string;
  scheduledAt: string;
  timeSlot: string;
  status: string;
  totalAmount: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userId: any;
  problemDescription?: string;
  createdAt: string;
  updatedAt: string;
}

const ActiveBookingsTab: React.FC<ActiveBookingsTabProps> = ({
  technician,
  isSuspended,
}) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      if (!technician?._id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all orders for this technician
        const response = await OrderManagementService.getOrdersByTechnician(technician._id, 1, 100);
        
        const orders = response.orders || response.data?.orders || [];

        // Filter active orders (pending, accepted, in_progress, on_the_way)
        const active = orders.filter((order: Order) =>
          ["pending", "accepted", "in_progress", "on_the_way"].includes(order.status)
        );

        setActiveOrders(active);
      } catch (err) {
        console.error('Error fetching active orders:', err);
        setError('Failed to load active bookings');
      } finally {
        setLoading(false);
      }
    };

    if (!isSuspended) {
      fetchActiveOrders();
    }
  }, [technician?._id, isSuspended]);

  const getCustomerInfo = (order: Order) => {
    try {
      if (order.userId && typeof order.userId === 'object') {
        return {
          name: order.userId.fullName || "Customer",
          phone: order.userId.phone || "Not provided",
          email: order.userId.email || "Not provided",
        };
      } else if (typeof order.userId === 'string') {
        const fullNameMatch = order.userId.match(/fullName:\s*'([^']+)'/);
        const phoneMatch = order.userId.match(/phone:\s*'([^']+)'/);
        const emailMatch = order.userId.match(/email:\s*'([^']+)'/);

        return {
          name: fullNameMatch ? fullNameMatch[1] : "Customer",
          phone: phoneMatch ? phoneMatch[1] : "Not provided",
          email: emailMatch ? emailMatch[1] : "Not provided",
        };
      }
    } catch (error) {
      console.error("Error getting customer info:", error);
    }

    return {
      name: "Customer",
      phone: "Not provided",
      email: "Not provided",
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "on_the_way":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AccessTime className="h-4 w-4" />;
      case "accepted":
        return <CalendarTodayOutlined className="h-4 w-4" />;
      case "in_progress":
        return <div className="h-2 w-2 bg-purple-500 rounded-full"></div>;
      case "on_the_way":
        return <div className="h-2 w-2 bg-green-500 rounded-full"></div>;
      default:
        return <AccessTime className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Awaiting Confirmation";
      case "accepted":
        return "Confirmed";
      case "in_progress":
        return "In Progress";
      case "on_the_way":
        return "On the Way";
      default:
        return status.replace("_", " ");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-6">Active Bookings</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading active bookings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-6">Active Bookings</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Active Bookings</h2>
        {activeOrders.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
            {activeOrders.length} {activeOrders.length === 1 ? "Booking" : "Bookings"}
          </span>
        )}
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <CalendarTodayOutlined className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No Active Bookings</p>
          <p className="text-gray-500 text-sm">
            This technician doesn't have any active bookings at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map((order) => {
            const customerInfo = getCustomerInfo(order);
            
            return (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {order.serviceName}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">
                          <strong>Customer:</strong> {customerInfo.name}
                        </p>
                        <p className="text-gray-600 mb-1">
                          <strong>Phone:</strong> {customerInfo.phone}
                        </p>
                        <p className="text-gray-600">
                          <strong>Email:</strong> {customerInfo.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1 flex items-center">
                          <CalendarTodayOutlined className="h-4 w-4 mr-1 text-gray-400" />
                          <strong>When:</strong> {formatDateTime(order.scheduledAt)}
                        </p>
                        <p className="text-gray-600 mb-1">
                          <strong>Time Slot:</strong> {order.timeSlot}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <FmdGoodOutlined className="h-4 w-4 mr-1 text-gray-400" />
                          <strong>Address:</strong> {order.address.street}, {order.address.city}
                        </p>
                      </div>
                    </div>

                    {order.problemDescription && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          <strong>Problem Description:</strong> {order.problemDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Order ID: {order.orderCode}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{order.totalAmount?.toLocaleString() || "0"}
                  </div>
                </div>

                {/* Status-specific actions for admin */}
                <div className="flex justify-end items-center mt-3 gap-2">
                  {order.status === "pending" && (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      Awaiting technician confirmation
                    </span>
                  )}
                  {order.status === "accepted" && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Technician confirmed
                    </span>
                  )}
                  {order.status === "in_progress" && (
                    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      Service in progress
                    </span>
                  )}
                  {order.status === "on_the_way" && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Technician on the way
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {activeOrders.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Booking Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg font-bold text-blue-800">{activeOrders.length}</p>
              <p className="text-xs text-blue-600">Total Active</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-lg font-bold text-yellow-800">
                {activeOrders.filter(order => order.status === "pending").length}
              </p>
              <p className="text-xs text-yellow-600">Pending</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg font-bold text-blue-800">
                {activeOrders.filter(order => order.status === "accepted").length}
              </p>
              <p className="text-xs text-blue-600">Confirmed</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-lg font-bold text-purple-800">
                {activeOrders.filter(order => ["in_progress", "on_the_way"].includes(order.status)).length}
              </p>
              <p className="text-xs text-purple-600">In Progress</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveBookingsTab;