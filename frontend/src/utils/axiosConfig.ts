/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { authAPI } from "../services/common/authApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000/api",
  timeout: 60000,
});

let isRefreshing = false;

const getTokens = (): {
  accessToken: string | null;
  refreshToken: string | null;
} => {
  try {
    const authData = localStorage.getItem("auth");
    if (authData) {
      const parsed = JSON.parse(authData);
      return {
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
      };
    }
    return { accessToken: null, refreshToken: null };
  } catch (error) {
    console.error("Error reading tokens from storage:", error);
    // Clear corrupted data
    localStorage.removeItem("auth");
    return { accessToken: null, refreshToken: null };
  }
};

const setTokens = (accessToken: string, refreshToken: string): void => {
  try {
    const currentAuth = localStorage.getItem("auth");
    let authData: any = {};

    if (currentAuth) {
      authData = JSON.parse(currentAuth);
    }

    // Update tokens
    authData.accessToken = accessToken;
    authData.refreshToken = refreshToken;

    localStorage.setItem("auth", JSON.stringify(authData));
    console.log("Tokens updated in storage");
  } catch (error) {
    console.error("Error setting tokens:", error);
  }
};

const clearTokens = (): void => {
  console.log("Clearing all authentication tokens");
  localStorage.removeItem("auth");
  // Clear any legacy tokens
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

// Generate idempotency key for frontend
const generateIdempotencyKey = (): string => {
  return `idemp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Store to track idempotency keys per request type
const idempotencyKeyStore = new Map();

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add idempotency key for POST, PUT, PATCH requests to payment/booking endpoints
    if (
      (["post", "put", "patch"].includes(config.method || "") &&
        config.url?.includes("/payments/")) ||
      config.url?.includes("/bookings/")
    ) {
      // Generate a unique key for this specific request
      const requestKey = `${config.method}:${config.url}:${JSON.stringify(
        config.data || {}
      )}`;

      if (!idempotencyKeyStore.has(requestKey)) {
        idempotencyKeyStore.set(requestKey, generateIdempotencyKey());
      }

      const idempotencyKey = idempotencyKeyStore.get(requestKey);
      config.headers["Idempotency-Key"] = idempotencyKey;
    }

    return config;
  },
  (error) => {
    console.error("Axios Interceptor - Request error:", error);
    return Promise.reject(error);
  }
);

let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    // Clear idempotency key for successful requests
    const requestKey = `${response.config.method}:${
      response.config.url
    }:${JSON.stringify(response.config.data || {})}`;
    idempotencyKeyStore.delete(requestKey);

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // On error, keep the idempotency key for retries

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const errorData = error.response?.data;
      const isTokenExpired =
        errorData?.code === "TOKEN_EXPIRED" ||
        errorData?.message?.includes("expired") ||
        errorData?.message?.includes("Token expired");

      if (isTokenExpired) {
        if (isRefreshing) {
          // Wait for the current refresh to complete
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const { refreshToken } = getTokens();

        if (!refreshToken) {
          console.warn("No refresh token available");
          clearTokens();
          window.location.href = "/login?message=session_expired";
          return Promise.reject(error);
        }

        try {
          console.log("Attempting token refresh...");
          const refreshResponse = await authAPI.refreshToken(refreshToken);

          const responseData = refreshResponse.data || refreshResponse;
          const newAccessToken =
            responseData.data?.accessToken || responseData.accessToken;
          const newRefreshToken =
            responseData.data?.refreshToken || responseData.refreshToken;

          if (newAccessToken && newRefreshToken) {
            console.log("Tokens refreshed successfully");
            setTokens(newAccessToken, newRefreshToken);

            // Update default headers
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Notify all waiting requests
            onTokenRefreshed(newAccessToken);

            // Retry the original request
            return api(originalRequest);
          } else {
            throw new Error("Invalid token response format");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          // Clear all subscribers
          refreshSubscribers = [];

          // Clear tokens and redirect
          clearTokens();
          window.location.href = "/login?message=session_expired";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Handle other 401 errors
    if (error.response?.status === 401) {
      console.warn("Unauthorized access, clearing tokens");
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
