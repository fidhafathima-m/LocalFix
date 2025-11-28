/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { AdminSidebar } from "../adminDashboard/actions/AdminSidebar";
import {
  AccessTimeOutlined,
  CheckCircleOutlineOutlined,
  CloseOutlined,
  CreditCardOutlined,
  DownloadOutlined,
  SearchOutlined,
  RemoveRedEyeOutlined,
  ReplayOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import type {
  IPayment,
  PaymentStats,
} from "../../../../interface/admin/IPayment";
import { PaymentManagementService } from "../../../../services/admin/PaymentManagementService";
import { ViewPaymentModal } from "./ViewPaymentModal";
import { useDebounce } from "../../../../hooks/useDebounce";
import Swal from "sweetalert2";

const PaymentManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const itemsPerPage = 10;
  const [searchLoading, setSearchLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (searchQuery !== debouncedSearchQuery) {
      setSearchLoading(true);
    } else {
      setSearchLoading(false);
    }
  }, [searchQuery, debouncedSearchQuery]);

  // Load payments and stats from backend
  const loadPayments = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);

      const status = statusFilter !== "All Status" ? statusFilter : undefined;

      const response = await PaymentManagementService.getPayments(
        page,
        itemsPerPage,
        search,
        status
      );

      if (response) {
        setPayments(response.payments || []);
        setTotalCount(response.total || 0);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error: any) {
      console.error("Error loading payments:", error);
      toast.error(error.message || "Failed to load payments");
      setPayments([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await PaymentManagementService.getPaymentStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading payment stats:", error);
      toast.error("Failed to load payment statistics");
    }
  };

  useEffect(() => {
    loadPayments(currentPage, debouncedSearchQuery);
    loadStats();
  }, [currentPage, debouncedSearchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchQuery]);

  const handleRefund = async (paymentId: string) => {
    try {
      // Show confirmation dialog with refund reason input
      const { value: reason } = await Swal.fire({
        title: "Process Refund",
        html: `
        <div class="text-left">
          <p class="mb-3 text-gray-600">This action will refund the payment amount to the user's wallet.</p>
          <label for="refund-reason" class="block text-sm font-medium text-gray-700 mb-2">Refund Reason</label>
          <textarea 
            id="refund-reason" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows="3" 
            placeholder="Enter refund reason (optional)"
          >Admin initiated refund</textarea>
        </div>
      `,
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Process Refund",
        cancelButtonText: "Cancel",
        focusConfirm: false,
        preConfirm: () => {
          const reason = (
            document.getElementById("refund-reason") as HTMLTextAreaElement
          ).value;
          return reason || "Admin initiated refund";
        },
        customClass: {
          popup: "rounded-lg",
          confirmButton: "px-4 py-2 text-sm font-medium",
          cancelButton: "px-4 py-2 text-sm font-medium",
        },
      });

      if (reason) {
        const result = await PaymentManagementService.processRefund(
          paymentId,
          reason
        );

        if (result.success) {
          toast.success(
            "Payment has been refunded and amount credited to user's wallet"
          );

          // Refresh data
          await loadPayments(currentPage, debouncedSearchQuery);
          await loadStats();
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error: any) {
      console.error("Error processing refund:", error);

      toast.error(error.message || "Failed to process refund");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await PaymentManagementService.exportPayments("csv", {
        search: debouncedSearchQuery,
        status: statusFilter !== "All Status" ? statusFilter : undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Payments exported successfully");
    } catch (error: any) {
      console.error("Error exporting payments:", error);
      toast.error(error.message || "Failed to export payments");
    }
  };

  const handleViewDetails = (payment: IPayment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const getStatusBadge = (status: IPayment["status"]) => {
    const statusConfig = {
      success: { class: "bg-green-100 text-green-800", label: "Completed" },
      pending: { class: "bg-yellow-100 text-yellow-800", label: "Pending" },
      failed: { class: "bg-red-100 text-red-800", label: "Failed" },
      refunded: { class: "bg-purple-100 text-purple-800", label: "Refunded" },
      initiated: { class: "bg-blue-100 text-blue-800", label: "Initiated" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}
      >
        {config.label}
      </span>
    );
  };
  if (loading && payments.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Payments" />
        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading payments...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar activePage="Payments" />

        <div className="flex-1 overflow-y-auto ml-[240px]">
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Payment Management</h1>
              <p className="text-gray-600">
                Manage all payment transactions, refunds, and payouts to
                technicians.
              </p>
            </div>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-blue-100 rounded-md mr-3">
                  <CreditCardOutlined className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold">
                    ₹{stats?.totalRevenue?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-green-100 rounded-md mr-3">
                  <CheckCircleOutlineOutlined className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Tax Collected</p>
                  <p className="text-xl font-bold">
                    ₹{stats?.platformCommission?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-yellow-100 rounded-md mr-3">
                  <AccessTimeOutlined className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Payments</p>
                  <p className="text-xl font-bold">
                    {stats?.pendingPayments || 0}
                  </p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg flex items-start">
                <div className="p-2 bg-red-100 rounded-md mr-3">
                  <CloseOutlined className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Refunded/Failed</p>
                  <p className="text-xl font-bold">
                    {stats?.failedPayments || 0}
                  </p>
                </div>
              </div>
            </div>
            {/* Search and filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto flex-1">
                  <div className="relative">
                    <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID, user, booking, or service"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
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
                      <option>All Status</option>
                      <option>success</option>
                      <option>pending</option>
                      <option>failed</option>
                      <option>refunded</option>
                      <option>initiated</option>
                    </select>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <DownloadOutlined className="w-5 h-5" />
                    Export
                  </button>
                </div>
              </div>
            </div>
            {/* Payments table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      {/* Removed Date column as it's less important */}
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
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.providerOrderId}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {payment.paymentProvider}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.userName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.userEmail}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.orderId}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {payment.serviceName || payment.type}
                              </div>
                            </div>
                          </td>
                          {/* Removed Date column data */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{payment.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="p-1 rounded-full text-blue-600 hover:bg-blue-100 cursor-pointer"
                                title="View Details"
                                onClick={() => handleViewDetails(payment)}
                              >
                                <RemoveRedEyeOutlined className="h-5 w-5" />
                              </button>
                              {payment.status === "success" && (
                                <button
                                  className="p-1 rounded-full text-orange-600 hover:bg-orange-100 cursor-pointer"
                                  title="Process Refund"
                                  onClick={() => handleRefund(payment.id)}
                                >
                                  <ReplayOutlined className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-8 text-center text-sm text-gray-500"
                        >
                          {searchQuery ? (
                            <div>
                              <p>No payments found matching "{searchQuery}"</p>
                              <button
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-blue-600 hover:text-blue-800"
                              >
                                Clear search
                              </button>
                            </div>
                          ) : (
                            <p>No payments found.</p>
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
                    Showing {payments.length} of {totalCount} payments
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

      {/* View Payment Modal */}
      {showViewModal && selectedPayment && (
        <ViewPaymentModal
          payment={selectedPayment}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPayment(null);
          }}
          onRefund={handleRefund}
        />
      )}
    </>
  );
};

export default PaymentManagement;
