import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseSignUp from "../../../components/reusable/BaseSignup";
import { validateSchema, signupSchema } from "../../../validation";
import type {
  SignUpFormData,
  SignUpErrors,
} from "../../../components/reusable/BaseSignup";
import { UserAuthService } from "../../../services/user/userAuthService";

const UserSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (data: {
    fullName: string;
    email?: string;
    phone?: string;
    password: string;
    userType: "user" | "serviceProvider";
  }) => {
    setLoading(true);
    try {
      const response = await UserAuthService.signup(data);

      if (response.success) {
        localStorage.setItem(
          "signupData",
          JSON.stringify({
            ...data,
            userType: "user",
          })
        );

        // Navigate to OTP verification
        navigate("/otp", {
          state: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            userType: "user",
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
    } catch (error: unknown) {
      console.error("Signup error details:", error);
      const errorMessage =
        error instanceof Error ? error?.message : "Sign up failed - Unexpected error";
      return { success: false, message: errorMessage, error };
    } finally {
      setLoading(false);
    }
  };

  const customValidation = (data: SignUpFormData) => {
    const validation = validateSchema(signupSchema, {
      ...data,
      userType: "user",
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
      userType="user"
      onSubmit={handleSignUp}
      loading={loading}
      customValidation={customValidation}
      title="Create Your Account"
      subtitle="Join LocalFix to get your appliances fixed by local experts"
    />
  );
};

export default UserSignUp;
