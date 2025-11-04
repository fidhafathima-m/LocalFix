import React from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  getSafeApplicationStatus,
  type User,
} from "../../../../store/slices/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import BaseLogin from "../../../../components/reusable/BaseLogin";
import { validateSchema, loginSchema } from "../../../../validation";
import { UserAuthService } from "../../../../services/user/userAuthService";
import type { LoginCredentials } from "../../../../services/common/authApi";

const UserLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = location.state?.from || "/";

  const handleLogin = async (credentials: LoginCredentials) => {
    dispatch(loginStart());

    try {
      const res = await UserAuthService.login(credentials);

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
          applicationStatus: getSafeApplicationStatus(
            userDataFromResponse.applicationStatus
          ),
          isVerified: userDataFromResponse.isVerified || false,
        };

        dispatch(
          loginSuccess({
            user: userData,
            accessToken: accessToken,
            refreshToken: refreshToken,
          })
        );

        // Redirect to the original URL instead of home
        setTimeout(() => navigate(from, { replace: true, state: location.state }), 1000);

        return { success: true, message: res.message };
      } else {
        dispatch(loginFailure(res.message));
        return { success: false, message: res.message };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error?.message : "Login failed";
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