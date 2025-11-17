import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  AccountBalanceWalletOutlined,
  CheckCircleOutlineOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { SparePartsService } from "../../../../services/technician/sparePartsService";
import { orderService } from "../../../../services/user/orderService";
import { paymentService } from "../../../../services/user/paymentService";
import { walletService } from "../../../../services/user/walletService";

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
  orderCode: string;
}

const PartsPayment: React.FC = () => {
  const { orderId, requestId } = useParams<{
    orderId: string;
    requestId: string;
  }>();
  const navigate = useNavigate();

  const [sparePartsRequest, setSparePartsRequest] =
    useState<SparePartsRequest | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [checkingWallet, setCheckingWallet] = useState(false);

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

        // Load order details
        const orderResponse = await orderService.getOrderById(orderId);

        if (orderResponse.success && orderResponse.data) {
          const order = orderResponse.data;
          setOrderDetails({
            serviceName: order.serviceName,
            orderCode: order.orderCode,
          });
        } else {
          toast.error("Failed to load order details");
        }

        // Check wallet balance
        await checkWalletBalance();
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load payment details");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId, requestId, navigate]);

  const checkWalletBalance = async () => {
    try {
      setCheckingWallet(true);
      const response = await walletService.getWalletBalance();
      if (response.success && response.data) {
        setWalletBalance(response.data.balance);
      } else {
        toast.error(response.message || "Failed to check wallet balance");
      }
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      toast.error("Failed to check wallet balance");
    } finally {
      setCheckingWallet(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!sparePartsRequest || !orderId || !requestId) {
      toast.error("Payment details not available");
      return;
    }

    try {
      setProcessingPayment(true);

      // Process wallet payment for spare parts
      const paymentResponse =
        await paymentService.processSparePartsWalletPayment({
          orderId,
          requestId,
          amount: sparePartsRequest.totalAmount,
        });

      if (paymentResponse.success && paymentResponse.data) {
        // Update spare parts request status to approved
        await SparePartsService.updateSparePartsRequestStatus(
          requestId,
          "approved",
          "Wallet payment completed successfully"
        );

        toast.success("Payment successful! Spare parts approved.");

        // Navigate to success page
        navigate(`/orders`);
      } else {
        throw new Error(paymentResponse.message || "Wallet payment failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Wallet payment error:", error);
      toast.error(error.message || "Wallet payment failed");
      setProcessingPayment(false);
    }
  };

  const handleAddToWallet = () => {
    // Navigate to wallet page to add money
    navigate("/my-profile", {
      state: {
        returnUrl: `/orders/${orderId}/spare-parts/${requestId}/payment`,
        requiredAmount: sparePartsRequest?.totalAmount,
        message: `Add ₹${sparePartsRequest?.totalAmount} to your wallet to pay for spare parts`,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading payment details...</p>
      </div>
    );
  }

  if (!sparePartsRequest || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-red-600 text-lg mb-4">
          Failed to load payment details
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

  const totalAmount = sparePartsRequest.totalAmount;
  const hasSufficientBalance = walletBalance >= totalAmount;

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
            <h1 className="text-2xl font-bold text-gray-900">
              Spare Parts Payment
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Order: {orderDetails.orderCode}
            </p>
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Secure Payment
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Service Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Service Type</p>
              <p className="text-sm font-medium text-gray-900">
                {orderDetails.serviceName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Technician</p>
              <p className="text-sm font-medium text-gray-900">
                {sparePartsRequest.technicianId.displayName}
              </p>
            </div>
          </div>
        </div>

        {/* Spare Parts Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Spare Parts Summary
          </h2>
          {sparePartsRequest.technicianNotes && (
            <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded">
              <strong>Technician Notes:</strong>{" "}
              {sparePartsRequest.technicianNotes}
            </p>
          )}

          <div className="space-y-3">
            {sparePartsRequest.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {item.name}
                  </span>
                  <p className="text-xs text-gray-500">
                    Quantity: {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ₹{item.totalPrice}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">
                ₹{totalAmount}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">GST (18%)</span>
              <span className="text-sm font-medium text-gray-900">
                ₹{(totalAmount * 0.18).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">
                Total Amount
              </span>
              <span className="text-xl font-bold text-gray-900">
                ₹{(totalAmount * 1.18).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method - Only Wallet */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Method
          </h2>
          <div className="space-y-3">
            <button
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${"border-blue-600 bg-blue-50"}`}
            >
              <div className="flex items-center gap-3">
                <AccountBalanceWalletOutlined className="w-5 h-5 text-gray-700" />
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    Wallet Payment
                    {checkingWallet && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                  <div className="text-sm">
                    {checkingWallet ? (
                      "Checking balance..."
                    ) : hasSufficientBalance ? (
                      <span className="text-gray-600">
                        Balance: ₹{walletBalance} • Pay using wallet
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Insufficient balance (₹{walletBalance})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircleOutlineOutlined className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>

          {/* Insufficient Balance Message */}
          {!hasSufficientBalance && !checkingWallet && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm mb-3">
                Your wallet balance (₹{walletBalance}) is insufficient for this
                payment (₹{(totalAmount * 1.18).toFixed(2)}). Please add money
                to your wallet to proceed.
              </p>
              <button
                onClick={handleAddToWallet}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Add ₹{(totalAmount * 1.18 - walletBalance).toFixed(2)} to Wallet
              </button>
            </div>
          )}

          {/* Sufficient Balance Message */}
          {hasSufficientBalance && !checkingWallet && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm">
                Your wallet has sufficient balance. You can pay using your
                wallet balance.
              </p>
            </div>
          )}
        </div>

        {/* Pay Button */}
        <button
          onClick={handleWalletPayment}
          disabled={
            processingPayment || !hasSufficientBalance || checkingWallet
          }
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {processingPayment ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            `Pay ₹${(totalAmount * 1.18).toFixed(2)} from Wallet`
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your payment is secured with wallet. The amount will be deducted from
          your wallet balance.
        </p>
      </div>
    </div>
  );
};

export default PartsPayment;
