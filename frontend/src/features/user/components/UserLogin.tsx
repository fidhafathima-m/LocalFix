/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { loginStart, loginSuccess, loginFailure, getSafeApplicationStatus, type User } from "../../../store/slices/authSlice";
import { authAPI } from "../../../services/authApi";
import { useNavigate } from "react-router-dom";
import BaseLogin from "../../../components/reusable/BaseLogin";
import { validateSchema, loginSchema } from "../../../validation";

const UserLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogin = async (credentials: any) => {
    dispatch(loginStart());
    
    try {
      const res = await authAPI.login(credentials);
      
      const userDataFromResponse = res.data?.user || res.user;
      const accessToken = res.data?.accessToken || res.accessToken;
      const refreshToken = res.data?.refreshToken || res.refreshToken;
      
      if (res.success && userDataFromResponse && accessToken && refreshToken) {
        const userData: User = {
          _id: userDataFromResponse._id,
          fullName: userDataFromResponse.fullName,
          phone: userDataFromResponse.phone || "",
          email: userDataFromResponse.email || "",
          roles: userDataFromResponse.roles,
          applicationStatus: getSafeApplicationStatus(userDataFromResponse.applicationStatus),
          isVerified: userDataFromResponse.isVerified || false,
        };
        
        dispatch(loginSuccess({
          user: userData,
          accessToken: accessToken,
          refreshToken: refreshToken,
        }));
        
        setTimeout(() => navigate("/"), 1000);
        
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
      userType: "user",
    });
    
    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseLogin
      userType="user"
      onSubmit={handleLogin}
      loading={loading}
      customValidation={customValidation}
      title="User Login"
      subtitle="Welcome back! Please log in to continue."
    />
  );
};

export default UserLogin;