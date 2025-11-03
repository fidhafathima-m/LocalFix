import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CreditCardOutlined,
  AccountBalanceWalletOutlined,
  LocalShippingOutlined,
  CheckCircleOutlineOutlined,
  StarBorderOutlined,
  PersonOutlined,
  ChevronRightOutlined,
} from "@mui/icons-material";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { useAppSelector } from "../../../hooks/redux";
import { selectUser } from "../../../store/slices/authSlice";
import toast from "react-hot-toast";
import { bookingService } from "../../../services/user/bookingService";

interface BookingData {
  technician: {
    _id: string;
    displayName: string;
    profilePictureUrl?: string;
    averageRating: number;
    ratingCount: number;
    services: string[];
  };
  service: string;
  date: string;
  time: string;
  address: {
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    isDefault: boolean;
  } | null;
  usesSavedAddress: boolean;
  problemDescription?: string;
}

interface ServicePricing {
  subtotal: number;
  serviceTax: number;
  total: number;
}

const Checkout: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [pricing, setPricing] = useState<ServicePricing>({
    subtotal: 0,
    serviceTax: 0,
    total: 0,
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);

  // Fetch booking data from location state
  useEffect(() => {
    if (location.state) {
      setBookingData(location.state);
      calculatePricing(location.state.service);
    } else {
      // If no state, redirect back to booking
      toast.error("Booking data not found");
      navigate("/booking");
    }
  }, [location.state, navigate]);

  // Calculate pricing based on service type
  const calculatePricing = (serviceType: string) => {
    const basePrices: { [key: string]: number } = {
      "AC Repair": 500,
      "AC Service": 600,
      "Refrigerator Repair": 450,
      "Washing Machine Repair": 550,
      "TV Repair": 400,
      Refrigerator: 450,
      "AC Installation": 800,
      Default: 500,
    };

    const subtotal = basePrices[serviceType] || basePrices["Default"];
    const serviceTax = Math.round(subtotal * 0.1); // 10% tax
    const total = subtotal + serviceTax;

    setPricing({ subtotal, serviceTax, total });
  };

  // In Checkout component - update the handlePayment function
  // In Checkout.tsx - Update the handlePayment function
  const handlePayment = async () => {
    if (!bookingData) {
      toast.error("Booking data not found");
      return;
    }

    try {
      setProcessingPayment(true);

      // Create booking data for API - include problem description as notes
      const bookingRequest = {
        technicianId: bookingData.technician._id,
        serviceName: bookingData.service,
        brand: "General",
        addressId: bookingData.address?.id || "",
        scheduledAt: new Date(bookingData.date).toISOString(),
        timeSlot: bookingData.time,
        amount: pricing.subtotal,
        notes: bookingData.problemDescription || "", // Include problem description here
      };

      console.log("Creating booking with data:", bookingRequest);

      // Create booking record first
      const bookingResponse = await bookingService.createBooking(
        bookingRequest
      );

      if (bookingResponse.success && bookingResponse.data) {
        const createdBooking = bookingResponse.data;

        // Simulate payment processing with 90% success rate
        const success = Math.random() > 0.1;

        if (success) {
          // Update booking status to 'accepted' after successful payment
          try {
            await bookingService.updateBookingStatus(
              createdBooking._id,
              "accepted",
              "user",
              "Payment completed successfully"
            );
          } catch (statusError) {
            console.error("Error updating booking status:", statusError);
            // Continue even if status update fails
          }

          toast.success("Payment successful! Booking confirmed.");
          navigate("/payment-success", {
            state: {
              booking: createdBooking,
              technician: bookingData.technician,
              service: bookingData.service,
              date: bookingData.date,
              time: bookingData.time,
              amount: pricing.total,
            },
          });
        } else {
          // Update booking status to 'cancelled' if payment fails
          try {
            await bookingService.updateBookingStatus(
              createdBooking._id,
              "cancelled",
              "system",
              "Payment failed"
            );
          } catch (statusError) {
            console.error("Error updating booking status:", statusError);
          }

          toast.error("Payment failed. Please try again.");
          navigate("/payment-failed", {
            state: { bookingId: createdBooking._id },
          });
        }
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed");
    } finally {
      setProcessingPayment(false);
    }
  };
  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display (remove seconds if present)
  const formatDisplayTime = (timeString: string) => {
    return timeString
      .split(" - ")
      .map((time) => {
        return time.replace(/(:\d{2})(?::\d{2})? (AM|PM)/, "$1 $2");
      })
      .join(" - ");
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => navigate("/services")}
              className="text-gray-600 hover:text-blue-600 cursor-pointer"
            >
              Services
            </button>
            <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-blue-600 cursor-pointer"
            >
              {bookingData.service} Details
            </button>
            <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-blue-600 cursor-pointer"
            >
              {bookingData.technician.displayName}
            </button>
            <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-blue-600 cursor-pointer"
            >
              Booking
            </button>
            <ChevronRightOutlined className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                {bookingData.technician.profilePictureUrl ? (
                  <img
                    src={bookingData.technician.profilePictureUrl}
                    alt={bookingData.technician.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <PersonOutlined className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {bookingData.technician.displayName}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircleOutlineOutlined className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {bookingData.technician.averageRating.toFixed(1)}
                  </span>
                  <span>({bookingData.technician.ratingCount} reviews)</span>
                  <span>•</span>
                  <span>{bookingData.service}</span>
                </div>
              </div>
            </div>
            <div className="text-xl font-semibold">₹{pricing.subtotal}</div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-600">Name: </span>
              <span className="font-medium">
                {user?.fullName || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phone: </span>
              <span className="font-medium">
                {user?.phone || "Not provided"}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-sm text-gray-600">Email: </span>
            <span className="font-medium">{user?.email || "Not provided"}</span>
          </div>

          {/* Service Details */}
          <h3 className="font-semibold mb-4 mt-6">Service Details</h3>
          <div className="mb-4">
            <span className="text-sm text-gray-600">Service Type: </span>
            <span className="font-medium">{bookingData.service}</span>
          </div>
          {bookingData.problemDescription && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-4">Problem Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {bookingData.problemDescription}
                </p>
              </div>
            </div>
          )}

          {/* Schedule */}
          <h3 className="font-semibold mb-4 mt-6">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-600">Date: </span>
              <span className="font-medium">
                {formatDisplayDate(bookingData.date)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Time: </span>
              <span className="font-medium">
                {formatDisplayTime(bookingData.time)}
              </span>
            </div>
          </div>

          {/* Address */}
          <h3 className="font-semibold mb-2 mt-6">Address</h3>
          {bookingData.address ? (
            <div className="text-gray-700">
              <p className="font-medium">{bookingData.address.label}</p>
              <p>{bookingData.address.street}</p>
              <p>
                {bookingData.address.city}, {bookingData.address.state} -{" "}
                {bookingData.address.pincode}
              </p>
              {bookingData.address.landmark && (
                <p className="text-sm text-gray-600">
                  Landmark: {bookingData.address.landmark}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-700">No address selected</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedPayment("card")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                selectedPayment === "card"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCardOutlined className="w-5 h-5 text-gray-700" />
                <div className="text-left">
                  <div className="font-medium">Credit/Debit Card</div>
                  <div className="text-sm text-gray-600">
                    Pay securely with Razorpay
                  </div>
                </div>
              </div>
              {selectedPayment === "card" && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircleOutlineOutlined className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
            <button
              onClick={() => setSelectedPayment("wallet")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                selectedPayment === "wallet"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <AccountBalanceWalletOutlined className="w-5 h-5 text-gray-700" />
                <div className="text-left">
                  <div className="font-medium">Wallet</div>
                  <div className="text-sm text-gray-600">
                    Pay using your wallet balance
                  </div>
                </div>
              </div>
              {selectedPayment === "wallet" && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircleOutlineOutlined className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
            <button
              onClick={() => setSelectedPayment("cod")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                selectedPayment === "cod"
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <LocalShippingOutlined className="w-5 h-5 text-gray-700" />
                <div className="text-left">
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-600">
                    Pay when service is complete
                  </div>
                </div>
              </div>
              {selectedPayment === "cod" && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircleOutlineOutlined className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{pricing.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Service Tax (10%)</span>
              <span>₹{pricing.serviceTax}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{pricing.total}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={processingPayment}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {processingPayment
            ? "Processing Payment..."
            : `Pay ₹${pricing.total}`}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
