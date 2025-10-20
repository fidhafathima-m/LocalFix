/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/redux";
import { getSafeApplicationStatus, loginSuccess, type User } from "../../../store/slices/authSlice";
import { type OTPData } from "../../../services/common/authApi";
import BaseOTP, { type OTPFormData, type UserType, type OTPContext } from "../../../components/reusable/BaseOTP";
import { TechnicianAuthService } from "../../../services/technician/technicianAuthService";

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

// In your TechSignupOTP.tsx - fix the applicationStatus type
// In TechSignupOTP.tsx - fix the redirect logic
const handleSubmit = async ({ otp, formData }: { otp: string; formData: OTPFormData }) => {
  setLoading(true);
  
  try {
    const otpData: OTPData = {
      otp,
      userType: "serviceProvider",
      context: "signup" as OTPContext,
      ...(formData.phone && { phone: formData.phone }),
      ...(formData.email && { email: formData.email }),
      ...(formData.fullName && { fullName: formData.fullName }),
      ...(formData.password && { password: formData.password }),
    };

    const res = await TechnicianAuthService.verifyOTP(otpData);

    const userData = res.data?.user || res.user;
    const accessToken = res.data?.accessToken || res.accessToken;
    const refreshToken = res.data?.refreshToken || res.refreshToken;

    if (!res.success || !userData || !accessToken || !refreshToken) {
      throw new Error(res.message || "Invalid response from server");
    }

    const hasServiceProviderRole = userData.roles?.includes("serviceProvider");
    
    if (!hasServiceProviderRole) {
      throw new Error("User does not have service provider role");
    }

    const userWithRoles: User = {
      _id: userData._id,
      fullName: userData.fullName,
      phone: userData.phone || "",
      email: userData.email || "",
      roles: userData.roles || [],
      isVerified: userData.isVerified || false,
      applicationStatus: getSafeApplicationStatus(userData.applicationStatus),
    };

    dispatch(loginSuccess({
      user: userWithRoles,
      accessToken: accessToken,
      refreshToken: refreshToken,
    }));

    // ✅ FIXED: Better redirect logic with debugging
    let redirectPath = "/";
    
    console.log("🔍 User applicationStatus:", userData.applicationStatus); // DEBUG
    
    if (hasServiceProviderRole) {
      if (userData.applicationStatus === "approved") {
        redirectPath = "/technician/dashboard"; // Note: your route is "/technician/dashboard" not "/technicians/dashboard"
      } else if (
        userData.applicationStatus === "submitted" ||
        userData.applicationStatus === "under_review"
      ) {
        redirectPath = "/pending-technician/dashboard";
      } else {
        redirectPath = "/technicians"; // This might be the issue - it's redirecting here
      }
    }

    console.log("🔍 Determined redirectPath:", redirectPath); // DEBUG

    localStorage.removeItem("signupData");

    return {
      success: true,
      message: res.message,
      user: userWithRoles,
      accessToken: accessToken,
      refreshToken: refreshToken,
      redirectPath, // Make sure this is being returned
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
      const res = await TechnicianAuthService.resendOTP({
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