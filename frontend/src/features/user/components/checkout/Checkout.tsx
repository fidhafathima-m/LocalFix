/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import { useAppSelector } from "../../../../hooks/redux";
import { selectUser } from "../../../../store/slices/authSlice";
import toast from "react-hot-toast";
import { bookingService } from "../../../../services/user/bookingService";
import { orderService } from "../../../../services/user/orderService";
import { paymentService } from "../../../../services/user/paymentService";
import { walletService } from "../../../../services/user/walletService";
import { serviceService } from "../../../../services/user/serviceService";

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  serviceId?: string;
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
  userPhoneNumber?: string;
  userFullName?: string;
  userEmail?: string;
}

interface ServicePricing {
  subtotal: number;
  serviceTax: number;
  total: number;
}

const Checkout: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [walletBalance, setWalletBalance] = useState(0);
  const [checkingWallet, setCheckingWallet] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loadingService, setLoadingService] = useState(false);
  const [pricing, setPricing] = useState<ServicePricing>({
    subtotal: 0,
    serviceTax: 0,
    total: 0,
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    // Prevent access to checkout if coming from payment success
    const navigationEntries = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navType = navigationEntries[0].type;

      // If user is coming via back/forward navigation, redirect
      if (navType === "back_forward" && !location.state) {
        navigate("/services", { replace: true });
        return;
      }
    }

    // Replace history entry to prevent back navigation to checkout
    window.history.replaceState({ canGoBack: true }, "", window.location.href);

    // Handle browser back button
    const handlePopState = (event: PopStateEvent) => {
      // If state indicates we can go back, redirect to services
      if (event.state?.canGoBack) {
        navigate("/services", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location.state]);

  useEffect(() => {
    if (user?._id) {
      checkWalletBalance();
    }
  }, [user?._id]);

  useEffect(() => {
    if (selectedPayment === "wallet") {
      checkWalletBalance();
    }
  }, [selectedPayment]);

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
    const bookingId = await createBookingRecord();
    try {
      setProcessingPayment(true);

      // Process wallet payment
      const paymentResponse = await paymentService.processWalletPayment({
        bookingId,
        amount: pricing.total,
      });

      if (paymentResponse.success && paymentResponse.data) {
        // Create order from booking - status should be 'pending' initially
        const orderResponse = await orderService.createOrderFromBooking({
          bookingId,
          paymentData: {
            method: "wallet",
            amount: pricing.total,
            status: "paid",
            transactionId: `wallet_${Date.now()}`,
            paidAt: new Date(),
          },
        });

        if (orderResponse.success) {
          // Update booking status to 'pending' (not 'accepted')
          await bookingService.updateBookingStatus(
            bookingId,
            "pending", // CHANGED: from 'accepted' to 'pending'
            "system",
            "Payment completed successfully, waiting for technician acceptance"
          );

          toast.success(
            "Payment successful! Technician will confirm your booking soon."
          );
          navigate("/payment-success", {
            replace: true,
            state: {
              bookingId,
              technician: bookingData!.technician,
              service: bookingData!.service,
              date: bookingData!.date,
              time: bookingData!.time,
              amount: pricing.total,
              paymentMethod: "wallet",
              newBalance: paymentResponse.data.newBalance,
              status: "pending", // Let user know it's pending technician acceptance
            },
          });
        } else {
          // If order creation fails, refund the wallet payment
          await paymentService.refundToWallet(
            bookingId,
            pricing.total,
            "Order creation failed"
          );
          throw new Error("Failed to create order");
        }
      } else {
        throw new Error(paymentResponse.message || "Wallet payment failed");
      }
    } catch (error: any) {
      console.error("Wallet payment error:", error);
      // Update booking status to cancelled
      if (bookingId) {
        await bookingService.updateBookingStatus(
          bookingId,
          "cancelled",
          "system",
          `Wallet payment failed: ${error.message}`
        );
      }
      toast.error(error.message || "Wallet payment failed");
      setProcessingPayment(false);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Fetch booking data from location state
  useEffect(() => {
    const fetchBookingDataAndService = async () => {
      if (location.state) {
        const stateData = location.state as BookingData;
        setBookingData(stateData);

        // Fetch service details to get real base price
        await fetchServicePricing(stateData.service);
      } else {
        toast.error("Booking data not found");
        navigate("/booking");
      }
    };

    fetchBookingDataAndService();
  }, [location.state, navigate]);

  // Fetch service pricing from database
  // In your Checkout component
  const fetchServicePricing = async (serviceName: string) => {
    try {
      setLoadingService(true);

      // Search for the service by name
      const servicesResponse = await serviceService.searchServices(
        serviceName,
        5
      );

      if (servicesResponse.success && servicesResponse.data) {
        const services =
          servicesResponse.data.services || servicesResponse.data;

        // Find the exact service match
        const service = services.find(
          (s: any) => s.name.toLowerCase() === serviceName.toLowerCase()
        );

        if (service) {
          calculatePricing(service.avgBasePrice);
          console.log("✅ Fetched real service price:", {
            serviceName,
            basePrice: service.avgBasePrice,
            serviceId: service._id,
          });
        } else {
          // Fallback to default pricing if service not found
          console.warn("Service not found, using default pricing");
          calculatePricingFromName(serviceName);
        }
      } else {
        // Fallback if API fails
        calculatePricingFromName(serviceName);
      }
    } catch (error) {
      console.error("Error fetching service pricing:", error);
      // Fallback to default pricing
      calculatePricingFromName(serviceName);
      toast.error("Failed to load service pricing, using default rates");
    } finally {
      setLoadingService(false);
    }
  };

  // Calculate pricing based on service type
  // In Checkout component - update calculatePricing function
  const calculatePricingFromName = (serviceType: string) => {
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
    const serviceTax = Math.round(subtotal * 0.1);
    const total = subtotal + serviceTax;

    setPricing({ subtotal, serviceTax, total });
  };

  // Calculate pricing with real base price
  const calculatePricing = (basePrice: number) => {
    const subtotal = basePrice;
    const serviceTax = Math.round(subtotal * 0.1);
    const total = subtotal + serviceTax;

    setPricing({ subtotal, serviceTax, total });

    console.log("💰 Pricing calculated:", {
      basePrice,
      subtotal,
      serviceTax,
      total,
    });
  };

  // Validate booking data before proceeding
  const validateBookingData = (): boolean => {
    if (!bookingData) {
      toast.error("Booking data not found");
      return false;
    }

    if (!bookingData.technician?._id) {
      toast.error("Technician information is missing");
      return false;
    }

    if (!bookingData.service) {
      toast.error("Service information is missing");
      return false;
    }

    if (!bookingData.date) {
      toast.error("Date is missing");
      return false;
    }

    if (!bookingData.time) {
      toast.error("Time slot is missing");
      return false;
    }

    if (!bookingData.address?.id) {
      toast.error("Please select an address");
      return false;
    }

    if (!user?._id) {
      toast.error("User authentication required");
      return false;
    }

    return true;
  };

  // Create booking record
  const createBookingRecord = async (): Promise<string> => {
    if (!validateBookingData()) {
      throw new Error("Invalid booking data");
    }

    // Add null checks with type assertions since we validated above
    const bookingRequest = {
      technicianId: bookingData!.technician._id,
      serviceName: bookingData!.service,
      brand: "General",
      addressId: bookingData!.address!.id,
      scheduledAt: new Date(bookingData!.date).toISOString(),
      timeSlot: bookingData!.time,
      amount: pricing.subtotal,
      notes: bookingData!.problemDescription || "",
    };

    const bookingResponse = await bookingService.createBooking(bookingRequest);

    if (!bookingResponse.success || !bookingResponse.data) {
      throw new Error(bookingResponse.message || "Failed to create booking");
    }

    return bookingResponse.data._id;
  };

  // Initialize Razorpay payment
  const initializeRazorpayPayment = async (bookingId: string) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    try {
      // Create payment order
      const paymentOrderResponse = await paymentService.createPaymentOrder({
        bookingId,
        userId: user!._id,
        amount: pricing.total,
        currency: "INR",
        type: "service",
      });

      if (!paymentOrderResponse.success || !paymentOrderResponse.data) {
        throw new Error("Failed to create payment order");
      }

      const { razorpayOrder } = paymentOrderResponse.data;

      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount.toString(),
        currency: razorpayOrder.currency,
        name: "Localfix",
        description: `Payment for ${bookingData!.service}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verificationResponse = await paymentService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            if (verificationResponse.success) {
              // Create order from booking
              const orderResponse = await orderService.createOrderFromBooking({
                bookingId,
                paymentData: {
                  method: selectedPayment === "cod" ? "cod" : "online",
                  amount: pricing.total,
                  status: "paid",
                  transactionId: response.razorpay_payment_id,
                  paidAt: new Date(),
                },
              });

              if (orderResponse.success) {
                // Update booking status to 'accepted'
                await bookingService.updateBookingStatus(
                  bookingId,
                  "pending",
                  "user",
                  "Payment completed successfully"
                );

                toast.success(
                  "Payment successful! Technician will confirm your booking soon."
                );
                navigate("/payment-success", {
                  replace: true,
                  state: {
                    bookingId,
                    technician: bookingData!.technician,
                    service: bookingData!.service,
                    date: bookingData!.date,
                    time: bookingData!.time,
                    amount: pricing.total,
                    paymentId: response.razorpay_payment_id,
                    orderId: orderResponse.data?._id,
                    paymentMethod: "online",
                    problemDescription: bookingData!.problemDescription,
                    address: bookingData!.address,
                    status: "pending",
                  },
                });
              } else {
                // Update booking status to 'cancelled' if payment verification fails
                await bookingService.updateBookingStatus(
                  bookingId,
                  "cancelled",
                  "system",
                  "Payment verification failed"
                );
                toast.error("Payment verification failed. Please try again.");
                navigate("/payment-failed", {
                  replace: true,
                  state: {
                    bookingId,
                    error: "Payment verification failed",
                    errorCode: "PAYMENT_VERIFICATION_ERROR",
                  },
                });
              }
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            navigate("/payment-failed", {
              replace: true,
              state: {
                bookingId,
                error: "Payment verification error",
                errorCode: "VERIFICATION_ERROR",
              },
            });
          }
        },
        prefill: {
          name: user!.fullName || "",
          email: user!.email || "",
          contact: user!.phone || "",
        },
        notes: {
          bookingId: bookingId,
          service: bookingData!.service,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: () => {
            // This is called when user manually closes the modal
            setProcessingPayment(false);
            toast.error("Payment cancelled");
            // Don't navigate to failed page for manual cancellation
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // In Checkout component - update the payment failure handler
      razorpayInstance.on("payment.failed", async function (response: any) {
        console.error("Payment failed:", response.error);

        try {
          // Create order for failed payment first
          const orderResponse = await orderService.createOrderFromBooking({
            bookingId,
            paymentData: {
              method: "online",
              amount: pricing.total,
              status: "failed",
              transactionId: response.error.payment_id,
              paidAt: new Date(),
            },
          });

          // Then update booking status
          await bookingService.updateBookingStatus(
            bookingId,
            "cancelled",
            "system",
            `Payment failed: ${response.error.description}`
          );

          setProcessingPayment(false);

          const errorMessage =
            response.error.description ||
            "Payment failed due to technical issues";

          navigate("/payment-failed", {
            state: {
              bookingData,
              pricing,
              error: errorMessage,
              bookingId,
              orderId: orderResponse.data?._id, // Include order ID for retry
              razorpayError: response.error,
            },
            replace: true,
          });
        } catch (error) {
          console.error("Error handling failed payment:", error);
          setProcessingPayment(false);
          navigate("/payment-failed", {
            state: {
              bookingData,
              pricing,
              error: "Payment processing failed",
              bookingId,
            },
            replace: true,
          });
        }
      });

      razorpayInstance.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment");
      setProcessingPayment(false);
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    try {
      setProcessingPayment(true);
      const bookingId = await createBookingRecord();
      await initializeRazorpayPayment(bookingId);
    } catch (error: any) {
      console.error("Razorpay payment error:", error);
      toast.error(error.message || "Payment processing failed");
      setProcessingPayment(false);
    }
  };

  // Handle Cash on Delivery
  const handleCashOnDelivery = async () => {
    try {
      setProcessingPayment(true);
      const bookingId = await createBookingRecord();

      // For COD, mark as pending and proceed
      await bookingService.updateBookingStatus(
        bookingId,
        "pending",
        "user",
        "Cash on Delivery selected"
      );

      toast.success("Booking confirmed! Pay when service is complete.");
      navigate("/payment-success", {
        replace: true,
        state: {
          bookingId,
          technician: bookingData!.technician,
          service: bookingData!.service,
          date: bookingData!.date,
          time: bookingData!.time,
          amount: pricing.total,
          paymentMethod: "cod",
          status: "pending",
        },
      });
    } catch (error: any) {
      console.error("COD booking error:", error);
      toast.error(error.message || "Failed to create booking");
      setProcessingPayment(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!bookingData) {
      toast.error("Booking data not found");
      return;
    }

    switch (selectedPayment) {
      case "card":
        await handleRazorpayPayment();
        break;
      case "wallet":
        await handleWalletPayment();
        break;
      case "cod":
        await handleCashOnDelivery();
        break;
      default:
        toast.error("Selected payment method is not available");
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

  // Format time for display
  const formatDisplayTime = (timeString: string) => {
    return timeString
      .split(" - ")
      .map((time) => {
        return time.replace(/(:\d{2})(?::\d{2})? (AM|PM)/, "$1 $2");
      })
      .join(" - ");
  };

  const hasSufficientBalance = walletBalance >= pricing.total;

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
                {bookingData.userFullName || user?.fullName || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Phone: </span>
              <span className="font-medium">
                {bookingData.userPhoneNumber
                  ? `+91 ${bookingData.userPhoneNumber}`
                  : user?.phone
                  ? `+91 ${user.phone.replace(/\D/g, "").slice(-10)}`
                  : "Not provided"}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-sm text-gray-600">Email: </span>
            <span className="font-medium">
              {bookingData.userEmail || user?.email || "Not provided"}
            </span>
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
              disabled={checkingWallet}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                selectedPayment === "wallet"
                  ? "border-blue-600 bg-blue-50"
                  : hasSufficientBalance
                  ? "border-gray-200 hover:border-gray-300"
                  : "border-gray-200 opacity-50 cursor-not-allowed"
              } ${checkingWallet ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-3">
                <AccountBalanceWalletOutlined className="w-5 h-5 text-gray-700" />
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    Wallet
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
          {selectedPayment === "wallet" &&
            !hasSufficientBalance &&
            !checkingWallet && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  Your wallet balance (₹{walletBalance}) is insufficient for
                  this payment (₹{pricing.total}). Please add money to your
                  wallet or choose another payment method.
                </p>
              </div>
            )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
          {loadingService ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading pricing...</span>
            </div>
          ) : (
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
          )}
        </div>

        <button
          onClick={handlePayment}
          disabled={
            processingPayment ||
            (selectedPayment === "wallet" && !hasSufficientBalance) ||
            checkingWallet
          }
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {processingPayment
            ? "Processing..."
            : selectedPayment === "cod"
            ? `Confirm Booking`
            : selectedPayment === "wallet"
            ? `Pay ₹${pricing.total} from Wallet`
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
