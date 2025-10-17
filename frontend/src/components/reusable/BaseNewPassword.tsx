/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

export type UserType = "user" | "serviceProvider" | "admin";

export interface NewPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface NewPasswordErrors {
  password?: string;
  confirmPassword?: string;
}

export interface BaseNewPasswordProps {
  userType: UserType;
  onSubmit: (data: NewPasswordFormData) => Promise<{ success: boolean; message?: string; error?: any }> | void;
  onSuccess?: (data: NewPasswordFormData) => void;
  onFailure?: (error: string) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  submitButtonText?: string;
  showPasswordRequirements?: boolean;
  customValidation?: (data: NewPasswordFormData) => {
    isValid: boolean;
    errors: NewPasswordErrors;
  };
}

const BaseNewPassword: React.FC<BaseNewPasswordProps> = ({
  userType,
  onSubmit,
  onSuccess,
  onFailure,
  loading: externalLoading = false,
  title,
  subtitle,
  submitButtonText = "Reset Password",
  showPasswordRequirements = true,
  customValidation,
}) => {
  const [formData, setFormData] = useState<NewPasswordFormData>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [internalLoading, setInternalLoading] = useState(false);

  // Use external loading if provided, otherwise use internal loading
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Default validation
  const defaultValidateForm = (): boolean => {
    const newErrors: NewPasswordErrors = {};
    let isValid = true;

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
        return "User Create New Password";
      case "serviceProvider":
        return "Technician Create New Password";
      case "admin":
        return "Admin Create New Password";
      default:
        return "Create New Password";
    }
  };

  const getDefaultSubtitle = () => {
    return "Please create a new password for your account";
  };

  const handleChange = (field: keyof NewPasswordFormData, value: string) => {
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
      return;
    }

    // Set loading state if using internal loading
    if (externalLoading === undefined) {
      setInternalLoading(true);
    }

    try {
      const result = await onSubmit(formData);

      if (result?.success) {
        onSuccess?.(formData);
      } else if (result && !result.success) {
        const errorMessage = result.message || "Password reset failed";
        setErrors({ password: errorMessage });
        onFailure?.(errorMessage);
      } else {
        // If onSubmit doesn't return a result (void), assume success
        onSuccess?.(formData);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      const errorMessage = error.message || "Password reset failed";
      setErrors({ password: errorMessage });
      onFailure?.(errorMessage);
    } finally {
      // Reset loading state if using internal loading
      if (externalLoading === undefined) {
        setInternalLoading(false);
      }
    }
  };

  const getGeneralError = () => {
    return errors.password || errors.confirmPassword;
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold p-5">{title || getDefaultTitle()}</h1>
        <p className="text-sm text-gray-500">
          {subtitle || getDefaultSubtitle()}
        </p>
      </div>

      {/* Password Requirements */}
      {showPasswordRequirements && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600 font-medium mb-2">Password Requirements:</p>
          <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
            <li>At least 6 characters long</li>
            <li>Should match in both fields</li>
          </ul>
        </div>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.password ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.confirmPassword ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        
        {getGeneralError() && !errors.password && !errors.confirmPassword && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 text-center">{getGeneralError()}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-700 text-white p-3 rounded font-medium transition-colors ${
            isLoading 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-blue-800 cursor-pointer"
          }`}
        >
          {isLoading ? "Resetting Password..." : submitButtonText}
        </button>
      </form>
    </div>
  );
};

export default BaseNewPassword;