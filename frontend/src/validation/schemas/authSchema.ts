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

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .transform((email) => email.toLowerCase().trim());

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
  )
  .refine(
    (password) => !/(012|123|234|345|456|567|678|789|890)/.test(password),
    "Password cannot contain simple number sequences"
  )
  .refine(
    (password) =>
      !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
        password
      ),
    "Password cannot contain simple alphabetical sequences"
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
  })
  .refine(
    (data) => {
      // Check if password doesn't contain personal info
      const nameParts = data.fullName.toLowerCase().split(/\s+/);
      const emailLocalPart = data.email.split("@")[0].toLowerCase();

      return (
        !nameParts.some(
          (part) =>
            part.length > 2 && data.password.toLowerCase().includes(part)
        ) && !data.password.toLowerCase().includes(emailLocalPart)
      );
    },
    {
      message: "Password should not contain your name or email",
      path: ["password"],
    }
  );

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Enter email or phone")
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    }, "Enter valid email"),
  password: passwordSchema,
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
  if (/012|123|234|345|456|567|678|789|890/.test(password)) score -= 1;
  if (/password|123456|qwerty|admin/i.test(password)) score -= 2;

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
