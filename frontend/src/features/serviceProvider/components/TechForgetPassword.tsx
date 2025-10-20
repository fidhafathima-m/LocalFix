/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseForgetPassword from "../../../components/reusable/BaseForgetPassword";
import { validateSchema, forgotPasswordSchema } from "../../../validation";
import { TechnicianAuthService } from "../../../services/technician/technicianAuthService";

const TechnicianForgetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    phone?: string;
    email?: string;
    userType: "user" | "serviceProvider" | "admin";
  }) => {
    setLoading(true);
    try {
      const response = await TechnicianAuthService.forgotPassword(data)

      if (response.success) {
        localStorage.setItem(
          "forgotData",
          JSON.stringify({ 
            phone: data.phone, 
            email: data.email,
            userType: "serviceProvider"
          })
        );

        navigate("/technicians/forgot-verify-otp", {
          state: {
            phone: data.phone,
            email: data.email,
            userType: "serviceProvider",
            context: "forgot",
          },
          replace: true,
        });

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error("Technician forgot password error:", error);
      const errorMessage = error.message || "Failed to send OTP";
      return { success: false, message: errorMessage, error };
    } finally {
      setLoading(false);
    }
  };

  const customValidation = (data: any) => {
    const validation = validateSchema(forgotPasswordSchema, {
      ...data,
      userType: "serviceProvider",
    });
    
    return {
      isValid: validation.success,
      errors: validation.errors || {},
    };
  };

  return (
    <BaseForgetPassword
      userType="serviceProvider"
      onSubmit={handleSubmit}
      loading={loading}
      customValidation={customValidation}
      title="Technician Forgot Password"
      subtitle="Enter your phone number or email to reset your password"
      loginLink="/technicians/login"
    />
  );
};

export default TechnicianForgetPassword;