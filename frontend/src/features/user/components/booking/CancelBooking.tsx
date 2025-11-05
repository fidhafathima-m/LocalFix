import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowBackIosNewOutlined,
  CalendarTodayOutlined,
  QueryBuilderOutlined,
  FmdGoodOutlined,
  InfoOutlined,
  StarBorderOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import { orderService } from "../../../../services/user/orderService";
import { type OrderResponse } from "../../../../services/user/orderService";
import toast from "react-hot-toast";

const CancelBooking: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [selectedReason, setSelectedReason] = useState("not-available");
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(orderId!);

      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        toast.error("Failed to fetch order details");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!orderId || !selectedReason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    try {
      setCancelling(true);

      const reasonMap: { [key: string]: string } = {
        "not-available": "Technician not available at preferred time",
        "better-price": "Found a better price elsewhere",
        resolved: "Issue resolved / no longer needed",
        "wrong-booking": "Wrong booking made",
        other: "Other personal reasons",
      };

      const reasonText = reasonMap[selectedReason] || selectedReason;

      const response = await orderService.cancelOrder(orderId, reasonText);

      if (response.success) {
        toast.success("Order cancelled successfully");
        navigate("/cancel-booking-success", {
          state: {
            orderCode: order?.orderCode,
            refundAmount:
              order?.payment.method === "online" ? order?.totalAmount : 0,
            orderId: order?._id,
          },
        });
      } else {
        toast.error(response.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <InfoOutlined className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              The order you're trying to cancel doesn't exist.
            </p>
            <button
              onClick={() => navigate("/my-orders")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to My Orders
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowBackIosNewOutlined className="w-5 h-5" />
          <span className="text-xl font-bold">Cancel Booking</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6">Booking Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{order.serviceName}</h3>
              <p className="text-gray-600 mb-4">
                {order.problemDescription || "Standard service"}
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <CalendarTodayOutlined className="w-5 h-5" />
                  <span>{formatDate(order.scheduledAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <QueryBuilderOutlined className="w-5 h-5" />
                  <span>{formatTimeSlot(order.timeSlot)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FmdGoodOutlined className="w-5 h-5" />
                  <span>
                    {order.address.street}, {order.address.city}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 mb-1">
                  Price: ₹{order.totalAmount}
                </div>
                <div className="text-sm text-gray-600">
                  {order.payment.method === "online"
                    ? "Online Payment"
                    : "Cash on Delivery"}
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
                    <span>({order.technicianId.ratingCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Why are you cancelling this booking?
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="not-available"
                checked={selectedReason === "not-available"}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">
                Technician not available at preferred time
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="better-price"
                checked={selectedReason === "better-price"}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">
                Found a better price elsewhere
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="resolved"
                checked={selectedReason === "resolved"}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">
                Issue resolved / no longer needed
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="wrong-booking"
                checked={selectedReason === "wrong-booking"}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">Wrong booking made</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value="other"
                checked={selectedReason === "other"}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">Other</span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <InfoOutlined className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Cancellation Policy
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                If you cancel more than 2 hours before the appointment, you will
                receive a full refund. For late cancellations, a ₹100
                cancellation fee applies.
              </p>
              <p className="text-sm text-blue-800">
                Refunds will be credited to your wallet or original payment
                method within 3-5 days.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            disabled={cancelling}
          >
            Go Back
          </button>
          <button
            onClick={handleConfirmCancellation}
            disabled={cancelling}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {cancelling ? "Cancelling..." : "Confirm Cancellation"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancelBooking;
