/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { loginStart, loginSuccess, loginFailure, getSafeApplicationStatus, type User } from "../../../store/slices/authSlice";
import { authAPI } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import BaseLogin from "../../../components/reusable/BaseLogin";
import { validateSchema, loginSchema } from "../../../validation";

const TechnicianLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogin = async (credentials: any) => {
    dispatch(loginStart());
    
    try {
      const res = await authAPI.login(credentials);
      
      if (res.success && res.user && res.token) {
        // FIX: Check if user has serviceProvider role in their roles array
        const hasServiceProviderRole = res.user.roles?.includes("serviceProvider");
        
        if (!hasServiceProviderRole) {
          throw new Error("This account is not registered as a service provider");
        }

        const userData: User = {
          _id: res.user._id,
          fullName: res.user.fullName,
          phone: res.user.phone || "",
          email: res.user.email || "",
          role: "serviceProvider", // Use the primary role for backward compatibility
          applicationStatus: getSafeApplicationStatus(res.user.applicationStatus),
          isVerified: res.user.isVerified || false,
        };

        dispatch(loginSuccess({
          user: userData,
          token: res.token,
        }));

        // KEEP ORIGINAL REDIRECTION LOGIC - DON'T CHANGE PATHS
        setTimeout(() => {
          if (userData.applicationStatus === "submitted" || userData.applicationStatus === "under_review") {
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
        }, 1000);

        return { success: true, message: res.message };
      } else {
        dispatch(loginFailure(res.message));
        return { success: false, message: res.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    }
  };

  const customValidation = (data: { identifier: string; password: string }) => {
    const validation = validateSchema(loginSchema, {
      ...data,
      userType: "serviceProvider",
    });
    
    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseLogin
      userType="serviceProvider"
      onSubmit={handleLogin}
      loading={loading}
      customValidation={customValidation}
      title="Technician Login"
      subtitle="Access your technician account"
      signupLink="/technicians/signup"
      forgotPasswordLink="/technicians/forgot-password"
    />
  );
};

export default TechnicianLogin;