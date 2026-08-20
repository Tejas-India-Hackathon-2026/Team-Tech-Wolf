import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, normalizeRole } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    try {
      const session = authService.getSession();
      if (session && session.user) {
        setUser(session.user);
        setToken(session.token);
      }
    } catch (err) {
      console.warn('[AuthContext] Session load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (identifier, password, rememberMe = true) => {
    const data = await authService.login(identifier, password, rememberMe);
    if (data && data.user) {
      setUser(data.user);
      setToken(data.token);
    }
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    if (data && data.user) {
      setUser(data.user);
      setToken(data.token);
    }
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const hasRole = (role) => {
    if (!user) return false;
    return normalizeRole(user.role) === normalizeRole(role);
  };

  const isFarmer = user ? normalizeRole(user.role) === 'farmer' : false;
  const isMachineryOwner = user ? normalizeRole(user.role) === 'machine_owner' : false;
  const isAdmin = user ? normalizeRole(user.role) === 'admin' : false;

  const value = {
    user,
    token,
    isLoading,
    loading: isLoading, // Backwards-compatible alias
    isAuthenticated: !!user,
    role: user ? normalizeRole(user.role) : null,
    isFarmer,
    isMachineryOwner,
    isAdmin,
    hasRole,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
