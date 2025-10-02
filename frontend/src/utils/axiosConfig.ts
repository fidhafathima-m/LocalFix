// utils/axiosConfig.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Helper function to get current token with better error handling
const getCurrentToken = (): string | null => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error reading token from localStorage:', error);
    return null;
  }
};

// Request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getCurrentToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 Axios Interceptor - Added Authorization header to request:", config.url);
    } else {
      console.warn("🔐 Axios Interceptor - No token found for request:", config.url);
    }
    
    return config;
  },
  (error) => {
    console.error("🔐 Axios Interceptor - Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log("🔐 Axios Interceptor - Response success:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("🔐 Axios Interceptor - Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    
    if (error.response?.status === 401) {
      console.log("🔐 Axios Interceptor - 401 detected, clearing auth data");
      
      // Clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Don't redirect automatically - let components handle it
      // This prevents infinite redirect loops
    }
    
    return Promise.reject(error);
  }
);

export default api;