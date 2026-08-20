import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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

  const updateUser = (updates) => {
    const updated = authService.updateSessionUser(updates);
    if (updated) {
      setUser(updated);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isFarmer: user?.user_type === 'Farmer',
    isMachineryOwner: user?.user_type === 'Machinery Owner',
    login,
    register,
    logout,
    updateUser
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
