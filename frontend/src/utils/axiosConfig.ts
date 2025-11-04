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
// Response interceptor with improved token refresh detection
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
        errorData?.code === 'TOKEN_EXPIRED' ||
        errorData?.message?.includes('expired') ||
        errorData?.message?.includes('Token expired') ||
        error?.message?.includes('expired');
      
      console.log("Token expired check:", isTokenExpired);
      
      if (isTokenExpired) {
        console.log("Token expired, attempting refresh...");
        
        if (isRefreshing) {
          console.log("Refresh already in progress, queuing request...");
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              console.log("Queue resolved with token");
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              console.log("Queue rejected:", err);
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const { refreshToken } = getTokens();
        console.log("Refresh token exists:", !!refreshToken);

        if (!refreshToken) {
          console.log("No refresh token found, redirecting to login");
          clearTokens();
          // Use replace instead of href to avoid beforeunload
          window.location.replace("/login");
          return Promise.reject(error);
        }

        try {
          console.log("Calling refresh token API...");
          const refreshResponse = await authAPI.refreshToken(refreshToken);
          console.log("Refresh response:", refreshResponse);

          const newAccessToken = refreshResponse.accessToken || refreshResponse.data?.accessToken;
          const newRefreshToken = refreshResponse.refreshToken || refreshResponse.data?.refreshToken;

          if (refreshResponse.success && refreshResponse.data?.accessToken && newAccessToken && newRefreshToken) {
            console.log("Token refresh successful, updating tokens...");
            
            setTokens(newAccessToken, newRefreshToken);

            // Update the Authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            processQueue(null, newAccessToken);
            
            console.log("Retrying original request...");
            return api(originalRequest);
          } else {
            console.log("Token refresh failed - invalid response structure");
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          console.log("Token refresh error:", refreshError);
          processQueue(refreshError, null);
          clearTokens();
          // Use replace instead of href to avoid beforeunload
          window.location.replace("/login?message=session_expired");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Handle other 401 errors (invalid token, etc.)
    if (error.response?.status === 401) {
      console.log("Unauthorized access, clearing tokens...");
      clearTokens();
      return Promise.reject(error);
    }

    // Handle other error cases
    console.error("Axios Interceptor - Response error:", error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
