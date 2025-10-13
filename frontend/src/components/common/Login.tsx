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

      console.log("🔍 Sending login request...");
      const res = await authAPI.login(credentials);
      console.log("🔍 Login API response:", res);

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
        console.log("❌ Login failed with message:", res.message);
        const errorMessage = res.message || "Login failed. Please try again.";
        dispatch(loginFailure(errorMessage));
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("🔍 Login catch error:", error);

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
          <input
            type="password"
            placeholder="******"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
