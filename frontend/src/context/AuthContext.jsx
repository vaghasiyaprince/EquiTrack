import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredToken,
  setStoredToken,
  loginApi,
  registerApi,
  getProfileApi,
  updateProfileApi,
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      const savedToken = getStoredToken();
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await getProfileApi();
        setUser(profile);
      } catch (err) {
        console.warn('Failed to load user profile with token:', err.message);
        // If token invalid, clear
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await loginApi(email, password);
      if (data.token) {
        setStoredToken(data.token);
        setToken(data.token);
        setUser({
          _id: data._id,
          name: data.name,
          email: data.email,
        });
      }
      return data;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const data = await registerApi(name, email, password);
      return data;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const updateProfile = async (name, password) => {
    setAuthError(null);
    try {
      const data = await updateProfileApi(name, password);
      setUser((prev) => ({
        ...prev,
        name: data.name || (name || prev?.name),
      }));
      return data;
    } catch (err) {
      setAuthError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const logout = () => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        loading,
        authError,
        setAuthError,
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
