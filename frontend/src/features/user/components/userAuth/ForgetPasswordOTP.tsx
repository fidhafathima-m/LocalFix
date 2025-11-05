import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BaseOTP, {
  type OTPFormData,
  type UserType,
  type OTPContext,
} from "../../../../components/reusable/BaseOTP";
import { UserAuthService } from "../../../../services/user/userAuthService";
import type { OTPData } from "../../../../interface/user/IAuth";

interface LocationState {
  phone?: string;
  email?: string;
  userType: UserType;
}

const ForgotPasswordOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state and localStorage
  const locationData = location.state as LocationState;
  const storageData = JSON.parse(localStorage.getItem("forgotData") || "{}");

  const formData: OTPFormData = {
    ...storageData,
    ...locationData,
  };

  const handleSubmit = async ({
    otp,
    formData,
  }: {
    otp: string;
    formData: OTPFormData;
  }) => {
    const data: OTPData = {
      otp,
      context: "forgot" as OTPContext,
      userType: formData.userType,
      ...(formData.phone && { phone: formData.phone }),
      ...(formData.email && { email: formData.email }),
    };

    const res = await UserAuthService.verifyForgotPasswordOTP(data);

    if (!res.success) {
      throw new Error(res.message || "OTP verification failed");
    }

    const token =
      res.data?.token || res.data?.data?.token || res.accessToken || res.token;

    if (!token) {
      console.error("Token not found. Response structure:", res);
      throw new Error("No reset token received from server");
    }

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
        token: token,
      },
    });

    return {
      success: true,
      message: res.message,
      token: token,
    };
  };

  const handleResendOTP = async (formData: OTPFormData) => {
    const res = await UserAuthService.resendOTP({
      phone: formData.phone,
      email: formData.email,
      purpose: "reset",
      userType: formData.userType,
    });

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
      onSubmit={handleSubmit}
      onResendOTP={handleResendOTP}
      title="Password Reset OTP Verification"
      subtitle="Please enter the six-digit pin sent to reset your password"
      verifyButtonText="Reset Password"
    />
  );
};

export default ForgotPasswordOTP;
