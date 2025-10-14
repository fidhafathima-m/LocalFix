/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  type User,
} from "../../store/slices/authSlice";
import { authAPI, type LoginCredentials } from "../../services/authApi";
import toast from "react-hot-toast";
import GoogleAuth from "../../features/user/components/GoogleAuth";
import { loginSchema, validateSchema } from "../../validation";

type UserType = "user" | "serviceProvider" | "admin";

interface LoginProps {
  userType: UserType;
}

const Login: React.FC<LoginProps> = ({ userType }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const validation = validateSchema(loginSchema, {
      identifier,
      password,
      userType,
    });

    if (!validation.success && validation.errors) {
      setIdentifierError(validation.errors.identifier || "");
      setPasswordError(validation.errors.password || "");
      return false;
    }

    setIdentifierError("");
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(loginStart());

    try {
      const credentials: LoginCredentials = {
        identifier,
        password,
        role: userType,
      };

      const res = await authAPI.login(credentials);

      if (res.success && res.user && res.token) {
        const userData = {
          ...res.user,
          applicationStatus: res.user.applicationStatus || "not-applied",
        };

        dispatch(
          loginSuccess({
            user: userData as User,
            token: res.token,
          })
        );

        toast.success(res.message || "Login successful!");

        // Redirect logic
        setTimeout(() => {
          if (userType === "serviceProvider") {
            if (
              userData.applicationStatus === "submitted" ||
              userData.applicationStatus === "under_review"
            ) {
              navigate("/pending-technician/dashboard");
            } else if (userData.applicationStatus === "approved") {
              navigate("/technician/dashboard");
            } else if (userData.applicationStatus === "rejected") {
              navigate("/pending-technician/dashboard");
            } else if (userData.applicationStatus === "draft") {
              navigate("/technician/apply");
            } else {
              navigate("/technicians");
            }
          } else if (userType === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        const errorMessage = res.message || "Login failed. Please try again.";
        dispatch(loginFailure(errorMessage));
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Login catch error:", error);

      let errorMessage = "Login failed. Please try again.";

      // Handle network errors or unexpected errors
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid credentials";
      } else if (error.response?.status === 404) {
        errorMessage = "User not found";
      } else if (error.message === "Network Error") {
        errorMessage = "Network connection failed. Please check your internet.";
      }

      dispatch(loginFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  const getTitle = () => {
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
  }

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold">{getTitle()}</h1>
        <p className="text-sm text-gray-500">
          Welcome back! Please log in to continue.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Email or Phone</label>
          <div className="flex items-center border rounded overflow-hidden">
            <input
              type="text"
              placeholder="Enter email or phone (with no country code)"
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
          
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
          <Link
            to={
              userType === "serviceProvider"
                ? "/technicians/forgot-password"
                : userType === "admin"
                ? "/admin/forgot-password"
                : "/forgot-password"
            }
            className="text-xs text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
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

      {(userType === "user" || userType === "serviceProvider") && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Or continue with</p>
          <div className="flex justify-center gap-4 mt-2">
            <GoogleAuth userType={userType} />
          </div>
        </div>
      )}

      {(userType === "user" || userType === "serviceProvider") && (
        <div className="text-center p-3">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link
              to={
                userType === "serviceProvider"
                  ? "/technicians/signup"
                  : "/signup"
              }
              className="text-[#1877F2]"
            >
              Sign Up
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;
