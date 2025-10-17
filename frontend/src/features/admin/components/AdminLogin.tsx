/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { loginStart, loginSuccess, loginFailure, getSafeApplicationStatus, type User } from "../../../store/slices/authSlice";
import { authAPI } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import BaseLogin from "../../../components/reusable/BaseLogin";
import { validateSchema, loginSchema } from "../../../validation";

const AdminLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogin = async (credentials: any) => {
    dispatch(loginStart());
    
    try {
      const res = await authAPI.login(credentials);
      
      if (res.success && res.user && res.token) {
        const userData: User = {
          _id: res.user._id,
          fullName: res.user.fullName,
          phone: res.user.phone || "",
          email: res.user.email || "",
          role: res.user.role,
          applicationStatus: getSafeApplicationStatus(res.user.applicationStatus),
          isVerified: res.user.isVerified || false,
        };
        dispatch(loginSuccess({
          user: userData,
          token: res.token,
        }));

        // Admin-specific redirect logic
        setTimeout(() => navigate("/admin/dashboard"), 1000);

        return { success: true, message: res.message };
      } else {
        dispatch(loginFailure(res.message));
        return { success: false, message: res.message };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    }
  };

  const customValidation = (data: { identifier: string; password: string }) => {
    const validation = validateSchema(loginSchema, {
      ...data,
      userType: "admin",
    });
    
    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseLogin
      userType="admin"
      onSubmit={handleLogin}
      loading={loading}
      customValidation={customValidation}
      showGoogleAuth={false}
      showSignupLink={false}
      title="Admin Login"
      subtitle="Access the admin dashboard"
      forgotPasswordLink="/admin/forgot-password"
    />
  );
};

export default AdminLogin;