import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseSignUp from "../../../components/reusable/BaseSignup";
import { validateSchema, signupSchema } from "../../../validation";
import type {
  SignUpFormData,
  SignUpErrors,
} from "../../../components/reusable/BaseSignup";
import { TechnicianAuthService } from "../../../services/technician/technicianAuthService";

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
      const response = await TechnicianAuthService.signup(data);

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
        return {
          success: false,
          message: response.message,
          error: response.error,
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Technician signup error:", error);
      const errorMessage =
        error?.message || "Sign up failed - Unexpected error";
      return { success: false, message: errorMessage, error };
    } finally {
      setLoading(false);
    }
  };

  const customValidation = (data: SignUpFormData) => {
    const validation = validateSchema(signupSchema, {
      ...data,
      userType: "serviceProvider",
    });

    // Transform the validation errors to match SignUpErrors type
    const errors: SignUpErrors = {
      fullName: validation.errors?.fullName,
      email: validation.errors?.email,
      phone: validation.errors?.phone,
      password: validation.errors?.password,
      confirmPassword: validation.errors?.confirmPassword,
    };

    return {
      isValid: validation.success,
      errors: errors,
    };
  };

  return (
    <BaseSignUp
      userType="serviceProvider"
      onSubmit={handleSignUp}
      loading={loading}
      customValidation={customValidation}
      title="Join as Service Provider"
      subtitle="Start your service business with LocalFix"
      loginLink="/technicians/login"
    />
  );
};

export default TechnicianSignUp;
