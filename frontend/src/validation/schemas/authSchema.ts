import { z } from "zod";

// Common schemas
export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Enter valid phone number")
  .optional()
  .or(z.literal(""));

export const emailSchema = z
  .string()
  .email("Enter valid email")
  .optional()
  .or(z.literal(""));

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const confirmPasswordSchema = z.string();

// Main schemas
export const signupSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    userType: z.enum(["user", "serviceProvider"]).default("user"),
  })
  .refine((data) => data.phone || data.email, {
    message: "Enter phone or email",
    path: ["phone"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Enter email or phone")
    .refine((val) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\d{10}$/;
      return emailRegex.test(val) || phoneRegex.test(val);
    }, "Enter valid email or phone"),
  password: passwordSchema,
  userType: z.enum(["user", "serviceProvider", "admin"]),
});

export const forgotPasswordSchema = z
  .object({
    phone: phoneSchema,
    email: emailSchema,
    userType: z.enum(["user", "serviceProvider", "admin"]),
  })
  .refine((data) => data.phone || data.email, {
    message: "Please enter either phone number or email",
    path: ["_errors"],
  });

export const otpSchema = z.object({
  otp: z.string().length(6, "Please enter a valid 6-digit OTP"),
  userType: z.enum(["user", "serviceProvider", "admin"]),
  context: z.enum(["signup", "forgot"]),
  phone: phoneSchema,
  email: emailSchema,
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema.min(
      8,
      "Password must be at least 8 characters long"
    ),
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
