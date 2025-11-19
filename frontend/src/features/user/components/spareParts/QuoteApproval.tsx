import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CheckCircleOutlineOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { SparePartsService } from "../../../../services/technician/sparePartsService";
import { orderService } from "../../../../services/user/orderService";

interface SparePart {
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

interface SparePartsRequest {
  _id: string;
  orderId: string;
  technicianId: {
    _id: string;
    displayName: string;
    phone: string;
  };
  items: SparePart[];
  totalAmount: number;
  status: string;
  technicianNotes?: string;
  requestedAt: string;
}

interface OrderDetails {
  serviceName: string;
  scheduledDate?: string;
  scheduledTime?: string;
}

const QuoteApproval: React.FC = () => {
  const { orderId, requestId } = useParams<{
    orderId: string;
    requestId: string;
  }>();
  const navigate = useNavigate();

  const [sparePartsRequest, setSparePartsRequest] =
    useState<SparePartsRequest | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId || !requestId) {
        toast.error("Invalid request");
        navigate("/orders");
        return;
      }

      try {
        setLoading(true);

        // Load spare parts request
        const requests = await SparePartsService.getSparePartsRequestsByOrder(
          orderId
        );
        const request = requests.find(
          (req: { _id: string }) => req._id === requestId
        );

        if (!request) {
          toast.error("Spare parts request not found");
          navigate("/orders");
          return;
        }

        setSparePartsRequest(request);

        // Load order details - FIXED: Handle ApiResponse structure
        const orderResponse = await orderService.getOrderById(orderId);

        if (orderResponse.success && orderResponse.data) {
          const order = orderResponse.data;
          setOrderDetails({
            serviceName: order.serviceName,
            scheduledDate: order.scheduledAt,
            scheduledTime: order.timeSlot,
          });
        } else {
          toast.error("Failed to load order details");
          console.error("Order response error:", orderResponse);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load quote details");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, requestId, navigate]);

  const handleAccept = async () => {
    if (!requestId || !orderId) return;

    try {
      // Navigate directly to wallet payment page
      navigate(`/orders/${orderId}/spare-parts/${requestId}/payment`);
    } catch (error) {
      console.error("Failed to proceed to payment:", error);
      toast.error("Failed to proceed to payment");
    }
  };

  const handleReject = async () => {
    if (!requestId) return;

    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      await SparePartsService.updateSparePartsRequestStatus(
        requestId,
        "rejected",
        reason
      );

      toast.success("Spare parts request rejected!");
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading quote details...</p>
      </div>
    );
  }

  if (!sparePartsRequest || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-600 text-lg mb-4">
          Failed to load quote details
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const totalCost = sparePartsRequest.items.reduce(
    (sum, part) => sum + part.totalPrice,
    0
  );

  // Format date for display
  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 mb-6 hover:text-gray-900"
        >
          <ArrowLeftOutlined className="mr-2" />
          Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote Approval</h1>
            <p className="text-sm text-gray-500 mt-1">Booking ID: {orderId}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              sparePartsRequest.status === "pending"
                ? "bg-yellow-50 text-yellow-600"
                : sparePartsRequest.status === "approved"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {sparePartsRequest.status === "pending"
              ? "Awaiting Approval"
              : sparePartsRequest.status === "approved"
              ? "Approved"
              : "Rejected"}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Summary
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Service Type</p>
              <p className="text-sm font-medium text-gray-900">
                {orderDetails.serviceName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Technician</p>
              <p className="text-sm font-medium text-gray-900">
                {sparePartsRequest.technicianId.displayName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Scheduled Date</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDisplayDate(orderDetails.scheduledDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Scheduled Time</p>
              <p className="text-sm font-medium text-gray-900">
                {orderDetails.scheduledTime || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Requested Spare Parts
          </h2>
          {sparePartsRequest.technicianNotes && (
            <p className="text-sm text-gray-600 mb-4">
              <strong>Technician Notes:</strong>{" "}
              {sparePartsRequest.technicianNotes}
            </p>
          )}
          <p className="text-sm text-gray-600 mb-6">
            Your technician has requested the following spare parts to complete
            your service:
          </p>

          <div className="space-y-4">
            {sparePartsRequest.items.map((part, index) => (
              <div
                key={index}
                className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{part.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {part.quantity} × ₹{part.price}
                  </p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{part.totalPrice}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">
              Total Extra Cost
            </span>
            <span className="text-xl font-bold text-gray-900">
              ₹{totalCost}
            </span>
          </div>
        </div>

        {sparePartsRequest.status === "pending" && (
          <>
            <button
              onClick={handleAccept}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center mb-3"
            >
              <CheckCircleOutlineOutlined className="mr-2" />
              Accept & Pay Now
            </button>

            <button
              onClick={handleReject}
              className="w-full text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center"
            >
              <CloseOutlined className="mr-2" />
              Reject Items
            </button>

            <p className="text-xs text-gray-500 text-center mt-4 px-4">
              Note: If you reject these items, the service will continue without
              them, which may affect the quality or completeness of the repair.
            </p>
          </>
        )}

        {sparePartsRequest.status !== "pending" && (
          <div className="text-center py-6">
            <p className="text-gray-600">
              This request has been {sparePartsRequest.status}.
            </p>
            <button
              onClick={() => navigate(`/orders`)}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteApproval;
