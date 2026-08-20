import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { normalizeRole } from '../services/authService';
import { Sprout } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--primary-800, #166534)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--primary-100, #dcfce7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}>
          <Sprout size={24} />
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading your account...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = normalizeRole(user.role || user.user_type);
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));

    if (!normalizedAllowed.includes(userRole)) {
      // Determine safe dashboard for this user's role to prevent loops
      let targetPath = '/dashboard';
      if (userRole === 'admin') targetPath = '/admin/dashboard';
      else if (userRole === 'machine_owner') targetPath = '/owner/dashboard';

      if (location.pathname === targetPath) {
        return children;
      }

      return (
        <Navigate 
          to={targetPath} 
          state={{ unauthorized: true, attemptedPath: location.pathname }} 
          replace 
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
