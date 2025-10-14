import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordSchema, validateSchema } from "../../validation";
import { authAPI } from "../../services/authApi"; 

type UserType = "user" | "serviceProvider" | "admin";

interface ForgetPasswordProps {
  userType: UserType;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ userType }) => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{phone?: string; email?: string}>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getTitle = () => {
    switch (userType) {
      case "user":
        return "User Forgot Password";
      case "serviceProvider":
        return "Technician Forgot Password";
      case "admin":
        return "Admin Forgot Password";
      default:
        return "Forgot Password";
    }
  };

  const getLoginPath = () => {
    switch (userType) {
      case "serviceProvider":
        return "/technicians/login";
      case "admin":
        return "/admin/login";
      default:
        return "/login";
    }
  };

  const getVerifyPath = () => {
    switch (userType) {
      case "admin":
        return "/admin/verify-otp";
      case "serviceProvider":
        return "/technicians/verify-otp";
      default:
        return "/verify-otp";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});

    // Validate form
    const validation = validateSchema(forgotPasswordSchema, {
      phone,
      email,
      userType,
    });

    if (!validation.success && validation.errors) {
      // Set field-specific errors for display below inputs
      const errors = validation.errors;
      const fieldErrors: {phone?: string; email?: string} = {};
      
      if (errors.phone) fieldErrors.phone = errors.phone;
      if (errors.email) fieldErrors.email = errors.email;
      
      setFieldErrors(fieldErrors);

      // Show general validation error as toast
      if (!errors.phone && !errors.email && errors._errors) {
        toast.error("Please fill the form");
      }
      return;
    }

    setLoading(true);

    try {
      // Prepare payload based on what user provided
      const payload = {
        userType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // Add phone or email based on what's provided
      if (phone) {
        payload.phone = phone;
      }
      if (email) {
        payload.email = email;
      }

      const response = await authAPI.forgotPassword(payload);

      if (response.success) {
        // Save to localStorage as fallback
        localStorage.setItem(
          "forgotData",
          JSON.stringify({ 
            phone: phone || undefined, 
            email: email || undefined,
            userType 
          })
        );

        toast.success(response.message || "OTP sent successfully");

        // Navigate to verify OTP page
        navigate(getVerifyPath(), {
          state: {
            phone: phone || undefined,
            email: email || undefined,
            userType,
            context: "forgot",
          },
          replace: true,
        });
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Forgot password error:", err);
      const errorMessage = err.message || "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
        <p className="text-sm text-gray-500">
          Enter your phone number or email to receive a verification code
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number (optional)
          </label>
          <input
            type="text"
            className={`w-full border rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              // Clear field error when user starts typing
              if (fieldErrors.phone) {
                setFieldErrors(prev => ({...prev, phone: undefined}));
              }
            }}
          />
          {fieldErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
          )}
        </div>

        <div className="p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (optional)
          </label>
          <input
            type="email"
            className={`w-full border rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              fieldErrors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Clear field error when user starts typing
              if (fieldErrors.email) {
                setFieldErrors(prev => ({...prev, email: undefined}));
              }
            }}
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div className="p-5">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-700 text-white p-3 rounded font-medium ${
              loading 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-blue-800 transition-colors"
            }`}
          >
            {loading ? "Sending Verification Code..." : "Send Verification Code"}
          </button>
        </div>

        <div className="text-center">
          <Link
            to={getLoginPath()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgetPassword;