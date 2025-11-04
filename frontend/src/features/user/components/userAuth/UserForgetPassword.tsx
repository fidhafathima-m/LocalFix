import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseForgetPassword, {
  type ForgetPasswordFormData,
} from "../../../../components/reusable/BaseForgetPassword";
import { validateSchema, forgotPasswordSchema } from "../../../../validation";
import { UserAuthService } from "../../../../services/user/userAuthService";

const UserForgetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    phone?: string;
    email?: string;
    userType: "user" | "serviceProvider" | "admin";
  }) => {
    setLoading(true);
    try {
      const response = await UserAuthService.forgotPassword(data);

      if (response.success) {
        // Save to localStorage as fallback
        localStorage.setItem(
          "forgotData",
          JSON.stringify({
            phone: data.phone,
            email: data.email,
            userType: "user",
          })
        );

        // Navigate to verify OTP page
        navigate("/verify-otp", {
          state: {
            phone: data.phone,
            email: data.email,
            userType: "user",
            context: "forgot",
          },
          replace: true,
        });

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send OTP";
      return { success: false, message: errorMessage, error };
    } finally {
      setLoading(false);
    }
  };


  const customValidation = (data: ForgetPasswordFormData) => {
    const validation = validateSchema(forgotPasswordSchema, {
      ...data,
      userType: "user",
    });

    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseForgetPassword
      userType="user"
      onSubmit={handleSubmit}
      loading={loading}
      customValidation={customValidation}
      title="User Forgot Password"
      subtitle="Enter your phone number or email to reset your password"
    />
  );
};

export default UserForgetPassword;
