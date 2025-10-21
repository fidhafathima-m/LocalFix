import React from "react";
import { useNavigate } from "react-router-dom";
import BaseNewPassword from "../../../components/reusable/BaseNewPassword";
import { type ResetPasswordData } from "../../../services/common/authApi";
import { validateSchema, newPasswordSchema } from "../../../validation";
import { UserAuthService } from "../../../services/user/userAuthService";

interface UserResetPasswordProps {
  phone?: string;
  email?: string;
  otp?: string;
  token?: string;
}

const UserResetPassword: React.FC<UserResetPasswordProps> = ({
  phone,
  email,
  otp,
  token,
}) => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: {
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const payload: ResetPasswordData = {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: "user",
        ...(phone && { phone }),
        ...(email && { email }),
        ...(otp && { otp }),
        ...(token && { token }),
      };

      const response = await UserAuthService.resetPassword(payload);

      if (response.success) {
        localStorage.removeItem("forgotData");
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      console.error("User reset password error:", error);
      return { success: false, message: "Reset password failed" };
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customValidation = (data: any) => {
    const validation = validateSchema(newPasswordSchema, {
      ...data,
      userType: "user",
    });

    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseNewPassword
      userType="user"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      customValidation={customValidation}
      title="Reset Your Password"
      subtitle="Create a new password for your account"
      submitButtonText="Reset Password"
    />
  );
};

export default UserResetPassword;
