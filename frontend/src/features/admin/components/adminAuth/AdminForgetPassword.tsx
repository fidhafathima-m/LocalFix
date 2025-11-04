import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseForgetPassword, { 
  type ForgetPasswordFormData as BaseForgetPasswordFormData,
  type ForgetPasswordErrors 
} from "../../../../components/reusable/BaseForgetPassword";
import { validateSchema, forgotPasswordSchema } from "../../../../validation";
import { AdminAuthService } from "../../../../services/admin/AdminAuthService";

interface ApiResponse {
  success: boolean;
  message: string;
}

interface ValidationData extends BaseForgetPasswordFormData {
  userType?: "user" | "serviceProvider" | "admin";
}

const AdminForgetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    phone?: string;
    email?: string;
    userType: "user" | "serviceProvider" | "admin";
  }): Promise<ApiResponse> => {
    setLoading(true);
    try {
      const response = await AdminAuthService.forgetPassword(data);

      if (response.success) {
        localStorage.setItem(
          "forgotData",
          JSON.stringify({
            phone: data.phone,
            email: data.email,
            userType: "admin",
          })
        );

        navigate("/admin/verify-otp", {
          state: {
            phone: data.phone,
            email: data.email,
            userType: "admin",
            context: "forgot",
          },
          replace: true,
        });

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      console.error("Admin forgot password error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP";
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const customValidation = (data: BaseForgetPasswordFormData): {
    isValid: boolean;
    errors: ForgetPasswordErrors;
  } => {
    const validationData: ValidationData = {
      ...data,
      userType: "admin",
    };

    const validation = validateSchema(forgotPasswordSchema, validationData);

    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseForgetPassword
      userType="admin"
      onSubmit={handleSubmit}
      loading={loading}
      customValidation={customValidation}
      title="Admin Forgot Password"
      subtitle="Enter your phone number or email to reset your password"
      loginLink="/admin/login"
      showLoginLink={false}
    />
  );
};

export default AdminForgetPassword;