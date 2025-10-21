/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import GoogleAuth from "../../features/user/components/GoogleAuth";

interface LoginProps {
  userType: "user" | "serviceProvider" | "admin";
  onSubmit: (credentials: {
    identifier: string;
    password: string;
    role: string;
  }) => Promise<{ success: boolean; message?: string }>;
  onSuccess?: (userData: any) => void;
  onFailure?: (error: string) => void;
  loading?: boolean;
  showGoogleAuth?: boolean;
  showSignupLink?: boolean;
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  signupLink?: string;
  title?: string;
  subtitle?: string;
  customValidation?: (data: { identifier: string; password: string }) => {
    isValid: boolean;
    errors: { identifier?: string; password?: string };
  };
}

const BaseLogin: React.FC<LoginProps> = ({
  userType,
  onSubmit,
  onSuccess,
  onFailure,
  loading = false,
  showGoogleAuth = true,
  showSignupLink = true,
  showForgotPassword = true,
  forgotPasswordLink,
  signupLink,
  title,
  subtitle,
  customValidation,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Default validation that can be overridden
  const defaultValidateForm = (): boolean => {
    if (!identifier.trim()) {
      setIdentifierError("Email or phone is required");
      return false;
    }
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setIdentifierError("");
    setPasswordError("");
    return true;
  };

  const validateForm = (): boolean => {
    if (customValidation) {
      const validation = customValidation({ identifier, password });
      setIdentifierError(validation.errors.identifier || "");
      setPasswordError(validation.errors.password || "");
      return validation.isValid;
    }
    return defaultValidateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await onSubmit({
        identifier,
        password,
        role: userType,
      });

      if (result.success) {
        toast.success(result.message || "Login successful!");
        onSuccess?.(result);
      } else {
        const errorMessage = result.message || "Login failed. Please try again.";
        toast.error(errorMessage, { duration: 5000 });
        onFailure?.(errorMessage);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      onFailure?.(errorMessage);
    }
  };

  const getDefaultTitle = () => {
    switch (userType) {
      case "admin":
        return "Admin Login";
      case "serviceProvider":
        return "Technician Login";
      default:
        return "User Login";
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold">{title || getDefaultTitle()}</h1>
        <p className="text-sm text-gray-500">
          {subtitle || "Welcome back! Please log in to continue."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Email or Phone</label>
          <div className="flex items-center border rounded overflow-hidden">
            <input
              type="text"
              placeholder="Enter email or phone"
              className="flex-1 p-2 text-sm outline-none"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          {identifierError && (
            <p className="text-sm text-red-500 mt-1">{identifierError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="******"
              className="w-full border p-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
              onClick={togglePassword}
            >
              {/* Password visibility icons */}
            </button>
          </div>
          
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
          
          {showForgotPassword && (
            <Link
              to={forgotPasswordLink || getDefaultForgotPasswordLink()}
              className="text-xs text-blue-500 hover:underline"
            >
              Forgot Password?
            </Link>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded cursor-pointer ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Continue"}
        </button>
      </form>

      {showGoogleAuth && (userType === "user" || userType === "serviceProvider") && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Or continue with</p>
          <div className="flex justify-center gap-4 mt-2">
            <GoogleAuth userType={userType} />
          </div>
        </div>
      )}

      {showSignupLink && (userType === "user" || userType === "serviceProvider") && (
        <div className="text-center p-3">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link
              to={signupLink || getDefaultSignupLink()}
              className="text-[#1877F2]"
            >
              Sign Up
            </Link>
          </p>
        </div>
      )}
    </div>
  );

  function getDefaultForgotPasswordLink(): string {
    switch (userType) {
      case "serviceProvider":
        return "/technicians/forgot-password";
      case "admin":
        return "/admin/forgot-password";
      default:
        return "/forgot-password";
    }
  }

  function getDefaultSignupLink(): string {
    return userType === "serviceProvider" ? "/technicians/signup" : "/signup";
  }
};

export default BaseLogin;