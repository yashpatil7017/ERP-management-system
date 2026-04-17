import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../context/useAuth';
import Loader from '../components/Loader';
import { getToken, isTokenExpired } from '../utils/tokenUtils';

/**
 * ==========================================
 * PROTECTED ROUTE COMPONENT
 * ==========================================
 * 
 * A production-ready route protection system that:
 * 1. Checks if user is authenticated (JWT token exists)
 * 2. Verifies token validity
 * 3. Supports role-based access control (RBAC)
 * 4. Shows loading state while checking auth
 * 5. Redirects to login if unauthorized
 * 6. Redirects to unauthorized page if insufficient role
 * 
 * Usage in App.jsx:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="dashboard" element={<Dashboard />} />
 *   <Route path="products" element={<Products />} />
 * </Route>
 * 
 * With Role-Based Access Control:
 * <Route element={<ProtectedRoute requiredRoles={['admin', 'sales']} />}>
 *   <Route path="sales-orders" element={<SalesOrders />} />
 * </Route>
 */

const ProtectedRoute = ({ requiredRoles = null }) => {
  // Get auth state from context
  const { isAuthenticated, loading, currentUser } = useAuth();

  /**
   * Show loading state while checking authentication
   * This prevents flickering and ensures auth check completes
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  /**
   * If user is not authenticated, redirect to login
   * The 'replace' option replaces history entry so user can't navigate back
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace state={{ message: 'Session expired. Please login again.' }} />;
  }

  /**
   * Role-Based Access Control (RBAC)
   * If specific roles are required, check if user has one of them
   */
  if (requiredRoles && requiredRoles.length > 0) {
    // Check if user's role is in the required roles list
    const hasRequiredRole = requiredRoles.includes(currentUser?.role);

    // If user doesn't have required role, redirect to unauthorized page
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  /**
   * User is authenticated and has required role (if specified)
   * Render the nested routes
   * Outlet renders the matched child route component
   */
  return <Outlet />;
};

export default ProtectedRoute;
