/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseSignUp from "../../../components/reusable/BaseSignup";
import { authAPI } from "../../../services/authApi";
import { validateSchema, signupSchema } from "../../../validation";

const TechnicianSignUp: React.FC = () => {
    const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (data: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    userType: "user" | "serviceProvider";
  }) => {
    setLoading(true);
    try {
      const response = await authAPI.signup(data);
      
      if (response.success) {
        localStorage.setItem(
          "signupData",
          JSON.stringify({
            ...data,
            userType: "serviceProvider",
          })
        );

        // Navigate to technician OTP verification
        navigate("/technicians/verify-otp", {
          state: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            userType: "serviceProvider",
          },
          replace: true,
        });

        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message, error: response.error };
      }
    } catch (error: any) {
      console.error("Technician signup error:", error);
      const errorMessage = error?.message || "Sign up failed - Unexpected error";
      return { success: false, message: errorMessage, error };
    } finally {
        setLoading(false);
    }
  };


  const customValidation = (data: any) => {
    const validation = validateSchema(signupSchema, {
      ...data,
      userType: "serviceProvider",
    });
    
    return {
      isValid: validation.success,
      errors: validation.errors || {
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      },
    };
  };

  return (
    <BaseSignUp
      userType="serviceProvider"
      onSubmit={handleSignUp}
      loading={loading}
      customValidation={customValidation}
      title="Join as Technician"
      subtitle="Start your service business with LocalFix"
      loginLink="/technicians/login"
    />
  );
};

export default TechnicianSignUp;