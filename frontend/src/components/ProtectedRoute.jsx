import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from './LoadingSkeleton';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container page-wrapper" style={{ padding: '4rem 1rem' }}>
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    // Block unauthorized role and redirect safely to /dashboard
    return (
      <Navigate 
        to="/dashboard" 
        state={{ unauthorized: true, attemptedRole: allowedRoles[0] }} 
        replace 
      />
    );
  }

  return children;
};

export default ProtectedRoute;
