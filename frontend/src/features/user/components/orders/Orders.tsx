/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  FmdGoodOutlined,
  CreditCardOutlined,
  StarBorderOutlined,
  CheckCircleOutlineOutlined,
  CancelOutlined,
  LocalShippingOutlined,
  PersonOutlined,
  RefreshOutlined,
  PaymentOutlined,
  ChevronLeft,
  ChevronRight,
  DeleteOutlined,
  WarningOutlined,
} from "@mui/icons-material";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import { orderService } from "../../../../services/user/orderService";
import { type OrderResponse } from "../../../../services/user/orderService";
import { useAppSelector } from "../../../../hooks/redux";
import { selectUser } from "../../../../store/slices/authSlice";
import toast from "react-hot-toast";
import { reviewService } from "../../../../services/user/reviewService";
import Swal from "sweetalert2";
import InvoiceModal from "./InvoicePreview";
import FailedPaymentCard from "./FailedPaymentCard";

const ITEMS_PER_PAGE = 5;

const MyOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"active" | "history" | "failed">(
    "active"
  );
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
    null
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    pages: 0,
  });

  const currentUser = useAppSelector(selectUser);
  const navigate = useNavigate();

  const [dismissedPayments, setDismissedPayments] = useState<string[]>([]);

  useEffect(() => {
    const savedDismissed = localStorage.getItem("dismissedFailedPayments");
    if (savedDismissed) {
      setDismissedPayments(JSON.parse(savedDismissed));
    }
    fetchOrders(1, ITEMS_PER_PAGE);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "dismissedFailedPayments",
      JSON.stringify(dismissedPayments)
    );
  }, [dismissedPayments]);

  useEffect(() => {
    fetchOrders(1, ITEMS_PER_PAGE);
  }, []);

  const fetchOrders = async (
    page: number = 1,
    limit: number = ITEMS_PER_PAGE
  ) => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders(page, limit);

      if (response.success && response.data) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchOrders(newPage, pagination.limit);
  };

  const handleTabChange = (tab: "active" | "history" | "failed") => {
    setActiveTab(tab);
    // Reset to first page when changing tabs
    fetchOrders(1, ITEMS_PER_PAGE);
  };

  const handleOpenInvoiceModal = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setSelectedOrder(null);
  };

  const getInvoiceData = () => {
    if (!selectedOrder) return null;

    return {
      bookingId: selectedOrder.bookingId,
      service: selectedOrder.serviceName,
      technician: {
        displayName: selectedOrder.technicianId.displayName,
        _id: selectedOrder.technicianId._id,
      },
      date: selectedOrder.scheduledAt,
      time: selectedOrder.timeSlot,
      amount: selectedOrder.totalAmount,
      paymentMethod: selectedOrder.payment.method,
      paymentId: selectedOrder.payment.transactionId,
      problemDescription: selectedOrder.problemDescription,
      address: {
        street: selectedOrder.address.street,
        city: selectedOrder.address.city,
        state: selectedOrder.address.state,
        pincode: selectedOrder.address.pincode,
        landmark: selectedOrder.address.landmark,
      },
      user: currentUser
        ? {
            fullName: currentUser.fullName || "Customer",
            phoneNumber: currentUser.phone || "Phone not available",
            email: currentUser.email || "Email not available",
          }
        : undefined,
      orderId: selectedOrder._id,
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot
      .split(" - ")
      .map((time) => time.replace(/(:\d{2})(?::\d{2})? (AM|PM)/, "$1 $2"))
      .join(" - ");
  };

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      pending: {
        color: "text-gray-600",
        icon: AccessTimeOutlined,
        text: "Pending",
      },
      accpted: {
        color: "text-green-400",
        icon: CheckCircleOutlineOutlined,
        text: "Accepted",
      },
      confirmed: {
        color: "text-green-600",
        icon: CheckCircleOutlineOutlined,
        text: "Confirmed",
      },
      in_progress: {
        color: "text-blue-600",
        icon: LocalShippingOutlined,
        text: "In Progress",
      },
      on_the_way: {
        color: "text-blue-600",
        icon: LocalShippingOutlined,
        text: "Technician on the way",
      },
      completed: {
        color: "text-green-600",
        icon: CheckCircleOutlineOutlined,
        text: "Completed",
      },
      cancelled: {
        color: "text-red-600",
        icon: CancelOutlined,
        text: "Cancelled",
      },
      refunded: {
        color: "text-red-600",
        icon: CancelOutlined,
        text: "Refunded",
      },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  const getActiveOrders = () => {
    return orders.filter((order) =>
      [
        "pending",
        "accepted",
        "confirmed",
        "in_progress",
        "on_the_way",
      ].includes(order.status)
    );
  };

  const getHistoryOrders = () => {
    return orders.filter((order) =>
      ["completed", "cancelled", "refunded"].includes(order.status)
    );
  };

  const handleCancelOrder = async (orderId: string) => {
    navigate(`/cancel-order/${orderId}`);
  };

  const handleRescheduleOrder = (order: OrderResponse) => {
    navigate("/reschedule-service", {
      state: {
        orderId: order._id,
        bookingId: order.bookingId,
        orderCode: order.orderCode,
        serviceName: order.serviceName,
        problemDescription: order.problemDescription,
        currentDate: order.scheduledAt,
        currentTimeSlot: order.timeSlot,
        address: order.address,
        technician: order.technicianId,
      },
    });
  };

  const handleLeaveReview = async (orderId: string) => {
    try {
      const existingReviewResponse = await reviewService.getOrderReview(
        orderId
      );

      if (existingReviewResponse.success && existingReviewResponse.data) {
        const result = await Swal.fire({
          title: "Edit Existing Review?",
          text: "You have already submitted a review for this order. Would you like to edit it?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, Edit Review",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
        });

        if (result.isConfirmed) {
          navigate(`/leave-a-review/${orderId}`, {
            state: {
              existingReview: existingReviewResponse.data,
              mode: "edit" as const,
            },
          });
        }
      } else {
        navigate(`/leave-a-review/${orderId}`, {
          state: {
            mode: "create" as const,
          },
        });
      }
    } catch (error) {
      console.error("Error checking existing review:", error);
      navigate(`/leave-a-review/${orderId}`, {
        state: {
          mode: "create" as const,
        },
      });
    }
  };

  const handleBookAgain = (serviceName: string) => {
    toast.success(`Redirecting to book ${serviceName} again`);
  };

  const getFailedPaymentOrders = () => {
    return orders
      .filter((order) => {
        // Skip if payment is dismissed
        if (dismissedPayments.includes(order._id)) {
          return false;
        }

        // Only include orders where payment actually failed and order is still active
        const isFailedPayment =
          order.payment.status === "failed" &&
          order.status !== "cancelled" && // Exclude cancelled orders
          order.status !== "refunded"; // Exclude refunded orders

        const isRecent =
          new Date(order.createdAt) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

        return isFailedPayment && isRecent;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  };
  const handleDismissPayment = (orderId: string) => {
    setDismissedPayments((prev) => [...prev, orderId]);
    toast.success("Failed payment dismissed");
  };

  const handleCleanupOldPayments = async () => {
    const result = await Swal.fire({
      title: "Clear Old Failed Payments?",
      text: "This will remove all failed payments older than 7 days. This action cannot be undone.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, Clear All",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      // Get all failed payment orders that are older than 7 days
      const oldFailedPayments = orders
        .filter((order) => {
          const isFailed =
            order.payment.status === "failed" &&
            order.status !== "cancelled" &&
            order.status !== "refunded";
          const isOld =
            new Date(order.createdAt) <=
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return isFailed && isOld;
        })
        .map((order) => order._id);

      if (oldFailedPayments.length > 0) {
        setDismissedPayments((prev) => [...prev, ...oldFailedPayments]);
        toast.success(
          `Cleared ${oldFailedPayments.length} old failed payments`
        );
      } else {
        toast.success("No old failed payments to clear");
      }
    }
  };

  const handleRetryPayment = (order: OrderResponse) => {
    // Check if order is still eligible for payment retry
    if (order.status === "cancelled" || order.status === "refunded") {
      toast.error("This order has been cancelled and cannot be paid for");
      return;
    }

    navigate("/retry-payment", {
      state: {
        bookingId: order.bookingId,
        orderId: order._id,
        bookingData: {
          technician: order.technicianId,
          service: order.serviceName,
          date: order.scheduledAt,
          time: order.timeSlot,
          address: order.address,
          usesSavedAddress: true,
          problemDescription: order.problemDescription,
        },
        pricing: {
          subtotal: order.totalAmount - Math.round(order.totalAmount * 0.1),
          serviceTax: Math.round(order.totalAmount * 0.1),
          total: order.totalAmount,
        },
        error: "Payment failed previously",
        existingOrder: order,
      },
    });
  };

  // Pagination Component
  const Pagination = () => {
    const { page, pages } = pagination;

    if (pages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-8 border-t pt-6">
        <div className="text-sm text-gray-700">
          Showing page {page} of {pages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
              page <= 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let pageNum;
              if (pages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pages - 2) {
                pageNum = pages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                    page === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pages}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
              page >= pages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-50 cursor-pointer"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeOrders = getActiveOrders();
  const historyOrders = getHistoryOrders();
  const failedPaymentOrders = getFailedPaymentOrders();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <div className="flex items-center gap-4">
            {activeTab === "failed" && getFailedPaymentOrders().length > 0 && (
              <button
                onClick={handleCleanupOldPayments}
                className="text-gray-600 hover:text-gray-800 font-semibold flex items-center gap-2 text-sm"
              >
                <DeleteOutlined className="w-4 h-4" />
                Clear Old Payments
              </button>
            )}
            <button
              onClick={() => fetchOrders(pagination.page, pagination.limit)}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
            >
              <RefreshOutlined className="w-5 h-5" />
              Refresh
            </button>
            <Link
              to="/services"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Book New Service
            </Link>
          </div>
        </div>
        <div className="flex gap-8 border-b mb-6 overflow-x-auto">
          <button
            onClick={() => handleTabChange("active")}
            className={`pb-3 px-1 font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === "active"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <LocalShippingOutlined className="w-5 h-5" />
              Active Orders (
              {pagination.total > 0 ? `${activeOrders.length}` : "0"})
            </div>
            {activeTab === "active" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => handleTabChange("failed")}
            className={`pb-3 px-1 font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === "failed"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <PaymentOutlined className="w-5 h-5" />
              Failed Payments ({failedPaymentOrders.length})
            </div>
            {activeTab === "failed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => handleTabChange("history")}
            className={`pb-3 px-1 font-semibold transition-colors relative whitespace-nowrap ${
              activeTab === "history"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <AccessTimeOutlined className="w-5 h-5" />
              Order History (
              {pagination.total > 0 ? `${historyOrders.length}` : "0"})
            </div>
            {activeTab === "history" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
        {/* Failed Payments Tab Content */}
        {activeTab === "failed" && (
          <div className="space-y-6">
            {failedPaymentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleOutlineOutlined className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  No Failed Payments
                </h2>
                <p className="text-gray-600 mb-6">
                  {dismissedPayments.length > 0
                    ? "All failed payments have been dismissed or cleared."
                    : "You don't have any failed payments to retry."}
                </p>
                {dismissedPayments.length > 0 && (
                  <button
                    onClick={() => setDismissedPayments([])}
                    className="text-blue-600 hover:text-blue-800 font-semibold mb-4 me-5"
                  >
                    Restore Dismissed Payments
                  </button>
                )}
                <Link
                  to="/services"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                >
                  Book a Service
                </Link>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <WarningOutlined className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 text-sm">
                        Failed payments are automatically cleared after 7 days.
                        You can dismiss individual payments or clear all old
                        ones.
                      </p>
                    </div>
                  </div>
                </div>
                {failedPaymentOrders.map((order) => (
                  <FailedPaymentCard
                    key={order._id}
                    order={order}
                    formatDate={formatDate}
                    formatTimeSlot={formatTimeSlot}
                    onRetryPayment={() => handleRetryPayment(order)}
                    onDismissPayment={handleDismissPayment}
                  />
                ))}
              </>
            )}
          </div>
        )}
        {/* Active Orders Tab Content */}
        {activeTab === "active" && (
          <div className="space-y-6">
            {activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleOutlineOutlined className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Active Orders</h2>
                <p className="text-gray-600 mb-6">
                  You don't have any active orders at the moment.
                </p>
                <Link
                  to="/services"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                >
                  Book a Service
                </Link>
              </div>
            ) : (
              activeOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  formatDate={formatDate}
                  formatTimeSlot={formatTimeSlot}
                  getStatusConfig={getStatusConfig}
                  onReschedule={handleRescheduleOrder}
                  onCancel={handleCancelOrder}
                  onTrack={() => navigate(`/bookings/${order.bookingId}`)}
                />
              ))
            )}
            <Pagination />
          </div>
        )}
        {/* Order History Tab Content */}
        {activeTab === "history" && (
          <div className="space-y-6">
            {historyOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AccessTimeOutlined className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  No Orders Yet Completed
                </h2>
                <p className="text-gray-600 mb-6">
                  You don't have any completed orders in your history yet.
                </p>
                <Link
                  to="/services"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
                >
                  Book a Service
                </Link>
              </div>
            ) : (
              historyOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  formatDate={formatDate}
                  formatTimeSlot={formatTimeSlot}
                  getStatusConfig={getStatusConfig}
                  onDownloadInvoice={() => handleOpenInvoiceModal(order)}
                  onLeaveReview={() => handleLeaveReview(order._id)}
                  onBookAgain={() => handleBookAgain(order.serviceName)}
                  isHistory={true}
                />
              ))
            )}
            <Pagination />
          </div>
        )}
        {/* No Orders Fallback - Only show when there are no orders at all */}
        {orders.length === 0 && activeTab !== "failed" && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LocalShippingOutlined className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/services"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Book Your First Service
            </Link>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {selectedOrder && getInvoiceData() && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={handleCloseInvoiceModal}
          invoiceData={getInvoiceData()!}
        />
      )}

      <Footer />
    </div>
  );
};

// Order Card Component for better organization
interface OrderCardProps {
  order: OrderResponse;
  formatDate: (date: string) => string;
  formatTimeSlot: (time: string) => string;
  getStatusConfig: (status: string) => any;
  onReschedule?: (order: OrderResponse) => void;
  onCancel?: (orderId: string) => void;
  onTrack?: () => void;
  onDownloadInvoice?: () => void;
  onLeaveReview?: () => void;
  onBookAgain?: () => void;
  isHistory?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  formatDate,
  formatTimeSlot,
  getStatusConfig,
  onReschedule,
  onCancel,
  onTrack,
  onDownloadInvoice,
  onLeaveReview,
  onBookAgain,
  isHistory = false,
}) => {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  console.log("Order: ", order);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 ${statusConfig.color}`}>
          <StatusIcon className="w-5 h-5" />
          <span className="font-semibold">{statusConfig.text}</span>
        </div>
        <span className="text-sm text-gray-600">
          Order ID: {order.orderCode}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-2">{order.serviceName}</h3>
          <p className="text-gray-600 mb-4">
            {order.problemDescription || "Standard service"}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <CalendarTodayOutlined className="w-4 h-4" />
              <span>Date</span>
              <span className="ml-auto">{formatDate(order.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <AccessTimeOutlined className="w-4 h-4" />
              <span>Time Slot</span>
              <span className="ml-auto">{formatTimeSlot(order.timeSlot)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <FmdGoodOutlined className="w-4 h-4" />
              <span>Address</span>
              <span className="ml-auto">
                {order.address.street}, {order.address.city}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CreditCardOutlined className="w-4 h-4" />
              <span>Payment</span>
              <span className="ml-auto">
                ₹{order.totalAmount} •{" "}
                {order.payment.method === "cod"
                  ? "Cash on Delivery (Pay when service is complete)"
                  : order.payment.method === "online"
                  ? "Online Payment"
                  : "Wallet Payment"}
                {order.payment.method === "cod" &&
                  order.payment.status === "pending" &&
                  " ⏳"}
                {order.status === "cancelled" &&
                  order.payment.method === "online" &&
                  " (Refunded)"}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Technician</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {order.technicianId.profilePictureUrl ? (
                <img
                  src={order.technicianId.profilePictureUrl}
                  alt={order.technicianId.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <PersonOutlined className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div>
              <div className="font-semibold">
                {order.technicianId.displayName}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{order.technicianId.averageRating.toFixed(1)}</span>
                <span>•</span>
                <span>{order.technicianId.ratingCount} reviews</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {!isHistory ? (
          <>
            {/* Show Track Service for multiple statuses */}
            {[
              "pending",
              "confirmed",
              "accepted",
              "in_progress",
              "on_the_way",
            ].includes(order.status) &&
              onTrack && (
                <button
                  onClick={onTrack}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Track Service
                </button>
              )}

            {/* Show Reschedule and Cancel only for pending and confirmed status */}
            {["pending", "confirmed", "accepted"].includes(order.status) && (
              <>
                {onReschedule && (
                  <button
                    onClick={() => onReschedule(order)}
                    className="border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>
                )}
                {onCancel && (
                  <button
                    onClick={() => onCancel(order._id)}
                    className="text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          order.status === "completed" && (
            <div className="flex justify-between items-center w-full mt-6 pt-6 border-t">
              {onDownloadInvoice && (
                <button
                  onClick={onDownloadInvoice}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Download Invoice
                </button>
              )}
              <div className="flex gap-3">
                {!order.technicianRating && onLeaveReview && (
                  <button
                    onClick={onLeaveReview}
                    className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Leave Review
                  </button>
                )}
                {onBookAgain && (
                  <button
                    onClick={onBookAgain}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Book Again
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyOrders;
