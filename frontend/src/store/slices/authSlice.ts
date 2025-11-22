import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserType = "user" | "serviceProvider" | "admin";
export type ApplicationStatus =
  | "not-applied"
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export const isValidApplicationStatus = (
  status: string
): status is ApplicationStatus => {
  return [
    "not-applied",
    "draft",
    "submitted",
    "under_review",
    "approved",
    "rejected",
  ].includes(status);
};

export const getSafeApplicationStatus = (
  status?: string
): ApplicationStatus => {
  return isValidApplicationStatus(status || "")
    ? (status as ApplicationStatus)
    : "not-applied";
};

export interface User {
  _id: string;
  fullName: string;
  profilePictureUrl: string;
  phone?: string;
  email?: string;
  roles: string[];
  applicationStatus?: ApplicationStatus;
  isVerified?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  applicationStatus: ApplicationStatus;
}

const getInitialState = (): AuthState => {
  try {
    const savedAuth = localStorage.getItem("auth");

    if (savedAuth) {
      const authData = JSON.parse(savedAuth);

      if (authData.user && authData.accessToken) {
        return {
          user: authData.user,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken || null,
          isLoggedIn: true,
          loading: false,
          error: null,
          applicationStatus: authData.user.applicationStatus || "not-applied",
        };
      }
    }
  } catch (error) {
    console.error("Error reading auth data from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem("auth");
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoggedIn: false,
    loading: false,
    error: null,
    applicationStatus: "not-applied",
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isLoggedIn = true;
      state.error = null;
      state.applicationStatus =
        action.payload.user.applicationStatus || "not-applied";

      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: action.payload.user,
          accessToken: action.payload.accessToken,
          refreshToken: action.payload.refreshToken,
        })
      );
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.applicationStatus = "not-applied";

      localStorage.removeItem("auth");
    },
    logout: (state) => {
      // Save application data BEFORE clearing auth
      const user = state.user;

      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.applicationStatus = "not-applied";
      state.error = null;

      // Only remove auth data, preserve application data
      localStorage.removeItem("auth");

      // Preserve application data by user ID
      if (user?._id) {
        console.log("Preserving application data for user:", user._id);
      }
    },
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;

      // Update localStorage
      const currentAuth = localStorage.getItem("auth");
      if (currentAuth) {
        const authData = JSON.parse(currentAuth);
        localStorage.setItem(
          "auth",
          JSON.stringify({
            ...authData,
            accessToken: action.payload.accessToken,
            refreshToken: action.payload.refreshToken,
          })
        );
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        state.applicationStatus =
          action.payload.applicationStatus || state.applicationStatus;

        // Update localStorage
        const currentAuth = localStorage.getItem("auth");
        if (currentAuth) {
          const authData = JSON.parse(currentAuth);
          localStorage.setItem(
            "auth",
            JSON.stringify({
              ...authData,
              user: state.user,
            })
          );
        }
      }
    },
    updateApplicationStatus: (
      state,
      action: PayloadAction<ApplicationStatus>
    ) => {
      state.applicationStatus = action.payload;
      if (state.user) {
        state.user.applicationStatus = action.payload;

        const currentAuth = localStorage.getItem("auth");
        if (currentAuth) {
          const authData = JSON.parse(currentAuth);
          localStorage.setItem(
            "auth",
            JSON.stringify({
              ...authData,
              user: state.user,
            })
          );
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isLoggedIn = false;
      state.applicationStatus = "not-applied";
      state.error = null;

      localStorage.removeItem("auth");
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateTokens,
  updateUser,
  updateApplicationStatus,
  clearError,
  setLoading,
  clearAuth,
} = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken;
export const selectRefreshToken = (state: { auth: AuthState }) =>
  state.auth.refreshToken;
export const selectIsLoggedIn = (state: { auth: AuthState }) =>
  state.auth.isLoggedIn;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectApplicationStatus = (state: { auth: AuthState }) =>
  state.auth.applicationStatus;

// Helper selector to check if user has specific role
export const selectHasRole = (role: string) => (state: { auth: AuthState }) =>
  state.auth.user?.roles.includes(role) || false;

export default authSlice.reducer;
