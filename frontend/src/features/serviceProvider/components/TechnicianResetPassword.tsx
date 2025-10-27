import React from "react";
import { useNavigate } from "react-router-dom";
import BaseNewPassword from "../../../components/reusable/BaseNewPassword";
import { type ResetPasswordData } from "../../../services/common/authApi";
import { validateSchema, newPasswordSchema } from "../../../validation";
import { TechnicianAuthService } from "../../../services/technician/technicianAuthService";

interface TechnicianResetPasswordProps {
  phone?: string;
  email?: string;
  otp?: string;
  token?: string;
}

interface FormData {
  password: string;
  confirmPassword: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

const TechnicianResetPassword: React.FC<TechnicianResetPasswordProps> = ({
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
        userType: "serviceProvider",
        ...(phone && { phone }),
        ...(email && { email }),
        ...(otp && { otp }),
        ...(token && { token }),
      };

      const response = await TechnicianAuthService.resetPassword(payload);

      if (response.success) {
        localStorage.removeItem("forgotData");
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      console.error("Technician reset password error:", error);
      return { success: false, message: "Reset password failed" };
    }
  };

  const handleSuccess = () => {
    setTimeout(() => {
      navigate("/technicians/login", { replace: true });
    }, 1000);
  };
  
  const customValidation = (data: FormData): ValidationResult => {
    const validation = validateSchema(newPasswordSchema, {
      ...data,
      userType: "serviceProvider",
    });

    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseNewPassword
      userType="serviceProvider"
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      customValidation={customValidation}
      title="Reset Your Technician Password"
      subtitle="Create a new password for your technician account"
      submitButtonText="Reset Password"
    />
  );
};

export default TechnicianResetPassword;
