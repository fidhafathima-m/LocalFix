import { USER_ROLES } from "../core/user";
import { APPLICATION_STATUS } from "../core/application";

export const AUTH_MESSAGES = {
  // Success messages
  SIGNUP_SUCCESS: "Signup successful",
  LOGIN_SUCCESS: "Logged in successfully",
  OTP_SENT: "OTP sent successfully",
  OTP_RESENT: "OTP resent successfully",
  OTP_VERIFIED: "OTP verified successfully",
  PASSWORD_RESET: "Password reset successfully",
  LOGOUT_SUCCESS: "Logged out successfully",

  // Error messages
  USER_NOT_FOUND: "User not found",
  EMAIL_IN_USE: "Email already in use",
  PHONE_IN_USE: "Phone already in use",
  INVALID_CREDENTIALS: "Invalid credentials",
  INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP expired! Please request a new one.",
  OTP_NOT_FOUND: "No OTP request found. Please request a new OTP.",
  ACCOUNT_BLOCKED: "Your account is blocked by admin. Please contact support.",
  ACCOUNT_DELETED: "Your account has been deleted. Please contact support.",
  ACCOUNT_INACTIVE: "Your account is not active. Please contact support.",

  // Validation messages
  EMAIL_OR_PHONE_REQUIRED: "Provide at least email or phone",
  PASSWORD_REQUIRED: "Password is required",
  OTP_OR_TOKEN_REQUIRED: "Either OTP or token is required",
  TOKEN_MISMATCH: "Token mismatch",
  USER_TYPE_MISMATCH: "User type mismatch",
  INVALID_RESET_TOKEN: "Invalid reset token",

  // Social auth messages
  FACEBOOK_LOGIN_SUCCESS: "Facebook login successful",
  GOOGLE_AUTH_SUCCESS: "Google authentication successful",
  SOCIAL_AUTH_FAILED: "Social authentication failed",
} as const;

export { USER_ROLES, APPLICATION_STATUS };
