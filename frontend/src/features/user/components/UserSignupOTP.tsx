import React from "react";
import {  useLocation } from "react-router-dom";
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