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
const Home = lazy(() => import("../features/user/pages/Home"));
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
const Services = lazy(
  () => import("../features/user/pages/Services")
);
const ServiceDetails = lazy(
  () => import("../features/user/pages/ServiceDetails")
);
const UserTechnicianProfile = lazy(
  () => import("../features/user/pages/TechnicianProfile")
);
const BookingPage = lazy(
  () => import("../features/user/pages/Booking")
);
const UserProfile = lazy(
  () => import("../features/user/pages/UserProfile")
);
const Checkout = lazy(
  () => import("../features/user/pages/Checkout")
);
const PaymentSuccess = lazy(
  () => import("../features/user/pages/PaymentSuccess")
);
const PaymentFailed = lazy(
  () => import("../features/user/pages/PaymentFailed")
);
const ServiceTracking = lazy(
  () => import("../features/user/pages/ServiceTracking")
);
const MyOrders = lazy(
  () => import("../features/user/pages/Orders")
);
const CancelBooking = lazy(
  () => import("../features/user/pages/CancelBooking")
);
const CancelBookingSuccess = lazy(
  () => import("../features/user/pages/CancelBookingSuccess")
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
  () => import("../features/serviceProvider/pages/PendingTechnician")
);
const ApprovedTechnicianDashboard = lazy(
  () => import("../features/serviceProvider/pages/ApprovedTechnician")
);
const TechnicianProfileEdit = lazy(
  () => import("../features/serviceProvider/pages/TechnicianProfileEdit")
);

// AdminRoutes imports
const AdminLoginPage = lazy(
  () => import("../features/admin/pages/AdminLoginPage")
);
const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboard")
);
const ProtectedRoute = lazy(() => import("../components/ProtectedRoute"));
const AdminForgotPasswordPage = lazy(
  () => import("../features/admin/pages/AdminForgotPasswordPage")
);
const AdminForgetOTPPage = lazy(
  () => import("../features/admin/pages/AdminForgetOTPPage")
);
const UserManagement = lazy(
  () => import("../features/admin/pages/UserManagement")
);
const AdminResetPasswordPage = lazy(
  () => import("../features/admin/pages/AdminResetPasswordPage")
);
const TechnicianManagement = lazy(
  () => import("../features/admin/pages/TechnicianManagement")
);
const TechnicianProfile = lazy(
  () => import("../features/admin/pages/TechnicianProfile")
);
const PendingApplicationProfile = lazy(
  () => import("../features/admin/pages/PendingTechnicianProfile")
);
const CategoryManagement = lazy(
  () => import("../features/admin/pages/CategoryManagement")
);
const ServiceManagement = lazy(
  () => import("../features/admin/pages/ServiceManagement")
);
const ItemManagement = lazy(
  () => import("../features/admin/pages/ItemManagement")
);
const OrderManagement = lazy(
  () => import("../features/admin/pages/OrderManagemnet")
);
const ViewOrder = lazy(
  () => import("../features/admin/components/ViewOrder")
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
            <Route path="/technicians/:id" element={<UserTechnicianProfile />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/my-profile" element={<UserProfile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/bookings/:bookingId" element={<ServiceTracking />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/cancel-order/:orderId" element={<CancelBooking />} />
            <Route path="/cancel-booking-success" element={<CancelBookingSuccess />} />

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
          </Routes>
        </Suspense>
      </Router>
    </>
  );
};

export default AppRoutes;
