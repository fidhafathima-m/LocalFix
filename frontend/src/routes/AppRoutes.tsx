import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Bouncy } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import { Toaster } from "react-hot-toast";

// Simple loading component
const LoadingSpinner = () => (
  <div className="bg-[#F6F6F6] flex justify-center items-center h-screen">
    <Bouncy size="45" speed="1.75" color="#2563EB" />
  </div>
);

// User Routes imports
const Home = lazy(() => import("../features/user/pages/HomePage"));
const UserSignupPage = lazy(
  () => import("../features/user/pages/UserSignupPage")
);
const UserLogin = lazy(() => import("../features/user/pages/UserLoginPage"));
const UserForgotPasswordPage = lazy(
  () => import("../features/user/pages/UserForgotPasswordPage")
);
const UserSignupOTPPage = lazy(
  () => import("../features/user/pages/UserSignupOTPPage")
);
const UserResetPasswordPage = lazy(
  () => import("../features/user/pages/UserResetPasswordPage")
);
const ForgertPasswordOTPPage = lazy(
  () => import("../features/user/pages/ForgertPasswordOTPPage")
);
const Services = lazy(() => import("../features/user/pages/ServicesPage"));
const ServiceDetails = lazy(
  () => import("../features/user/pages/ServiceDetailsPage")
);
const UserTechnicianProfile = lazy(
  () => import("../features/user/pages/TechnicianProfilePage")
);
const BookingPage = lazy(() => import("../features/user/pages/BookingPage"));
const UserProfile = lazy(
  () => import("../features/user/pages/UserProfilePage")
);
const Checkout = lazy(() => import("../features/user/pages/CheckoutPage"));
const PaymentSuccess = lazy(
  () => import("../features/user/pages/PaymentSuccessPage")
);
const PaymentFailed = lazy(
  () => import("../features/user/pages/PaymentFailedPage")
);
const PaymentRetry = lazy(
  () => import("../features/user/pages/PaymentRetryPage")
);
const ServiceTracking = lazy(
  () => import("../features/user/pages/ServiceTrackingPage")
);
const MyOrders = lazy(() => import("../features/user/pages/OrdersPage"));
const CancelBooking = lazy(
  () => import("../features/user/pages/CancelBookingPage")
);
const CancelBookingSuccess = lazy(
  () => import("../features/user/pages/CancelBookingSuccessPage")
);
const RescheduleService = lazy(
  () => import("../features/user/pages/RescheduleServicePage")
);
const RescheduleSuccess = lazy(
  () => import("../features/user/pages/RescheduleSuccessPage")
);
const LeaveReview = lazy(
  () => import("../features/user/pages/LeaveReviewPage")
);
const ReviewSuccess = lazy(
  () => import("../features/user/pages/ReviewSuccessPage")
);
const ChatSupport = lazy(
  () => import("../features/user/pages/ChatSupportPage")
);

// Service Provider Routes imports
const TechHome = lazy(
  () => import("../features/serviceProvider/pages/TechHome")
);
const TechSignUp = lazy(
  () => import("../features/serviceProvider/pages/TechSignUp")
);
const TechnicianApplication = lazy(
  () => import("../features/serviceProvider/pages/TechnicianApplication")
);
const TechLoginPage = lazy(
  () => import("../features/serviceProvider/pages/TechLoginPage")
);
const TechForgetPasswordPage = lazy(
  () => import("../features/serviceProvider/pages/TechForgetPasswordPage")
);
const TechSignupOTPPage = lazy(
  () => import("../features/serviceProvider/pages/TechSignupOTPPage")
);
const TechForgotPasswordOTPPage = lazy(
  () => import("../features/serviceProvider/pages/TechForgetPasswordOTPPage")
);
const TechnicianResetPasswordPage = lazy(
  () => import("../features/serviceProvider/pages/TechResetPasswordPage")
);
const PendingTechnicianApplication = lazy(
  () => import("../features/serviceProvider/pages/PendingTechnicianPage")
);
const ApprovedTechnicianDashboard = lazy(
  () => import("../features/serviceProvider/pages/ApprovedTechnicianPage")
);
const TechnicianProfileEdit = lazy(
  () => import("../features/serviceProvider/pages/TechnicianProfileEditPage")
);
const OrderDetails = lazy(
  () => import("../features/serviceProvider/pages/OrderDetailsPage")
);
const SparePartsApproval = lazy(
  () => import("../features/user/components/spareParts/QuoteApproval")
);
const SparePartsPayment = lazy(
  () => import("../features/user/components/spareParts/PartsPayment")
);
const SubscriptionPlans = lazy(
  () => import("../features/serviceProvider/pages/SubscriptionPlansPage")
);
const SubscriptionCheckout = lazy(
  () => import("../features/serviceProvider/pages/SubscriptionCheckoutPage")
);
const SubscriptionCheckoutSuccess = lazy(
  () => import("../features/serviceProvider/pages/SubscriptionSuccessPage")
);
const SubscriptionDetails = lazy(
  () => import("../features/serviceProvider/pages/SubscriptionDetailsPage")
);

