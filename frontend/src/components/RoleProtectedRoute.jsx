import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

export default function RoleProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role, canAccess } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = String(role || '').toLowerCase();
  if (!normalizedRole || !canAccess(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

