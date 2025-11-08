/* eslint-disable @typescript-eslint/no-explicit-any */
// PaymentRetry.tsx - Updated with proper booking data fetching
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCardOutlined,
  LocalShippingOutlined,
  CheckCircleOutlineOutlined,
  StarBorderOutlined,
  PersonOutlined,
  HomeOutlined,
  WarningOutlined,
  AddOutlined,
} from "@mui/icons-material";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import { useAppSelector } from "../../../../hooks/redux";
import { selectUser } from "../../../../store/slices/authSlice";
import toast from "react-hot-toast";
import { bookingService } from "../../../../services/user/bookingService";
import { orderService } from "../../../../services/user/orderService";
import { paymentService } from "../../../../services/user/paymentService";
import { userService } from "../../../../services/user/userService";
import { AddAddressModal } from "../userProfile/modals/AddAddressModal";

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Technician {
  _id: string;
  displayName: string;
  profilePictureUrl?: string;
  averageRating: number;
  ratingCount: number;
  services: string[];
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface BookingData {
  technician: Technician;
  service: string;
  date: string;
  time: string;
  address: Address | null;
  usesSavedAddress: boolean;
  problemDescription?: string;
}

interface ServicePricing {
  subtotal: number;
  serviceTax: number;
  total: number;
}

interface PaymentRetryState {
  bookingData?: BookingData;
  pricing?: ServicePricing;
  error?: string;
  bookingId?: string;
  razorpayError?: any;
}

const PaymentRetry: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [pricing, setPricing] = useState<ServicePricing>({
    subtotal: 0,
    serviceTax: 0,
    total: 0,
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [usesSavedAddress, setUsesSavedAddress] = useState(true);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector(selectUser);

  // Replace the fetchCompleteBookingData function with this version
  // Replace the fetchCompleteBookingData function with this version
  const fetchCompleteBookingData = async (bookingId: string) => {
    try {
      setLoading(true);

      // FIRST: Check if we have technician data in the location state from failed orders
      const state = location.state as PaymentRetryState;

      if (state?.bookingData?.technician) {
        console.log(
          "Using technician data from location state (failed orders)"
        );
        // We have complete technician data from the failed orders list
        const bookingResponse = await bookingService.getBookingById(bookingId);

        if (bookingResponse.success && bookingResponse.data) {
          const booking = bookingResponse.data;

          // Use the technician data from location state (which has the full details)
          const technician = state.bookingData.technician;

          // Fetch user address to populate the address
          let address: Address | null = null;
          try {
            const addressesResponse = await userService.getUserAddresses();
            if (
              addressesResponse.success &&
              addressesResponse.data?.addresses
            ) {
              const userAddress = addressesResponse.data.addresses.find(
                (addr) => addr.id === booking.addressId
              );
              if (userAddress) {
                address = userAddress;
                setSelectedAddress(userAddress.id);
              }
            }
          } catch (addressError) {
            console.error("Error fetching address:", addressError);
          }

          const reconstructedBookingData: BookingData = {
            technician,
            service: booking.serviceName,
            date: new Date(booking.scheduledAt).toISOString().split("T")[0],
            time: booking.timeSlot,
            address,
            usesSavedAddress: true,
            problemDescription: booking.notes,
          };

          setBookingData(reconstructedBookingData);

          // Use pricing from state if available, otherwise calculate
          if (state.pricing) {
            setPricing(state.pricing);
          } else {
            const basePrices: { [key: string]: number } = {
              "AC Repair": 500,
              "AC Service": 600,
              "Refrigerator Repair": 450,
              "Washing Machine Repair": 550,
              "TV Repair": 400,
              "Microwave Oven": 550,
              Refrigerator: 450,
              "AC Installation": 800,
              Default: 500,
            };

            const subtotal =
              basePrices[booking.serviceName] || basePrices["Default"];
            const serviceTax = Math.round(subtotal * 0.1);
            const total = subtotal + serviceTax;
            setPricing({ subtotal, serviceTax, total });
          }
        } else {
          throw new Error(
            bookingResponse.message || "Failed to fetch booking data"
          );
        }
      } else {
        // Fallback: If no location state data, use the original approach
        console.log("No location state data, using API-only approach");
        const bookingResponse = await bookingService.getBookingById(bookingId);

        if (bookingResponse.success && bookingResponse.data) {
          const booking = bookingResponse.data;

          // Create basic technician data since API doesn't populate it
          const technician: Technician = {
            _id: booking.technicianId as string,
            displayName: "Our Technician",
            averageRating: 4.5,
            ratingCount: 10,
            services: [booking.serviceName],
          };

          // Fetch user address
          let address: Address | null = null;
          try {
            const addressesResponse = await userService.getUserAddresses();
            if (
              addressesResponse.success &&
              addressesResponse.data?.addresses
            ) {
              const userAddress = addressesResponse.data.addresses.find(
                (addr) => addr.id === booking.addressId
              );
              if (userAddress) {
                address = userAddress;
                setSelectedAddress(userAddress.id);
              }
            }
          } catch (addressError) {
            console.error("Error fetching address:", addressError);
          }

          const reconstructedBookingData: BookingData = {
            technician,
            service: booking.serviceName,
            date: new Date(booking.scheduledAt).toISOString().split("T")[0],
            time: booking.timeSlot,
            address,
            usesSavedAddress: true,
            problemDescription: booking.notes,
          };

          setBookingData(reconstructedBookingData);

          // Calculate pricing
          const basePrices: { [key: string]: number } = {
            "AC Repair": 500,
            "AC Service": 600,
            "Refrigerator Repair": 450,
            "Washing Machine Repair": 550,
            "TV Repair": 400,
            "Microwave Oven": 550,
            Refrigerator: 450,
            "AC Installation": 800,
            Default: 500,
          };

          const subtotal =
            basePrices[booking.serviceName] || basePrices["Default"];
          const serviceTax = Math.round(subtotal * 0.1);
          const total = subtotal + serviceTax;
          setPricing({ subtotal, serviceTax, total });
        } else {
          throw new Error(
            bookingResponse.message || "Failed to fetch booking data"
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching booking data:", error);
      toast.error("Failed to load booking details");
      navigate("/payment-failed");
    } finally {
      setLoading(false);
    }
  };
  // Load state from navigation
  useEffect(() => {
    const state = location.state as PaymentRetryState;

    if (state?.bookingId) {
      // Always fetch fresh data from backend using bookingId
      fetchCompleteBookingData(state.bookingId);
    } else if (state?.bookingData && state?.pricing) {
      // Direct from Checkout (fallback)
      setBookingData(state.bookingData);
      setPricing(state.pricing);
      if (state.bookingData.address) {
        setSelectedAddress(state.bookingData.address.id);
      }
      setUsesSavedAddress(state.bookingData.usesSavedAddress);
      setLoading(false);
    } else {
      toast.error("No booking information found");
      navigate("/payment-failed");
    }
  }, [location.state, navigate]);

  // Load user addresses
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!user?._id) return;

      try {
        const response = await userService.getUserAddresses();
        if (response.success && response.data) {
          setUserAddresses(response.data.addresses || []);

          // If no address is selected but we have addresses, select the default
          if (!selectedAddress && response.data.addresses?.length > 0) {
            const defaultAddress = response.data.addresses.find(
              (addr) => addr.isDefault
            );
            if (defaultAddress) {
              setSelectedAddress(defaultAddress.id);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user addresses:", err);
      }
    };

    fetchUserAddresses();
  }, [user, selectedAddress]);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  // Safe access helper functions
  const getSafeTechnician = () => {
    return (
      bookingData?.technician || {
        _id: "",
        displayName: "Technician",
        averageRating: 0,
        ratingCount: 0,
        services: [],
      }
    );
  };

  const getSafeRating = () => {
    const technician = getSafeTechnician();
    return technician.averageRating || 0;
  };

  const getSafeRatingCount = () => {
    const technician = getSafeTechnician();
    return technician.ratingCount || 0;
  };

  const handleAddAddress = async (addressData: any) => {
    try {
      setSavingAddress(true);
      const response = await userService.createAddress(addressData);

      if (response.success && response.data) {
        const newAddresses = [...userAddresses, response.data.address];
        setUserAddresses(newAddresses);

        if (addressData.isDefault) {
          setSelectedAddress(response.data.address.id);
        }

        setShowAddAddressModal(false);
        setUsesSavedAddress(true);
        toast.success("Address added successfully!");
      } else {
        toast.error(response.message || "Failed to add address");
      }
    } catch (err: any) {
      console.error("Error adding address:", err);
      toast.error(err.response?.data?.message || "Failed to add address");
    } finally {
      setSavingAddress(false);
    }
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

    if (usesSavedAddress && !selectedAddress) {
      toast.error("Please select an address");
      return false;
    }

    if (!user?._id) {
      toast.error("User authentication required");
      return false;
    }

    return true;
  };

  // Get selected address object
  const getSelectedAddress = (): Address | null => {
    if (!usesSavedAddress || !selectedAddress) return null;
    return userAddresses.find((addr) => addr.id === selectedAddress) || null;
  };

  // Create or update booking record
  // In PaymentRetry.tsx - Update createBookingRecord method
  const createBookingRecord = async (): Promise<string> => {
    if (!validateBookingData()) {
      throw new Error("Invalid booking data");
    }

    const address = getSelectedAddress();
    if (!address) {
      throw new Error("Please select a valid address");
    }

    const bookingRequest = {
      technicianId: bookingData!.technician._id,
      serviceName: bookingData!.service,
      brand: "General",
      addressId: address.id,
      scheduledAt: new Date(bookingData!.date).toISOString(),
      timeSlot: bookingData!.time,
      amount: pricing.subtotal,
      notes: bookingData!.problemDescription || "",
    };

    const state = location.state as PaymentRetryState;

    // If we have an existing booking ID from failed payment, try to update it
    if (state?.bookingId) {
      try {
        const updateResponse = await bookingService.updateBooking(
          state.bookingId,
          bookingRequest
        );

        if (!updateResponse.success) {
          // If update fails, create a new booking instead
          console.warn(
            "Failed to update booking, creating new one:",
            updateResponse.message
          );
          return await createNewBooking(bookingRequest);
        }

        return state.bookingId;
      } catch (error) {
        // If update fails due to 404 or other errors, create a new booking
        console.warn("Update booking failed, creating new one:", error);
        return await createNewBooking(bookingRequest);
      }
    } else {
      // Create new booking
      return await createNewBooking(bookingRequest);
    }
  };

  // Helper function to create new booking
  const createNewBooking = async (bookingRequest: any): Promise<string> => {
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
              const existingOrderResponse =
                await orderService.getOrderByBookingId(bookingId);

              let orderResponse;

              if (existingOrderResponse.success && existingOrderResponse.data) {
                // Update existing order
                orderResponse = await orderService.updateOrderPayment(
                  existingOrderResponse.data._id,
                  {
                    method: "online",
                    amount: pricing.total,
                    status: "paid",
                    transactionId: response.razorpay_payment_id,
                    paidAt: new Date(),
                  }
                );
              } else {
                // Create new order
                orderResponse = await orderService.createOrderFromBooking({
                  bookingId,
                  paymentData: {
                    method: "online",
                    amount: pricing.total,
                    status: "paid",
                    transactionId: response.razorpay_payment_id,
                    paidAt: new Date(),
                  },
                });
              }

              if (orderResponse.success) {
                // Update booking status to 'accepted'
                await bookingService.updateBookingStatus(
                  bookingId,
                  "accepted",
                  "user",
                  "Payment completed successfully"
                );

                toast.success("Payment successful! Booking confirmed.");
                navigate("/payment-success", {
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
                    address: getSelectedAddress(),
                  },
                });
              } else {
                await bookingService.updateBookingStatus(
                  bookingId,
                  "cancelled",
                  "system",
                  "Order creation failed after payment"
                );
                toast.error("Order creation failed after payment");
                navigate("/payment-failed", {
                  state: {
                    bookingId,
                    error: "Order creation failed",
                  },
                });
              }
            } else {
              await bookingService.updateBookingStatus(
                bookingId,
                "cancelled",
                "system",
                "Payment verification failed"
              );
              toast.error("Payment verification failed");
              navigate("/payment-failed", {
                state: {
                  bookingId,
                  error: "Payment verification failed",
                },
              });
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            await bookingService.updateBookingStatus(
              bookingId,
              "cancelled",
              "system",
              "Payment verification error"
            );
            toast.error("Payment verification failed");
            navigate("/payment-failed", {
              state: {
                bookingId,
                error: "Payment verification error",
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
            setProcessingPayment(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);

        bookingService
          .updateBookingStatus(
            bookingId,
            "cancelled",
            "system",
            `Payment failed: ${response.error.description}`
          )
          .catch((err) =>
            console.error("Failed to update booking status:", err)
          );

        setProcessingPayment(false);

        const errorMessage =
          response.error.description ||
          "Payment failed due to technical issues";

        // Navigate back to retry page with error details
        navigate("/retry-payment", {
          state: {
            bookingData,
            pricing,
            error: errorMessage,
            bookingId,
          },
          replace: true,
        });
      });

      razorpayInstance.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      toast.error("Failed to initialize payment");
      setProcessingPayment(false);
    }
  };

  // Handle Razorpay payment retry
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
        state: {
          bookingId,
          technician: bookingData!.technician,
          service: bookingData!.service,
          date: bookingData!.date,
          time: bookingData!.time,
          amount: pricing.total,
          paymentMethod: "cod",
          problemDescription: bookingData!.problemDescription,
          address: getSelectedAddress(),
        },
      });
    } catch (error: any) {
      console.error("COD booking error:", error);
      toast.error(error.message || "Failed to create booking");
      setProcessingPayment(false);
    }
  };

  // Handle payment retry
  const handlePaymentRetry = async () => {
    if (!bookingData) {
      toast.error("Booking data not found");
      return;
    }

    if (selectedPayment === "cod") {
      await handleCashOnDelivery();
      return;
    }

    if (selectedPayment === "card") {
      await handleRazorpayPayment();
      return;
    }

    toast.error("Selected payment method is not available yet");
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

  const getErrorDetails = () => {
    const state = location.state as PaymentRetryState;
    if (!state) return null;

    if (state.razorpayError) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">
            Payment Error Details:
          </h4>
          <div className="text-sm text-red-700 space-y-1">
            {state.razorpayError.description && (
              <p>
                <strong>Description:</strong> {state.razorpayError.description}
              </p>
            )}
            {state.razorpayError.reason && (
              <p>
                <strong>Reason:</strong> {state.razorpayError.reason}
              </p>
            )}
            {state.razorpayError.code && (
              <p>
                <strong>Error Code:</strong> {state.razorpayError.code}
              </p>
            )}
            {state.razorpayError.step && (
              <p>
                <strong>Failed at:</strong> {state.razorpayError.step}
              </p>
            )}
          </div>
          {state.razorpayError.description?.includes("temporary issue") && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                💡 <strong>Tip:</strong> This appears to be a temporary issue.
                You can try again with the same payment method or try a
                different card.
              </p>
            </div>
          )}
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{state.error}</p>
        </div>
      );
    }

    return null;
  };

  // Rest of the component remains the same...
  // [Keep all the existing functions: handleAddAddress, validateBookingData, getSelectedAddress, createBookingRecord, initializeRazorpayPayment, handleRazorpayPayment, handleCashOnDelivery, handlePaymentRetry, formatDisplayDate, formatDisplayTime, getErrorDetails]

  // Update loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your booking details...</p>
            <p className="text-sm text-gray-500 mt-2">
              Preparing your payment retry
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <WarningOutlined className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Booking Not Found
              </h3>
              <p className="text-red-600 mb-4">
                We couldn't load your booking details. Please try again or
                contact support.
              </p>
              <button
                onClick={() => navigate("/services")}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Services
              </button>
            </div>
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
        {/* Error Header */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <WarningOutlined className="w-6 h-6 text-red-600" />
            <div>
              <h1 className="text-xl font-bold text-red-700">Payment Failed</h1>
              <p className="text-red-600 mt-1">
                Your previous payment attempt didn't go through. Please review
                your details and try again.
                {(() => {
                  const state = location.state as PaymentRetryState;
                  if (
                    state?.razorpayError?.description?.includes(
                      "temporary issue"
                    )
                  ) {
                    return " This appears to be a temporary issue with your bank.";
                  }
                  return "";
                })()}
              </p>
            </div>
          </div>
          {getErrorDetails()}
        </div>

        <h1 className="text-3xl font-bold mb-6">Complete Your Booking</h1>

        {/* Booking Summary - Updated with safe access */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                {getSafeTechnician().profilePictureUrl ? (
                  <img
                    src={getSafeTechnician().profilePictureUrl}
                    alt={getSafeTechnician().displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <PersonOutlined className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {getSafeTechnician().displayName}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircleOutlineOutlined className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <StarBorderOutlined className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {getSafeRating().toFixed(1)}
                  </span>
                  <span>({getSafeRatingCount()} reviews)</span>
                  <span>•</span>
                  <span>{bookingData.service}</span>
                </div>
              </div>
            </div>
            <div className="text-xl font-semibold">₹{pricing.subtotal}</div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold mb-4">Service Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm text-gray-600">Service Type: </span>
              <span className="font-medium">{bookingData.service}</span>
            </div>
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

          {bookingData.problemDescription && (
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                Problem Description:{" "}
              </span>
              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {bookingData.problemDescription}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Address Selection - Same as booking page */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <HomeOutlined className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Service Address</h2>
          </div>

          <div className="flex space-x-4 mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={usesSavedAddress}
                onChange={() => setUsesSavedAddress(true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Use saved address</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={!usesSavedAddress}
                onChange={() => setUsesSavedAddress(false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Add new address</span>
            </label>
          </div>

          {usesSavedAddress ? (
            userAddresses.length > 0 ? (
              <select
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an address</option>
                {userAddresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} - {address.street}, {address.city},{" "}
                    {address.state} - {address.pincode}
                    {address.isDefault && " (Default)"}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-2">No saved addresses found</p>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <AddOutlined className="w-4 h-4" />
                  <span>Add your first address</span>
                </button>
              </div>
            )
          ) : (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Add New Address</h3>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  <AddOutlined className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Click the button above to add a new address for service.
              </p>
            </div>
          )}

          {/* Display selected address */}
          {usesSavedAddress && selectedAddress && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Selected Address:</h4>
              {(() => {
                const address = userAddresses.find(
                  (addr) => addr.id === selectedAddress
                );
                return address ? (
                  <div className="text-gray-700">
                    <p className="font-medium">{address.label}</p>
                    <p>{address.street}</p>
                    <p>
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    {address.landmark && (
                      <p className="text-sm text-gray-600">
                        Landmark: {address.landmark}
                      </p>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
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

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handlePaymentRetry}
            disabled={
              processingPayment || (usesSavedAddress && !selectedAddress)
            }
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {processingPayment
              ? "Processing..."
              : selectedPayment === "cod"
              ? `Confirm Booking`
              : `Pay ₹${pricing.total}`}
          </button>

          <button
            onClick={() => navigate("/services")}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel and Return to Services
          </button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </main>

      {/* Add Address Modal */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSave={handleAddAddress}
        loading={savingAddress}
      />

      <Footer />
    </div>
  );
};

export default PaymentRetry;
