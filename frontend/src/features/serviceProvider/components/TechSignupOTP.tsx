import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/redux";
import { loginSuccess, type User } from "../../../store/slices/authSlice";
import { authAPI, type OTPData } from "../../../services/authApi";
import BaseOTP, { type OTPFormData, type UserType, type OTPContext } from "../../../components/reusable/BaseOTP";

interface LocationState {
  phone?: string;
  email?: string;
  userType: UserType;
  fullName?: string;
  password?: string;
}

const TechSignupOTP: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Get data from location state and localStorage
  const locationData = location.state as LocationState;
  const storageData = JSON.parse(localStorage.getItem("signupData") || "{}");
  
  const formData: OTPFormData = {
    ...storageData,
    ...locationData,
    userType: "serviceProvider" as UserType,
  };

  const handleSubmit = async ({ otp, formData }: { otp: string; formData: OTPFormData }) => {
    setLoading(true);
    
    try {
      // Use verifyOTP endpoint for signup (requires fullName, password)
      const otpData: OTPData = {
        otp,
        userType: "serviceProvider",
        context: "signup" as OTPContext,
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.email && { email: formData.email }),
        ...(formData.fullName && { fullName: formData.fullName }),
        ...(formData.password && { password: formData.password }),
      };

      const res = await authAPI.verifyOTP(otpData);

      if (!res.success || !res.user || !res.token) {
        throw new Error(res.message || "Invalid response from server");
      }

      dispatch(loginSuccess({
        user: res.user as User,
        token: res.token,
      }));

      // Determine redirect path based on user role and application status
      let redirectPath = "/";
      if (res.user.role === "serviceProvider") {
        if (res.user.applicationStatus === "approved") {
          redirectPath = "/technicians/dashboard";
        } else if (
          res.user.applicationStatus === "submitted" ||
          res.user.applicationStatus === "under_review"
        ) {
          redirectPath = "/pending-technician/dashboard";
        } else {
          redirectPath = "/technicians";
        }
      } else if (res.user.role === "admin") {
        redirectPath = "/admin/dashboard";
      }

      localStorage.removeItem("signupData");

      return {
        success: true,
        message: res.message,
        user: res.user,
        token: res.token,
        redirectPath,
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
      purpose: "signup",
      userType: "serviceProvider",
    });
    setLoading(false);
    
    return {
      success: res.success,
      message: res.message,
    };
  };

  return (
    <BaseOTP
      userType="serviceProvider"
      context="signup"
      formData={formData}
      loading={loading}
      onSubmit={handleSubmit}
      onResendOTP={handleResendOTP}
      title="Service Provider OTP Verification"
      subtitle="Please enter the six-digit pin sent to verify your account"
      verifyButtonText="Verify Account"
    />
  );
};

export default TechSignupOTP;