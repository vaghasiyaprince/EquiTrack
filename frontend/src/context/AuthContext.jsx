import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('equitrack_token') || '');
  const [loading, setLoading] = useState(true);

  // Fetch current user profile on initial mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await apiFetch('/auth/profile');
        setUser(userData);
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem('equitrack_token', data.token);
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data.token) {
      localStorage.setItem('equitrack_token', data.token);
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const updateProfile = async (name, email) => {
    const data = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });

    setUser((prev) => ({ ...prev, ...data }));
    return data;
  };

  const logout = () => {
    localStorage.removeItem('equitrack_token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
