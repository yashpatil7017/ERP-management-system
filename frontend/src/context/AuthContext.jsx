import React, { createContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axios';

/**
 * ==========================================
 * AUTH CONTEXT - Global Authentication State
 * ==========================================
 * 
 * Manages:
 * - User login/register/logout
 * - JWT token storage
 * - Current user state
 * - Loading states
 * - Authentication status
 * 
 * Used throughout the app via useAuth() hook
 */
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps entire app to provide auth state
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Check if user is already logged in on app load
   * This runs once when app mounts
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          // Token exists, restore user from localStorage
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch {
        // Token is invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise}
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function
   * @param {object} userData - User registration data
   * @returns {Promise}
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axiosInstance.post('/api/auth/register', userData);

      // After successful registration, user is logged in
      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   * Clears all auth state and localStorage
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  /**
   * Update user profile
   * @param {object} userData - Updated user data
   */
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await axiosInstance.put('/api/auth/profile', userData);
      setCurrentUser(response.data.user);
      return { success: true, user: response.data.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Update failed';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Check if user has specific role(s)
   * @param {string|array} roles - Role(s) to check
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!currentUser) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(currentUser.role);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
