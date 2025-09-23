import type { JSX } from '@emotion/react/jsx-runtime';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedProps {
  children: JSX.Element;
  allowedRoles: ('admin' | 'user' | 'serviceProvider')[];
}

const ProtectedRoute: React.FC<ProtectedProps> = ({ children, allowedRoles }) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    if (allowedRoles.includes('admin')) return <Navigate to="/admin/login" replace />;
    if (allowedRoles.includes('serviceProvider')) return <Navigate to="/technicians/login" replace />;
    return <Navigate to="/login" replace />; // normal user
  }

  if (!user || !allowedRoles.includes(user.role)) {
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'serviceProvider':
        return <Navigate to="/technicians" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
