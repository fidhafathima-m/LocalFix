/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  ReceiptOutlined,
  ExpandMoreOutlined,
  VisibilityOutlined,
  PersonOutlined,
  BuildOutlined,
} from "@mui/icons-material";
import Search from "../adminDashboard/actions/Search";
import type { Order, OrderStats } from "../../../../interface/admin/IAdminApi";
import { OrderManagementService } from "../../../../services/admin/OrderManagementService";
import { AdminSidebar } from "../adminDashboard/actions/AdminSidebar";
import { useDebounce } from "../../../../hooks/useDebounce";

const OrderManagement: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [stats, setStats] = useState<OrderStats | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ordersPerPage = 10;

  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // Load orders from backend with filters
  const loadOrders = async (
    page: number = 1,
    search?: string,
    status?: string
  ) => {
    try {
      setLoading(true);
      const response = await OrderManagementService.getOrders(
        page,
        ordersPerPage,
        search,
        status !== "all" ? status : undefined
      );

      if (response && typeof response === "object") {
        // Handle the response structure from backend
        const ordersData =
          response.orders || response.data?.orders || response.data || response;

        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
          setTotalCount(ordersData.length);
          setTotalPages(Math.ceil(ordersData.length / ordersPerPage));
        } else if (ordersData && typeof ordersData === "object") {
          // Handle paginated response
          setOrders(ordersData.orders || ordersData.services || []);
          setTotalCount(ordersData.total || 0);
          setTotalPages(ordersData.totalPages || 1);
        } else {
          console.error("Invalid orders data structure:", ordersData);
          setOrders([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } else {
        console.error("Invalid response structure:", response);
        setOrders([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("Error loading orders:", error);
      toast.error(error.message || "Failed to load orders");
      setOrders([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Load order stats
  const loadOrderStats = async () => {
    try {
      const response = await OrderManagementService.getOrderStats();
      if (response && response.stats) {
        setStats(response.stats);
      }
    } catch (error: any) {
      console.error("Error loading order stats:", error);
    }
  };

  useEffect(() => {
    loadOrders(currentPage, debouncedSearchQuery, statusFilter);
    loadOrderStats();
  }, [currentPage, debouncedSearchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Orders" />
        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading orders...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activePage="Orders" />

      <div className="flex-1 overflow-y-auto ml-[240px]">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order Management</h1>
                <p className="text-gray-600">
                  Manage service orders, track their status, and view order
                  details.
                </p>
              </div>
            </div>
          </div>

          {/* Stats cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <ReceiptOutlined className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-green-100 rounded-md mr-3">
                  <ReceiptOutlined className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-bold">{stats.completedOrders}</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-purple-100 rounded-md mr-3">
                  <ReceiptOutlined className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-xl font-bold">{stats.inProgressOrders}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search and filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-auto flex-1">
                <div className="relative">
                  <Search value={searchQuery} onChange={handleSearch} />
                  {searchLoading && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full md:w-auto flex gap-4">
                <div className="relative">
                  <select
                    className="appearance-none w-full md:w-40 pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service & Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        {/* Order Details */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                              <ReceiptOutlined className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderCode}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(order.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                              <PersonOutlined className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {order.userId.fullName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.userId.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Technician */}
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {order.technicianId.profilePictureUrl ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={order.technicianId.profilePictureUrl}
                                alt={order.technicianId.displayName}
                              />
                            ) : (
                              <div className="h-8 w-8 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                                <BuildOutlined className="h-4 w-4 text-green-600" />
                              </div>
                            )}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {order.technicianId.displayName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Service & Schedule */}
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {order.serviceName}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{formatDateTime(order.scheduledAt)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.timeSlot}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.payment.method.toUpperCase()} •{" "}
                            {order.payment.status}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100 cursor-pointer"
                              onClick={() =>
                                navigate(`/admin/order-management/${order._id}`)
                              }
                              title="View Order Details"
                            >
                              <VisibilityOutlined className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        {searchQuery || statusFilter !== "all" ? (
                          <div>
                            <p>No orders found matching your filters</p>
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setStatusFilter("all");
                              }}
                              className="mt-2 text-blue-600 hover:text-blue-800"
                            >
                              Clear filters
                            </button>
                          </div>
                        ) : (
                          <p>No orders found.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • Showing {orders.length}{" "}
                  of {totalCount} orders
                </span>

                <div className="flex space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
