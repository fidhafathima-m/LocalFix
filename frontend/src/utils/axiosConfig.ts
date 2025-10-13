import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000,
});

// Helper function to get current token with better error handling
const getCurrentToken = (): string | null => {
  try {
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
      
      
    }
    
    if (status === 403) {
      console.log("🚫 Access denied - Insufficient permissions");
    }
    
    if (status === 500) {
      console.log("🔥 Server error - Please try again later");
    }
    
    // Return a more user-friendly error message
    const userFriendlyError = new Error(
      message || 
      `Request failed${status ? ` with status ${status}` : ''}`
    );
    
    return Promise.reject(userFriendlyError);
  }
);

export default api;