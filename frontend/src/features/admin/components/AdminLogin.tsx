/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  getSafeApplicationStatus,
  type User,
} from "../../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import BaseLogin from "../../../components/reusable/BaseLogin";
import { validateSchema, loginSchema } from "../../../validation";
import { AdminAuthService } from "../../../services/admin/AdminAuthService";

const AdminLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleLogin = async (credentials: any) => {
    dispatch(loginStart());

    try {
      const res = await AdminAuthService.login(credentials);

      if (res.success) {
        const userDataFromResponse = res.data?.user || res.user;
        const accessToken = res.data?.accessToken || res.accessToken;
        const refreshToken = res.data?.refreshToken || res.refreshToken;

        if (!userDataFromResponse || !accessToken) {
          console.error("dminLogin - Missing user data or token:", {
            userDataFromResponse,
            accessToken,
            refreshToken,
          });
          throw new Error("Invalid response: missing user data or token");
        }

        const userData: User = {
          _id: userDataFromResponse._id,
          fullName: userDataFromResponse.fullName,
          phone: userDataFromResponse.phone || "",
          email: userDataFromResponse.email || "",
          roles: userDataFromResponse.roles,
          applicationStatus: getSafeApplicationStatus(
            userDataFromResponse.applicationStatus
          ),
          isVerified: userDataFromResponse.isVerified || false,
        };

        dispatch(
          loginSuccess({
            user: userData,
            accessToken,
            refreshToken: refreshToken || "",
          })
        );

        const result = {
          success: true,
          message: res.message || "Login successful",
          redirectPath: "/admin/dashboard",
        };

        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 500);

        return result;
      } else {
        const errorMessage = res.message || "Login failed";
        console.error("AdminLogin - Login failed:", errorMessage);
        dispatch(loginFailure(errorMessage));
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (error: any) {
      console.error("AdminLogin - Error:", error);
      const errorMessage = error.message || "Login failed";
      dispatch(loginFailure(errorMessage));
      return {
        success: false,
        message: errorMessage,
      };
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