// AdminRoutes imports
const AdminLoginPage = lazy(
  () => import("../features/admin/pages/AdminLoginPage")
);
const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboardPage")
);
const ProtectedRoute = lazy(() => import("../components/ProtectedRoute"));
const AdminForgotPasswordPage = lazy(
  () => import("../features/admin/pages/AdminForgotPasswordPage")
);
const AdminForgetOTPPage = lazy(
  () => import("../features/admin/pages/AdminForgetOTPPage")
);
const UserManagement = lazy(
  () => import("../features/admin/pages/UserManagementPage")
);
const AdminResetPasswordPage = lazy(
  () => import("../features/admin/pages/AdminResetPasswordPage")
);
const TechnicianManagement = lazy(
  () => import("../features/admin/pages/TechnicianManagementPage")
);
const TechnicianProfile = lazy(
  () => import("../features/admin/pages/TechnicianProfilePage")
);
const PendingApplicationProfile = lazy(
  () => import("../features/admin/pages/PendingTechnicianProfilePage")
);
const CategoryManagement = lazy(
  () => import("../features/admin/pages/CategoryManagementPage")
);
const ServiceManagement = lazy(
  () => import("../features/admin/pages/ServiceManagementPage")
);
const ItemManagement = lazy(
  () => import("../features/admin/pages/ItemManagementPage")
);
const OrderManagement = lazy(
  () => import("../features/admin/pages/OrderManagemnetPage")
);
const ViewOrder = lazy(
  () => import("../features/admin/components/orderManagement/ViewOrder")
);
const ReviewManagement = lazy(
  () => import("../features/admin/pages/ReviewManagementPage")
);
const PaymentsManagement = lazy(
  () => import("../features/admin/pages/PaymentManagementPage")
);
const ReportManagement = lazy(
  () => import("../features/admin/pages/ReportManagementPage")
);
const SubscriptionManagementPage = lazy(
  () => import("../features/admin/pages/SubscriptionManagementPage")
);

const AppRoutes = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signUp" element={<UserSignupPage />} />
            <Route path="/otp" element={<UserSignupOTPPage />} />
            <Route
              path="/forgot-password"
              element={<UserForgotPasswordPage />}
            />
            <Route path="/verify-otp" element={<ForgertPasswordOTPPage />} />
            <Route path="/reset-password" element={<UserResetPasswordPage />} />
            <Route path="/services" element={<Services />} />
            <Route path="/service/:slug" element={<ServiceDetails />} />
            <Route
              path="/technicians/:id"
              element={<UserTechnicianProfile />}
            />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/my-profile" element={<UserProfile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/retry-payment" element={<PaymentRetry />} />
            <Route path="/bookings/:bookingId" element={<ServiceTracking />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/cancel-order/:orderId" element={<CancelBooking />} />
            <Route
              path="/cancel-booking-success"
              element={<CancelBookingSuccess />}
            />
            <Route path="/reschedule-service" element={<RescheduleService />} />
            <Route path="/reschedule-success" element={<RescheduleSuccess />} />
            <Route path="/leave-a-review/:orderId" element={<LeaveReview />} />
            <Route path="/review-success" element={<ReviewSuccess />} />
            <Route
              path="/orders/:orderId/spare-parts/:requestId/approval"
              element={<SparePartsApproval />}
            />
            <Route
              path="/orders/:orderId/spare-parts/:requestId/payment"
              element={<SparePartsPayment />}
            />
            <Route path="/chatbot" element={<ChatSupport />} />

            {/* technicians routes */}
            <Route path="/technicians" element={<TechHome />} />
            <Route path="/technicians/signup" element={<TechSignUp />} />
            <Route
              path="/technicians/apply"
              element={<TechnicianApplication />}
            />
            <Route path="/technicians/login" element={<TechLoginPage />} />
            <Route
              path="/technicians/forgot-password"
              element={<TechForgetPasswordPage />}
            />
            <Route
              path="/technicians/verify-otp"
              element={<TechSignupOTPPage />}
            />
            <Route
              path="/technicians/forgot-verify-otp"
              element={<TechForgotPasswordOTPPage />}
            />
            <Route
              path="/technicians/reset-password"
              element={<TechnicianResetPasswordPage />}
            />
            <Route
              path="/pending-technician/dashboard"
              element={
                <ProtectedRoute allowedRoles={["serviceProvider"]}>
                  <PendingTechnicianApplication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/dashboard"
              element={
                <ProtectedRoute allowedRoles={["serviceProvider"]}>
                  <ApprovedTechnicianDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/profile"
              element={<TechnicianProfileEdit />}
            />
            <Route
              path="/technician/order/:orderId"
              element={<OrderDetails />}
            />
            <Route
              path="/technician/subscription-plans"
              element={<SubscriptionPlans />}
            />
            <Route
              path="/technician/subscription-plan/:planId/checkout"
              element={<SubscriptionCheckout />}
            />
            <Route
              path="/technician/subscription-plan/payment-success"
              element={<SubscriptionCheckoutSuccess />}
            />
            <Route
              path="/technician/subscriptions/:planId"
              element={<SubscriptionDetails />}
            />

            {/* admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/forgot-password"
              element={<AdminForgotPasswordPage />}
            />
            <Route path="/admin/verify-otp" element={<AdminForgetOTPPage />} />
            <Route
              path="/admin/reset-password"
              element={<AdminResetPasswordPage />}
            />
            <Route
              path="/admin/user-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/technician-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TechnicianManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/technicians/:technicianId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TechnicianProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/technicians/:technicianId/:tabId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TechnicianProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pending-applications/:applicationId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PendingApplicationProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/category-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/service-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ServiceManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/item-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ItemManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/order-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <OrderManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/order-management/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ViewOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReviewManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PaymentsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReportManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subscription-management"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <SubscriptionManagementPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default AppRoutes;
