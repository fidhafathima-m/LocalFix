// constants/authRoutes.ts

export const AUTH_ROUTES = {
  // Authentication routes
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  GOOGLE_AUTH: "/auth/google",

  // OTP routes
  VERIFY_OTP: "/auth/verify-otp",
  VERIFY_RESET_OTP: "/auth/verify-reset-otp",
  RESEND_OTP: "/auth/resend-otp",

  // Password management
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",

  // Profile & roles
  PROFILE: "/auth/profile",
  ADD_ROLE: "/auth/add-role",
  REMOVE_ROLE: (role: string) => `/auth/remove-role/${role}`,
  SWITCH_ROLE: "/auth/switch-role",
} as const;
