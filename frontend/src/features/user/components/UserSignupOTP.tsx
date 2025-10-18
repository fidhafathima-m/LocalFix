import React from "react";
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

const UserSignupOTP: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Get data from location state and localStorage
  const locationData = location.state as LocationState;
  const storageData = JSON.parse(localStorage.getItem("signupData") || "{}");
  
  const formData: OTPFormData = {
    ...storageData,
    ...locationData,
    userType: "user" as UserType,
  };

  const handleSubmit = async ({ otp, formData }: { otp: string; formData: OTPFormData }) => {
    const otpData: OTPData = {
      otp,
      userType: "user",
      context: "signup" as OTPContext,
      ...(formData.phone && { phone: formData.phone }),
      ...(formData.email && { email: formData.email }),
      ...(formData.fullName && { fullName: formData.fullName }),
      ...(formData.password && { password: formData.password }),
    };

    const res = await authAPI.verifyOTP(otpData);

    // Check if the response indicates success
    if (!res.success) {
      throw new Error(res.message || "OTP verification failed");
    }

    // ✅ FIXED: Extract user and token from data object
    const userData = res.data?.user || res.user;
    const accessToken = res.data?.accessToken || res.accessToken;
    const refreshToken = res.data?.refreshToken || res.refreshToken;

    if (!userData || !accessToken || !refreshToken) {
      throw new Error("Invalid response from server: missing user data or token");
    }

     const userWithRoles: User = {
      _id: userData._id,
      fullName: userData.fullName,
      phone: userData.phone || "",
      email: userData.email || "",
      roles: userData.roles || [], // Use roles array
      isVerified: userData.isVerified || false,
    };

    // Dispatch login success
    dispatch(loginSuccess({
      user: userData as User,
      accessToken: accessToken,
      refreshToken: refreshToken,
    }));

    const userRoles = userData.roles || [];
    const hasServiceProviderRole = userRoles.includes("serviceProvider");
    const hasAdminRole = userRoles.includes("admin");

    // Determine redirect path based on user role and application status
    let redirectPath = "/";
    if (hasServiceProviderRole) {
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
    } else if (hasAdminRole) {
      redirectPath = "/admin/dashboard";
    }

    // Clean up localStorage
    localStorage.removeItem("signupData");

    return {
      success: true,
      message: res.message || "OTP verified successfully",
      user: userWithRoles,
      accessToken: accessToken,
      refreshToken: refreshToken,
      redirectPath,
    };
  };

  const handleResendOTP = async (formData: OTPFormData) => {
    const res = await authAPI.resendOTP({
      phone: formData.phone,
      email: formData.email,
      purpose: "signup",
      userType: "user",
    });

    return {
      success: res.success,
      message: res.message,
    };
  };

  return (
    <BaseOTP
      userType="user"
      context="signup"
      formData={formData}
      onSubmit={handleSubmit}
      onResendOTP={handleResendOTP}
      title="User OTP Verification"
      subtitle="Please enter the six-digit pin sent to verify your account"
      verifyButtonText="Verify Account"
    />
  );
};

export default UserSignupOTP;