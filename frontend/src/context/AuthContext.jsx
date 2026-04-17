import React, { createContext, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { setUnauthorizedHandler } from '../api/axiosInstance';
import { clearAuthStorage, getRoleFromToken, getToken, isTokenExpired } from '../utils/tokenUtils';

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
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const forceLogout = useCallback((message = 'Session expired. Please login again.') => {
    clearAuthStorage();
    setCurrentUser(null);
    setRole('');
    setIsAuthenticated(false);
    setError(null);
    toast.error(message);
    navigate('/login', { replace: true, state: { message } });
  }, [navigate]);

  useEffect(() => {
    setUnauthorizedHandler((message) => {
      forceLogout(message || 'Session expired. Please login again.');
    });
  }, [forceLogout]);

  /**
   * Check if user is already logged in on app load
   * This runs once when app mounts
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          if (isTokenExpired(token)) {
            forceLogout('Session expired. Please login again.');
            return;
          }
          // Token exists, restore user from localStorage
          const user = JSON.parse(userStr);
          const tokenRole = getRoleFromToken(token);
          setCurrentUser(user);
          setRole(tokenRole || String(user?.role || '').toLowerCase());
          setIsAuthenticated(true);
        } else if (token && !userStr) {
          const tokenRole = getRoleFromToken(token);
          if (!tokenRole) {
            forceLogout('Session expired. Please login again.');
            return;
          }
          setCurrentUser({ role: tokenRole });
          setRole(tokenRole);
          setIsAuthenticated(true);
        }
      } catch {
        // Token is invalid or expired
        clearAuthStorage();
        setCurrentUser(null);
        setRole('');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [forceLogout]);

  useEffect(() => {
    if (loading) return;
    const token = getToken();
    if (!token) return;
    if (isTokenExpired(token)) {
      forceLogout('Session expired. Please login again.');
    }
  }, [location.pathname, loading, forceLogout]);

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
      const tokenRole = getRoleFromToken(token);
      setCurrentUser(user);
      setRole(tokenRole || String(user?.role || '').toLowerCase());
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
      const tokenRole = getRoleFromToken(token);
      setCurrentUser(user);
      setRole(tokenRole || String(user?.role || '').toLowerCase());
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
    clearAuthStorage();
    setCurrentUser(null);
    setRole('');
    setIsAuthenticated(false);
    setError(null);
    navigate('/login', { replace: true });
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
    if (!role) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.map((item) => String(item).toLowerCase()).includes(role);
  };

  const canAccess = (allowedRoles = []) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (role === 'admin') return true;
    return hasRole(allowedRoles);
  };

  const value = {
    currentUser,
    role,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
