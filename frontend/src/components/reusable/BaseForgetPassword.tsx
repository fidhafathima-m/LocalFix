/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export type UserType = "user" | "serviceProvider" | "admin";

export interface ForgetPasswordFormData {
  phone: string;
  email: string;
}

export interface ForgetPasswordErrors {
  phone?: string;
  email?: string;
}

export interface BaseForgetPasswordProps {
  userType: UserType;
  onSubmit: (data: {
    phone?: string;
    email?: string;
    userType: UserType;
  }) => Promise<{ success: boolean; message?: string; error?: any }>;
  onSuccess?: (data: ForgetPasswordFormData) => void;
  onFailure?: (error: string) => void;
  loading?: boolean;
  showLoginLink?: boolean;
  loginLink?: string;
  verifyLink?: string;
  title?: string;
  subtitle?: string;
  customValidation?: (data: ForgetPasswordFormData) => {
    isValid: boolean;
    errors: ForgetPasswordErrors;
  };
}

const BaseForgetPassword: React.FC<BaseForgetPasswordProps> = ({
  userType,
  onSubmit,
  onSuccess,
  onFailure,
  loading: externalLoading = false,
  showLoginLink = true,
  loginLink,
  title,
  subtitle,
  customValidation,
}) => {
  const [formData, setFormData] = useState<ForgetPasswordFormData>({
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<ForgetPasswordErrors>({});
  const [internalLoading, setInternalLoading] = useState(false);

  // Use external loading if provided, otherwise use internal loading
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Default validation
  const defaultValidateForm = (): boolean => {
    const newErrors: ForgetPasswordErrors = {};
    let isValid = true;

    // At least one field must be filled
    if (!formData.phone && !formData.email) {
      newErrors.phone = "Phone or email is required";
      newErrors.email = "Phone or email is required";
      isValid = false;
    }

    // Validate phone if provided
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    // Validate email if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateForm = (): boolean => {
    if (customValidation) {
      const validation = customValidation(formData);
      setErrors(validation.errors);
      return validation.isValid;
    }
    return defaultValidateForm();
  };

  const getDefaultTitle = () => {
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

  const getDefaultSubtitle = () => {
    return "Enter your phone number or email to receive a verification code";
  };

  const getDefaultLoginLink = () => {
    switch (userType) {
      case "serviceProvider":
        return "/technicians/login";
      case "admin":
        return "/admin/login";
      default:
        return "/login";
    }
  };

  const handleChange = (field: keyof ForgetPasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    if (!validateForm()) {
      toast.error("Please fill the form correctly");
      return;
    }

    // Set loading state if using internal loading
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }

    try {
      const result = await onSubmit({
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        userType,
      });

      if (result.success) {
        toast.success(result.message || "OTP sent successfully");
        onSuccess?.(formData);
      } else {
        const errorMessage = result.message || "Failed to send OTP";
        toast.error(errorMessage);
        onFailure?.(errorMessage);
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      const errorMessage = error.message || "Failed to send OTP";
      toast.error(errorMessage);
      onFailure?.(errorMessage);
    } finally {
      // Reset loading state if using internal loading
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold p-5">{title || getDefaultTitle()}</h1>
        <p className="text-sm text-gray-500">
          {subtitle || getDefaultSubtitle()}
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
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (optional)
          </label>
          <input
            type="email"
            className={`w-full border rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="p-5">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-700 text-white p-3 rounded font-medium ${
              isLoading 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-blue-800 transition-colors cursor-pointer"
            }`}
          >
            {isLoading ? "Sending Verification Code..." : "Send Verification Code"}
          </button>
        </div>

        {showLoginLink && (
          <div className="text-center">
            <Link
              to={loginLink || getDefaultLoginLink()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to login
            </Link>
          </div>
        )}
      </form>
    </div>
  );
};

export default BaseForgetPassword;