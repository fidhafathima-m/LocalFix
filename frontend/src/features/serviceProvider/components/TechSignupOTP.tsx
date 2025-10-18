/* eslint-disable @typescript-eslint/no-explicit-any */
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

      // FIX: Check if user has serviceProvider role in their roles array
      const hasServiceProviderRole = res.user.roles?.includes("serviceProvider");
      
      if (!hasServiceProviderRole) {
        throw new Error("User does not have service provider role");
      }

      // FIX: Use the correct User type that matches your authSlice
      const userData: User = {
        _id: res.user._id,
        fullName: res.user.fullName,
        phone: res.user.phone || "",
        email: res.user.email || "",
        role: "serviceProvider",
        isVerified: res.user.isVerified || false,
      };

      dispatch(loginSuccess({
        user: userData,
        token: res.token,
      }));

      // KEEP ORIGINAL REDIRECTION LOGIC - DON'T CHANGE PATHS
      let redirectPath = "/";
      if (userData.role === "serviceProvider") {
        if (userData.applicationStatus === "approved") {
          redirectPath = "/technicians/dashboard";
        } else if (
          userData.applicationStatus === "submitted" ||
          userData.applicationStatus === "under_review"
        ) {
          redirectPath = "/pending-technician/dashboard";
        } else {
          redirectPath = "/technicians";
        }
      } else if (userData.role === "admin") {
        redirectPath = "/admin/dashboard";
      }

      localStorage.removeItem("signupData");

      return {
        success: true,
        message: res.message,
        user: userData,
        token: res.token,
        redirectPath,
      };
    } catch (error: any) {
      console.error("OTP verification error:", error);
      return {
        success: false,
        message: error.message || "OTP verification failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (formData: OTPFormData) => {
    setLoading(true);
    try {
      const res = await authAPI.resendOTP({
        phone: formData.phone,
        email: formData.email,
        purpose: "signup",
        userType: "serviceProvider",
      });
      
      return {
        success: res.success,
        message: res.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to resend OTP",
      };
    } finally {
      setLoading(false);
    }
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