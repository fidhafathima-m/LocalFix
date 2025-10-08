/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/axiosConfig.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000, // Add timeout to prevent hanging requests
});

// Helper function to get current token with better error handling
const getCurrentToken = (): string | null => {
  try {
    // Check multiple possible token storage locations
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') ||
           sessionStorage.getItem('token') ||
           sessionStorage.getItem('authToken');
  } catch (error) {
    console.error('Error reading token from storage:', error);
    return null;
  }
};

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getCurrentToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Axios Interceptor - Token added for request:", config.url);
    } else {
      console.warn("⚠️ Axios Interceptor - No token found for request:", config.url);
      
      // Don't log warnings for public endpoints
      const publicEndpoints = ['/auth/login', '/auth/register', '/public'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );
      
      if (!isPublicEndpoint) {
        console.warn("🔐 Authentication may be required for:", config.url);
      }
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Axios Interceptor - Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // You can log successful requests if needed
    // console.log("✅ API Success:", response.config.url, response.status);
    return response;
  },
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    console.error("❌ Axios Interceptor - Response error:", {
      url,
      status,
      message
    });
    
    // Handle specific error cases
    if (status === 401) {
      console.log("🔐 Unauthorized - Clearing tokens");
      
      // Clear all possible auth storage
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('user');
      
      // Only redirect if not already on login page to prevent loops
      if (!window.location.pathname.includes('/login')) {
        console.log("Redirecting to login...");
        // Use setTimeout to avoid interfering with current request
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    if (status === 403) {
      console.log("🚫 Access denied - Insufficient permissions");
      // You might want to show a permission denied message
    }
    
    if (status === 500) {
      console.log("🔥 Server error - Please try again later");
    }
    
    // Return a more user-friendly error message
    const userFriendlyError = new Error(
      message || 
      `Request failed${status ? ` with status ${status}` : ''}`
    );
    (userFriendlyError as any).status = status;
    (userFriendlyError as any).originalError = error;
    
    return Promise.reject(userFriendlyError);
  }
);

export default api;