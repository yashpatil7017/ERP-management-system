import axios from 'axios';

/**
 * ==========================================
 * CENTRALIZED API CLIENT CONFIGURATION
 * ==========================================
 * This file contains the axios instance configuration
 * with interceptors for handling authentication and errors.
 * Used across all service files in the application.
 */

// ==========================================
// 1. API INSTANCE CREATION
// ==========================================
/**
 * Create a reusable axios instance with default configuration.
 * Base URL is read from environment variables.
 * Falls back to localhost:5000 for development.
 */
const axiosInstance = axios.create({
  // Base URL for all API requests
  // In Vite, use import.meta.env instead of process.env
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',

  // Request timeout in milliseconds
  timeout: 15000,

  // Default headers for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 2. REQUEST INTERCEPTOR
// ==========================================
/**
 * Interceptor to automatically attach JWT token to requests.
 * 
 * Functionality:
 * - Reads JWT token from localStorage
 * - Attaches token to Authorization header if it exists
 * - Allows unauthenticated requests to pass through
 * 
 * Usage:
 * Authorization: Bearer <JWT_TOKEN>
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Retrieve JWT token from localStorage
    const token = localStorage.getItem('token');

    // Attach token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Reject the promise if there's an error in the request setup
    return Promise.reject(error);
  }
);

// ==========================================
// 3. RESPONSE INTERCEPTOR
// ==========================================
/**
 * Interceptor to handle API responses and errors globally.
 * 
 * Functionality:
 * - Handle 401 Unauthorized responses
 * - Remove invalid token from localStorage
 * - Redirect user to login page
 * - Pass through successful responses
 * 
 * Error Handling:
 * - 401: Token expired or invalid - clear session and redirect
 * - Other errors: Pass through for component-level handling
 */
axiosInstance.interceptors.response.use(
  // Success response handler
  (response) => {
    return response;
  },

  // Error response handler
  (error) => {
    // Check if error response exists and status is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Clear invalid token from localStorage
      localStorage.removeItem('token');

      // Optional: Clear other auth-related data
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');

      // Redirect to login page
      // Using window.location for a hard redirect to reset app state
      window.location.href = '/login';
    }

    // Return the error for component-level error handling
    return Promise.reject(error);
  }
);

// ==========================================
// EXPORT
// ==========================================
/**
 * Export the configured axios instance as default export.
 * 
 * Usage in service files:
 * 
 * import axiosInstance from '../api/axios';
 * 
 * const productService = {
 *   getAll: async () => {
 *     const response = await axiosInstance.get('/products');
 *     return response.data;
 *   },
 * };
 */
export default axiosInstance;
