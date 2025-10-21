/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { authAPI } from "../services/common/authApi";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
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
    return { accessToken: null, refreshToken: null };
  }
};
const setTokens = (accessToken: string, refreshToken: string): void => {
  try {
    const currentAuth = localStorage.getItem("auth");
    if (currentAuth) {
      const authData = JSON.parse(currentAuth);
      localStorage.setItem(
        "auth",
        JSON.stringify({
          ...authData,
          accessToken,
          refreshToken,
        })
      );
    } else {
      // Create new auth structure if it doesn't exist
      localStorage.setItem(
        "auth",
        JSON.stringify({
          accessToken,
          refreshToken,
          user: null,
        })
      );
    }
  } catch (error) {
    console.error("Error setting tokens:", error);
  }
};

const clearTokens = (): void => {
  localStorage.removeItem("auth");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = getTokens();

      if (!refreshToken) {
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await authAPI.refreshToken(refreshToken);

        if (
          refreshResponse.success &&
          refreshResponse.accessToken &&
          refreshResponse.refreshToken
        ) {
          setTokens(refreshResponse.accessToken, refreshResponse.refreshToken);

          // Update the Authorization header
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${refreshResponse.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.accessToken}`;

          processQueue(null, refreshResponse.accessToken);
          return api(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error cases
    const url = error.config?.url;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.error("Axios Interceptor - Response error:", {
      url,
      status,
      message,
    });

    const userFriendlyError = new Error(
      message || `Request failed${status ? ` with status ${status}` : ""}`
    );

    return Promise.reject(userFriendlyError);
  }
);

export default api;
