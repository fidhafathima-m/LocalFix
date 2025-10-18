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
      
      // ✅ UPDATED: Extract tokens from new structure
      const userDataFromResponse = res.data?.user || res.user;
      const accessToken = res.data?.accessToken || res.accessToken;
      const refreshToken = res.data?.refreshToken || res.refreshToken;
      
      if (res.success && userDataFromResponse && accessToken && refreshToken) {
        // ✅ FIXED: Check if user has serviceProvider role in their roles array
        const hasServiceProviderRole = userDataFromResponse.roles?.includes("serviceProvider");
        
        if (!hasServiceProviderRole) {
          throw new Error("This account is not registered as a service provider");
        }

        // ✅ UPDATED: Create proper User object with roles array
        const userData: User = {
          _id: userDataFromResponse._id,
          fullName: userDataFromResponse.fullName,
          phone: userDataFromResponse.phone || "",
          email: userDataFromResponse.email || "",
          roles: userDataFromResponse.roles || [], // Use roles array
          applicationStatus: getSafeApplicationStatus(userDataFromResponse.applicationStatus),
          isVerified: userDataFromResponse.isVerified || false,
        };

        // ✅ UPDATED: Dispatch login success with both tokens
        dispatch(loginSuccess({
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken,
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