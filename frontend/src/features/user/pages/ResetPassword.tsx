import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NewPassword from "../../../components/common/NewPassword";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import toast from "react-hot-toast";
import { authAPI, type ResetPasswordData } from "../../../services/authApi";

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the state passed from OTP component
  const state = location.state as {
    phone?: string;
    email?: string;
    otp?: string;
    token?: string;
    userType: "user" | "serviceProvider" | "admin";
  };

  useEffect(() => {
    // Check if we have the necessary data (either phone or email + (otp OR token) + userType)
    const hasIdentifier = state?.phone || state?.email;
    const hasVerification = state?.otp || state?.token;
    const hasUserType = state?.userType;

    if (!hasIdentifier || !hasVerification || !hasUserType) {
      console.error("Missing required data for password reset:", state);
      toast.error("Invalid reset password request");
      navigate("/forgot-password");
      return;
    }
  }, [state, navigate]);

  const hasIdentifier = state?.phone || state?.email;
  const hasVerification = state?.otp || state?.token;
  const hasUserType = state?.userType;

  if (!hasIdentifier || !hasVerification || !hasUserType) {
    return null;
  }

  const handleResetPassword = async (newPassword: string) => {
    try {
      // Use the data from location state
      const payload: ResetPasswordData = {
        password: newPassword,
        confirmPassword: newPassword,
        userType: state.userType,
      };

      // Add phone or email based on what's available
      if (state.phone) {
        payload.phone = state.phone;
      } else if (state.email) {
        payload.email = state.email;
      }

      // Add OTP or token based on what's available
      if (state.otp) {
        payload.otp = state.otp;
      } else if (state.token) {
        payload.token = state.token;
      }

      const response = await authAPI.resetPassword(payload);

      if (response.success) {
        toast.success("Password reset successfully");

        localStorage.removeItem("forgotData");

        setTimeout(() => {
          let loginPath = "/login";
          if (state.userType === "admin") {
            loginPath = "/admin/login";
          } else if (state.userType === "serviceProvider") {
            loginPath = "/technicians/login";
          }
          navigate(loginPath, { replace: true });
        }, 1000);
      } else {
        toast.error(response.message || "Reset password failed");
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      toast.error("Reset password failed");
    }
  };

  return (
    <>
      <Header userType={state.userType} />
      <NewPassword userType={state.userType} onSubmit={handleResetPassword} />
      <Footer />
    </>
  );
};

export default ResetPasswordPage;