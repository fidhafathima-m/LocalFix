import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircleOutlineOutlined,
  PlaceOutlined,
  DownloadOutlined,
  HomeOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";

interface PaymentSuccessState {
  bookingId: string;
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
  amount: number;
  paymentId?: string;
  paymentMethod?: string;
}

const PaymentSuccess: React.FC = () => {
  const location = useLocation();
  const state = location.state as PaymentSuccessState;

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

  // Format time for display
  const formatDisplayTime = (timeString: string) => {
    return timeString
      .split(" - ")
      .map((time) => time.replace(/(:\d{2})(?::\d{2})? (AM|PM)/, "$1 $2"))
      .join(" - ");
  };

  // Handle invoice download
  const handleDownloadInvoice = () => {
    const invoiceData = {
      bookingId: state.bookingId,
      service: state.service,
      technician: state.technician.displayName,
      date: state.date,
      time: state.time,
      amount: state.amount,
      paymentId: state.paymentId,
      timestamp: new Date().toISOString(),
    };

    console.log("Downloading invoice:", invoiceData);
    alert("Invoice download feature will be implemented soon!");
  };

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CheckCircleOutlineOutlined className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              Booking Information Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't retrieve your booking details. Please check your
              bookings page.
            </p>
            <Link
              to="/bookings"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              View My Bookings
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleOutlineOutlined className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {state.paymentMethod === "cod"
                ? "Booking Confirmed!"
                : "Payment Successful!"}
            </h1>
            <p className="text-gray-600">
              {state.paymentMethod === "cod"
                ? "Your booking has been confirmed. Pay when service is completed."
                : "Your booking has been confirmed and the technician has been notified."}
            </p>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Booking Details</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-semibold font-mono">
                  {state.bookingId}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{state.service}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Technician</span>
                <div className="flex items-center gap-2">
                  {state.technician.profilePictureUrl ? (
                    <img
                      src={state.technician.profilePictureUrl}
                      alt={state.technician.displayName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <PersonOutlined className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="font-semibold">
                    {state.technician.displayName}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Rating</span>
                <span className="font-semibold">
                  {state.technician.averageRating.toFixed(1)} (
                  {state.technician.ratingCount} reviews)
                </span>
              </div>

              <div className="flex justify-between items-start py-2">
                <span className="text-gray-600 flex items-start gap-1">
                  Schedule
                </span>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatDisplayDate(state.date)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDisplayTime(state.time)}
                  </div>
                </div>
              </div>

              {state.paymentId && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-semibold font-mono text-sm">
                    {state.paymentId}
                  </span>
                </div>
              )}

              {state.paymentMethod && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold capitalize">
                    {state.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-t pt-3">
                <span className="text-gray-900 font-semibold">
                  {state.paymentMethod === "cod" ? "Amount Due" : "Total Paid"}
                </span>
                <span className="font-bold text-lg">₹{state.amount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              to={`/bookings/${state.bookingId}`}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <PlaceOutlined className="w-5 h-5" />
              Track Service
            </Link>

            <button
              onClick={handleDownloadInvoice}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <DownloadOutlined className="w-5 h-5" />
              Download Invoice
            </button>

            <Link
              to="/"
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <HomeOutlined className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">
            {state.paymentMethod === "cod"
              ? "You will receive a confirmation call shortly."
              : "A confirmation email has been sent to your registered email address."}
          </p>
          <p>
            Need help?{" "}
            <Link to="/contact" className="text-blue-600 hover:text-blue-700">
              Contact our support team
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
