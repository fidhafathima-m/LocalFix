import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI, type OTPData } from "../../../services/authApi";
import BaseOTP, { type OTPFormData, type UserType, type OTPContext } from "../../../components/reusable/BaseOTP";

interface LocationState {
  phone?: string;
  email?: string;
  userType: UserType;
}

const TechForgotPasswordOTP: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state and localStorage
  const locationData = location.state as LocationState;
  const storageData = JSON.parse(localStorage.getItem("forgotData") || "{}");
  
  const formData: OTPFormData = {
    ...storageData,
    ...locationData,
  };

  const handleSubmit = async ({ otp, formData }: { otp: string; formData: OTPFormData }) => {
    setLoading(true);
    
    try {
      // Use verifyResetOTP endpoint for forgot password (doesn't require fullName, password)
      const data: OTPData = {
        otp,
        context: "forgot" as OTPContext,
        userType: formData.userType,
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.email && { email: formData.email }),
      };

      const res = await authAPI.verifyForgotPasswordOTP(data);

      if (!res.success) {
        throw new Error(res.message || "OTP verification failed");
      }

      // Navigate to the correct reset password route based on user type
      let resetPath = "/reset-password";
      if (formData.userType === "admin") {
        resetPath = "/admin/reset-password";
      } else if (formData.userType === "serviceProvider") {
        resetPath = "/technicians/reset-password";
      }

      navigate(resetPath, {
        state: {
          phone: formData.phone,
          email: formData.email,
          userType: formData.userType,
          token: res.token,
        },
      });

      return {
        success: true,
        message: res.message,
        token: res.token,
      };
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (formData: OTPFormData) => {
    setLoading(true);
    const res = await authAPI.resendOTP({
      phone: formData.phone,
      email: formData.email,
      purpose: "reset",
      userType: formData.userType,
    });
    setLoading(false);
    
    return {
      success: res.success,
      message: res.message,
    };
  };

  return (
    <BaseOTP
      userType={formData.userType}
      context="forgot"
      formData={formData}
      loading={loading}
      onSubmit={handleSubmit}
      onResendOTP={handleResendOTP}
      title="Password Reset OTP Verification"
      subtitle="Please enter the six-digit pin sent to reset your password"
      verifyButtonText="Reset Password"
    />
  );
};

export default TechForgotPasswordOTP;