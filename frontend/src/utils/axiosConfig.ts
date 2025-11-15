/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { authAPI } from "../services/common/authApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    console.error("Axios Interceptor - Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration (401 errors)
    if (error.response?.status === 401 && !originalRequest?._retry) {
      const errorData = error.response?.data;
      const isTokenExpired =
        errorData?.code === "TOKEN_EXPIRED" ||
        errorData?.message?.includes("expired") ||
        errorData?.message?.includes("Token expired") ||
        error?.message?.includes("expired");

      if (isTokenExpired) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const { refreshToken } = getTokens();

        if (!refreshToken) {
          console.warn("No refresh token available");
          clearTokens();
          window.location.replace("/login");
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await authAPI.refreshToken(refreshToken);

          // FIXED: Properly extract tokens from response
          const responseData = refreshResponse.data || refreshResponse;
          const newAccessToken =
            responseData.data?.accessToken || responseData.accessToken;
          const newRefreshToken =
            responseData.data?.refreshToken || responseData.refreshToken;

          if (newAccessToken && newRefreshToken) {
            console.log("Tokens refreshed successfully");
            setTokens(newAccessToken, newRefreshToken);

            // Update the Authorization header
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);

            return api(originalRequest);
          } else {
            console.error("Invalid token response:", refreshResponse);
            throw new Error("Token refresh failed - invalid response");
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          processQueue(refreshError, null);
          clearTokens();
          window.location.replace("/login?message=session_expired");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Handle other 401 errors (invalid token, etc.)
    if (error.response?.status === 401) {
      console.warn("Unauthorized access, clearing tokens");
      clearTokens();
      window.location.replace("/login");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
