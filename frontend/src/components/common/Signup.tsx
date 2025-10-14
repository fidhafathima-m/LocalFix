import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import GoogleAuth from "../../features/user/components/GoogleAuth";
import { authAPI } from "../../services/authApi"; 
import { signupSchema, validateSchema } from "../../validation";
// import FacebookAuth from '../components/FacebookAuth';

interface SignUpProps {
  userType?: "user" | "serviceProvider";
}

const SignUp: React.FC<SignUpProps> = ({ userType = "user" }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Validate form
  const validateForm = (): boolean => {
    const validation = validateSchema(signupSchema, {
      ...formData,
      userType,
    });
    if (!validation.success && validation.errors) {
      setError((prev) => ({
        ...prev,
        ...validation.errors,
      }));
      return false;
    }
    setError({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error[name as keyof typeof error]) {
      setError((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.signup({
        fullName: formData.fullName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        userType: userType,
      });

      if (response.success) {
        localStorage.setItem(
          "signupData",
          JSON.stringify({
            ...formData,
            userType: userType,
          })
        );

        toast.success(response.message || "OTP sent successfully");

        const otpRoute =
          userType === "serviceProvider" ? "/technicians/verify-otp" : "/otp";

        navigate(otpRoute, {
          state: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            userType: userType,
          },
          replace: true,
        });
      } else {
        toast.error(response.message || "Sign up failed");
        
        if (response.error) {
          console.error("Signup API error:", response.error);
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Signup error details:", error);
      
      // Handle unexpected errors
      const errorMessage = error?.message || "Sign up failed - Unexpected error";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getLoginPath = () => {
    return userType === "serviceProvider" ? "/technicians/login" : "/login";
  };

  return (
    <>
      <div className="max-w-md mx-auto p-6 shadow-md mt-10">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-semibold">Create Your Account</h1>
          {userType === "user" ? (
            <p className="text-sm text-gray-500">
              Join LocalFix to get your appliances fixed by local experts
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Join LocalFix to start your services
            </p>
          )}
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Eg: John Doe"
              className="w-full border p-2 rounded"
              value={formData.fullName}
              onChange={handleChange}
            />
            {error.fullName && (
              <p className="text-sm text-red-500 mt-1">{error.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">
              Phone Number (optional)
            </label>
            <div className="flex items-center border rounded overflow-hidden">
              <span className="px-4 py-2 bg-gray-200 text-sm border-r">
                +91
              </span>
              <input
                type="text"
                name="phone"
                placeholder="Eg: 9876543210"
                className="flex-1 p-2 text-sm outline-none"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {error.phone && (
              <p className="text-sm text-red-500 mt-1">{error.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Email (optional)</label>
            <input
              type="text"
              name="email"
              placeholder="Eg: jondoe@gmail.com"
              className="w-full border p-2 rounded"
              value={formData.email}
              onChange={handleChange}
            />
            {error.email && (
              <p className="text-sm text-red-500 mt-1">{error.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
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
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>
            {error.password && (
              <p className="text-sm text-red-500 mt-1">{error.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
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
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                )}
              </button>
            </div>
            {error.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {error.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded transition-colors ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Social login */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Or continue with</p>
          <div className="flex justify-center gap-4 mt-2">
            {/* <FacebookAuth/> */}
            <GoogleAuth userType={userType} />
          </div>
        </div>

        <div className="text-center p-3">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              to={getLoginPath()}
              className="text-[#1877F2] hover:text-[#1669D6]"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignUp;