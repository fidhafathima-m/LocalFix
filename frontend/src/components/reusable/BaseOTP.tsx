/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export type UserType = "user" | "serviceProvider" | "admin";
export type OTPContext = "signup" | "forgot";

export interface OTPFormData {
  phone?: string;
  email?: string;
  userType: UserType;
  fullName?: string;
  password?: string;
  token?: string;
}

export interface OTPSubmitResponse {
  success: boolean;
  message?: string;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  redirectPath?: string;
}

export interface BaseOTPProps {
  userType: UserType;
  context: OTPContext;
  formData: OTPFormData;
  onSubmit: (data: {
    otp: string;
    formData: OTPFormData;
  }) => Promise<OTPSubmitResponse>;
  onResendOTP: (
    formData: OTPFormData
  ) => Promise<{ success: boolean; message?: string }>;
  onSuccess?: (result: OTPSubmitResponse) => void;
  onFailure?: (error: string) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  resendButtonText?: string;
  verifyButtonText?: string;
  countdownDuration?: number;
}

const BaseOTP: React.FC<BaseOTPProps> = ({
  userType,
  context,
  formData,
  onSubmit,
  onResendOTP,
  onSuccess,
  onFailure,
  loading: externalLoading = false,
  title,
  subtitle,
  resendButtonText = "Resend code",
  verifyButtonText = "Verify",
  countdownDuration = 60,
}) => {
  const [otp, setOtp] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(countdownDuration);

  const navigate = useNavigate();

  // Use external loading if provided, otherwise use internal loading
  const isLoading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const getDefaultTitle = () => {
    const role =
      userType === "user"
        ? "User"
        : userType === "serviceProvider"
        ? "Technician"
        : "Admin";
    return context === "signup"
      ? `${role} OTP Verification`
      : `${role} Forgot Password OTP Verification`;
  };

  const getDefaultSubtitle = () => {
    return "Please enter the six-digit pin sent to:";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");

    // Set loading state
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }

    try {
      const result = await onSubmit({ otp, formData });

      if (result.success) {
        toast.success(result.message || "OTP verified successfully!");
        onSuccess?.(result);

        if (result.redirectPath) {
          navigate(result.redirectPath, { replace: true });
        } 
      } else {
        const errorMessage = result.message || "OTP verification failed";
        setError(errorMessage);
        toast.error(errorMessage);
        onFailure?.(errorMessage);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error("OTP verification error:", error);

      let errorMessage = "OTP verification failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      onFailure?.(errorMessage);
    } finally {
      // Reset loading state
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);

    try {
      const result = await onResendOTP(formData);

      if (result.success) {
        setCountdown(countdownDuration);
        toast.success(result.message || "OTP resent successfully!");
      } else {
        toast.error(result.message || "Failed to resend OTP");
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold p-5">
          {title || getDefaultTitle()}
        </h1>
        <p className="text-sm text-gray-500">
          {subtitle || getDefaultSubtitle()}
        </p>
        {formData?.phone && (
          <p className="text-blue-600 font-semibold">{formData.phone}</p>
        )}
        {formData?.email && (
          <p className="text-blue-600 font-semibold">{formData.email}</p>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-center p-5">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter OTP"
            className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-between items-center pb-5">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0 || resendLoading}
            className={`text-blue-600 font-semibold ${
              countdown > 0 || resendLoading
                ? "text-gray-400 cursor-not-allowed"
                : "hover:text-blue-800"
            }`}
          >
            {resendLoading ? "Sending..." : resendButtonText}
          </button>
          <p className="font-semibold text-blue-600">{formatTime(countdown)}</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-700 text-white p-2 rounded ${
            isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-800 cursor-pointer"
          }`}
        >
          {isLoading ? "Verifying..." : verifyButtonText}
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default BaseOTP;
