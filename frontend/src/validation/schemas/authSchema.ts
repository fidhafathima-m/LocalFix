/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

// Common schemas with enhanced validation

// Full name validation - more strict
export const fullNameSchema = z
  .string()
  .min(1, "Full name is required")
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name is too long")
  .regex(
    /^[A-Za-z\s\u00C0-\u024F\u1E00-\u1EFF\-'.]+$/,
    "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
  )
  .refine(
    (name) => {
      const trimmed = name.trim();
      const parts = trimmed.split(/\s+/);
      // Check if we have at least 2 parts with at least 2 letters each
      if (parts.length < 2) return false;

      // Check each part has at least 2 letters (excluding apostrophes, hyphens)
      return parts.every((part) => {
        const lettersOnly = part.replace(/[^A-Za-z]/g, "");
        return lettersOnly.length >= 2;
      });
    },
    {
      message:
        "Please enter a valid full name with at least first and last name",
    }
  );

export const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\d{10}$/, "Please enter a valid 10-digit phone number")
  .transform((phone) => phone.replace(/\D/g, ""));

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .transform((email) => email.toLowerCase().trim());

export const dateOfBirthSchema = z
  .string()
  .optional()
  .refine((dob) => {
    if (!dob || dob === "Not set") return true;
    const date = new Date(dob);
    return !isNaN(date.getTime());
  }, "Please enter a valid date")
  .refine(
    (dob) => {
      if (!dob || dob === "Not set") return true;
      const date = new Date(dob);
      const today = new Date();
      const minDate = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate()
      );
      const maxDate = new Date(
        today.getFullYear() - 15,
        today.getMonth(),
        today.getDate()
      );
      return date >= minDate && date <= maxDate;
    },
    {
      message: "You must be between 15 and 100 years old",
    }
  );

export const genderSchema = z
  .string()
  .optional()
  .refine(
    (gender) =>
      !gender ||
      [
        "Male",
        "Female",
        "Other",
        "Prefer not to say",
        "Not specified",
      ].includes(gender),
    "Please select a valid gender option"
  )
  .default("Not specified");

// Personal Info Update Schema
export const personalInfoUpdateSchema = z.object({
  fullName: fullNameSchema,
  phoneNumber: phoneNumberSchema,
  email: emailSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
});

export type PersonalInfoUpdateData = z.infer<typeof personalInfoUpdateSchema>;

// Enhanced password validation
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(50, "Password must be less than 50 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character (!@#$%^&* etc.)"
  )
  .refine(
    (password) => !/(.)\1\1/.test(password),
    "Password cannot contain 3 or more consecutive identical characters"
  );

export const confirmPasswordSchema = z.string();

// Main schemas with enhanced validation
export const signupSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    userType: z.enum(["user", "serviceProvider"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Enter email")
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    }, "Enter valid email"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["user", "serviceProvider", "admin"]),
});

export const forgotPasswordSchema = z
  .object({
    email: emailSchema,
    userType: z.enum(["user", "serviceProvider", "admin"]),
  })
  .refine((data) => data.email, {
    message: "Please enter email",
    path: ["_errors"],
  });

export const otpSchema = z.object({
  otp: z.string().length(6, "Please enter a valid 6-digit OTP"),
  userType: z.enum(["user", "serviceProvider", "admin"]),
  context: z.enum(["signup", "forgot"]),
  email: emailSchema,
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    userType: z.enum(["user", "serviceProvider", "admin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // Check for common password patterns
      const commonPasswords = [
        "password",
        "12345678",
        "qwerty123",
        "admin123",
        "letmein",
      ];
      return !commonPasswords.includes(data.newPassword.toLowerCase());
    },
    {
      message: "Password is too common, please choose a stronger password",
      path: ["newPassword"],
    }
  );

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// Export types
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type OTPFormData = z.infer<typeof otpSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

// Helper function for form validation
export const validateSignupForm = (data: any) => {
  try {
    // Transform data to match schema structure
    const formData = {
      fullName: data.fullName || "",
      email: data.email || "",
      password: data.password || "",
      confirmPassword: data.confirmPassword || "",
      userType: data.userType || "user",
    };

    signupSchema.parse(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _error: "Validation failed" } };
  }
};

export const validatePersonalInfo = (data: any) => {
  try {
    const validatedData = personalInfoUpdateSchema.parse(data);
    return { isValid: true, data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, data: null, errors };
    }
    return {
      isValid: false,
      data: null,
      errors: { _error: "Validation failed" },
    };
  }
};

// Password strength checker (optional)
export const checkPasswordStrength = (
  password: string
): {
  score: number;
  strength: "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";
} => {
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character variety
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // Penalties for weak patterns
  if (/(.)\1\1/.test(password)) score -= 1;

  score = Math.max(0, Math.min(5, score));

  const strengths = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  return {
    score,
    strength: strengths[score] as
      | "Weak"
      | "Fair"
      | "Good"
      | "Strong"
      | "Very Strong",
  };
};

export const validateChangePassword = (data: any) => {
  try {
    changePasswordSchema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _error: "Validation failed" } };
  }
};
