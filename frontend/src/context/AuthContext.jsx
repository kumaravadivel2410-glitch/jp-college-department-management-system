import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jp_dms_user')) || null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('jp_dms_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password, role });
      const data = res.data;

      if (data.success && data.token) {
        setUser(data.user);
        setToken(data.token);

        localStorage.setItem('jp_dms_token', data.token);
        localStorage.setItem('jp_dms_user', JSON.stringify(data.user));
        localStorage.setItem('jp_dms_role', data.user.role);

        setLoading(false);
        return { success: true, user: data.user };
      } else {
        setLoading(false);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Server connection failed';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jp_dms_token');
    localStorage.removeItem('jp_dms_user');
    localStorage.removeItem('jp_dms_role');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
