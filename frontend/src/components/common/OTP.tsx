import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../hooks/redux";
import { loginSuccess, type User } from "../../store/slices/authSlice";
import { authAPI, type OTPData } from "../../services/authApi";
import { AxiosError } from "axios";

type UserType = "user" | "serviceProvider" | "admin";
type OTPContext = "signup" | "forgot";

interface OTPProps {
  userType: UserType;
  context: OTPContext;
}

interface LocationState {
  phone?: string;
  email?: string;
  userType: UserType;
  fullName?: string;
  password?: string;
}

interface SignupOTPData extends OTPData {
  fullName?: string;
  password?: string;
}

const OTP: React.FC<OTPProps> = ({ userType, context }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  // Get data from location state
  const locationData = location.state as LocationState;

  const storageKey = context === "signup" ? "signupData" : "forgotData";
  const contextData = JSON.parse(localStorage.getItem(storageKey) || "{}");

  const finalData = {
    ...contextData,
    ...locationData,
  };

  console.log("🔍 OTP Component - Final data:", finalData);

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

  const getTitle = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (context === "signup") {
        console.log("🔍 Sending OTP verification with data:", {
          otp,
          userType,
          context,
          phone: finalData.phone,
          email: finalData.email,
          fullName: finalData.fullName,
          password: finalData.password,
        });

        const otpData: SignupOTPData = {
          otp,
          userType,
          context,
          phone: finalData.phone,
          email: finalData.email,
          fullName: finalData.fullName,
          password: finalData.password,
        };

        const cleanOtpData: SignupOTPData = {
          otp: otpData.otp,
          userType: otpData.userType,
          context: otpData.context,
          ...(otpData.phone && { phone: otpData.phone }),
          ...(otpData.email && { email: otpData.email }),
          ...(otpData.fullName && { fullName: otpData.fullName }),
          ...(otpData.password && { password: otpData.password }),
        };

        console.log("🔍 Clean OTP data being sent:", cleanOtpData);

        const res = await authAPI.verifyOTP(cleanOtpData as OTPData);
        console.log("🔍 API Response:", res);

        if (!res.success || !res.user || !res.token) {
          throw new Error(
            res.message || "Invalid response from server - missing user data"
          );
        }

        dispatch(
          loginSuccess({
            user: res.user as User,
            token: res.token,
          })
        );

        toast.success(res.message || "OTP verified successfully!");

        const userRole = res.user.role;

        let redirectPath = "/";
        if (userRole === "user") {
          redirectPath = "/";
        } else if (userRole === "serviceProvider") {
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
        } else if (userRole === "admin") {
          redirectPath = "/admin/dashboard";
        }

        console.log("🔍 User Role from API:", userRole);
        console.log("🔍 Redirecting to:", redirectPath);

        localStorage.removeItem("signupData");
        navigate(redirectPath, { replace: true });
      } else {
        // Forgot password OTP verification
        const data: OTPData = {
          otp,
          context: "forgot",
          userType,
          phone: finalData.phone,
          email: finalData.email,
        };

        const res = await authAPI.verifyForgotPasswordOTP(data);
        console.log("🔍 Forgot password OTP response:", res);

        if (!res.success) {
          throw new Error(res.message || "OTP verification failed");
        }

        let resetPath = "/reset-password";
        if (userType === "admin") {
          resetPath = "/admin/reset-password";
        } else if (userType === "serviceProvider") {
          resetPath = "/technicians/reset-password";
        }

        navigate(resetPath, {
          state: {
            phone: finalData.phone,
            email: finalData.email,
            userType,
            token: res.token,
          },
          replace: true,
        });

        toast.success(res.message || "OTP verified successfully");
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error("🔍 OTP verification error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      let errorMessage = "OTP verification failed";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);

    try {
      const purpose = context === "signup" ? "signup" : "reset";

      await authAPI.resendOTP({
        phone: finalData.phone,
        email: finalData.email,
        purpose,
        userType,
      });

      setCountdown(60);
      toast.success("OTP resent successfully!");
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
        <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
        <p className="text-sm text-gray-500">
          Please enter the six-digit pin sent to:
        </p>
        {finalData?.phone && (
          <p className="text-blue-600 font-semibold">{finalData.phone}</p>
        )}
        {finalData?.email && (
          <p className="text-blue-600 font-semibold">{finalData.email}</p>
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
            {resendLoading ? "Sending..." : "Resend code"}
          </button>
          <p className="font-semibold text-blue-600">{formatTime(countdown)}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-700 text-white p-2 rounded cursor-pointer ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-800"
          }`}
        >
          {loading ? "Verifying..." : "Verify"}
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

export default OTP;
