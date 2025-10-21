import React from "react";
import { useNavigate } from "react-router-dom";
import BaseNewPassword from "../../../components/reusable/BaseNewPassword";
import { type ResetPasswordData } from "../../../services/common/authApi";
import { validateSchema, newPasswordSchema } from "../../../validation";
import { AdminAuthService } from "../../../services/admin/AdminAuthService";

interface AdminResetPasswordProps {
  phone?: string;
  email?: string;
  otp?: string;
  token?: string;
}

const AdminResetPassword: React.FC<AdminResetPasswordProps> = ({
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
        userType: "admin",
        ...(phone && { phone }),
        ...(email && { email }),
        ...(otp && { otp }),
        ...(token && { token }),
      };

      const response = await AdminAuthService.resetPassword(payload);

      if (response.success) {
        localStorage.removeItem("forgotData");
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      console.error("Admin reset password error:", error);
      return { success: false, message: "Reset password failed" };
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate("/admin/login", { replace: true });
    }, 1000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customValidation = (data: any) => {
    const validation = validateSchema(newPasswordSchema, {
      ...data,
      userType: "admin",
    });

    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseNewPassword
      userType="admin"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      customValidation={customValidation}
      title="Reset Admin Password"
      subtitle="Create a new password for your admin account"
      submitButtonText="Reset Password"
      showPasswordRequirements={false}
    />
  );
};

export default AdminResetPassword;
