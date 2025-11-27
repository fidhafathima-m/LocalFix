import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import GoogleAuth from "../../features/user/components/userAuth/GoogleAuth";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";

export interface SignUpFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface SignUpErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

interface BaseSignUpProps {
  userType?: "user" | "serviceProvider";
  onSubmit: (data: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    userType: "user" | "serviceProvider";
  }) => Promise<{ success: boolean; message?: string; error?: unknown }>;
  onSuccess?: (data: SignUpFormData) => void;
  onFailure?: (error: string) => void;
  loading?: boolean;
  showGoogleAuth?: boolean;
  showLoginLink?: boolean;
  loginLink?: string;
  title?: string;
  subtitle?: string;
  customValidation?: (data: SignUpFormData) => {
    isValid: boolean;
    errors: SignUpErrors;
  };
}

const BaseSignUp: React.FC<BaseSignUpProps> = ({
  userType = "user",
  onSubmit,
  onSuccess,
  onFailure,
  loading = false,
  showGoogleAuth = true,
  showLoginLink = true,
  loginLink,
  title,
  subtitle,
  customValidation,
}) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<SignUpErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UPDATED VALIDATION - Make email and phone optional (at least one required)
  const defaultValidateForm = (): boolean => {
    const newErrors: SignUpErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    // Check if at least one of email or phone is provided
    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = "Email or phone number is required";
      newErrors.phone = "Email or phone number is required";
      isValid = false;
    }

    // Validate email format only if email is provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Validate phone format only if phone is provided
    if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Only send the fields that have values
      const submitData = {
        fullName: formData.fullName,
        email: formData.email.trim() || undefined, // Send undefined if empty
        phone: formData.phone.trim() || undefined, // Send undefined if empty
        password: formData.password,
        userType: userType,
      };

      const result = await onSubmit(submitData);

      if (result.success) {
        toast.success(result.message || "Sign up successful!");
        onSuccess?.(formData);
      } else {
        const errorMessage = result.message || "Sign up failed";
        toast.error(errorMessage);
        onFailure?.(errorMessage);
      }
    } catch (error: unknown) {
      console.error("Signup error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Sign up failed";
      toast.error(errorMessage);
      onFailure?.(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getDefaultTitle = () => {
    return userType === "serviceProvider"
      ? "Join as Service Provider"
      : "Create Your Account";
  };

  const getDefaultSubtitle = () => {
    return userType === "serviceProvider"
      ? "Start your service business with LocalFix"
      : "Join LocalFix to get your appliances fixed by local experts";
  };

  const getDefaultLoginLink = () => {
    return userType === "serviceProvider" ? "/technicians/login" : "/login";
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold">{title || getDefaultTitle()}</h1>
        <p className="text-sm text-gray-500">
          {subtitle || getDefaultSubtitle()}
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            placeholder="Eg: John Doe"
            className="w-full border p-2 rounded"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="text"
            name="email"
            placeholder="Eg: jondoe@gmail.com"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Phone Number</label>
          <input
            type="text"
            name="phone"
            placeholder="Eg: 9876543210"
            className="w-full border p-2 rounded"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        <div className="text-xs text-gray-500 -mt-2">
          * Provide at least one of email or phone number
        </div>

        <div>
          <label className="block text-sm mb-1">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="******"
              className="w-full border p-2 rounded pr-10"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <VisibilityOffOutlined />
              ) : (
                <VisibilityOutlined />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm Password *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="******"
              className="w-full border p-2 rounded pr-10"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? (
                <VisibilityOffOutlined />
              ) : (
                <VisibilityOutlined />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded transition-colors ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-700 cursor-pointer"
          }`}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Social login */}
      {showGoogleAuth && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Or continue with</p>
          <div className="flex justify-center gap-4 mt-2">
            <GoogleAuth userType={userType} />
          </div>
        </div>
      )}

      {showLoginLink && (
        <div className="text-center p-3">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              to={loginLink || getDefaultLoginLink()}
              className="text-[#1877F2] hover:text-[#1669D6]"
            >
              Login
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default BaseSignUp;
