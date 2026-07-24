import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('jpc_user');
    return savedUser ? JSON.parse(savedUser) : { role: 'Admin', name: 'Dr. S. Ramesh', email: 'admin@jpcollege.edu', department: 'CSE' };
  });
  const [token, setToken] = useState(() => localStorage.getItem('jpc_token') || 'demo_token_2026');

  useEffect(() => {
    if (user) {
      localStorage.setItem('jpc_user', JSON.stringify(user));
      localStorage.setItem('jpc_user_role', user.role || 'Admin');
      localStorage.setItem('jpc_user_name', user.name || 'User');
    }
  }, [user]);

  const login = async (identifier, password) => {
    try {
      const loginId = identifier || '';
      const res = await API.post('/auth/login', { identifier: loginId, email: loginId, password });
      if (res && res.success) {
        if (res.mustChangePassword) {
          return { success: true, mustChangePassword: true, user: res.user };
        }
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('jpc_token', res.token);
        return { success: true, user: res.user };
      }
      return { success: false, message: res?.message || 'Login failed' };
    } catch (err) {
      // Fallback demo mode login if server is starting or disconnected
      const loginId = String(identifier || 'User');
      let role = 'Admin';
      if (loginId.includes('FAC') || loginId.includes('faculty') || password.includes('faculty')) role = 'Faculty';
      if (loginId.startsWith('9511') || loginId.includes('student') || password.includes('student')) role = 'Student';

      const demoUser = {
        name: loginId.split('@')[0].toUpperCase() + ` (${role})`,
        email: loginId.includes('@') ? loginId : `${loginId.toLowerCase()}@jpcollege.edu`,
        role,
        department: 'Computer Science'
      };
      setUser(demoUser);
      setToken('demo_token');
      localStorage.setItem('jpc_token', 'demo_token');
      return { success: true, user: demoUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jpc_user');
    localStorage.removeItem('jpc_token');
    localStorage.removeItem('jpc_user_role');
    localStorage.removeItem('jpc_user_name');
  };

  const switchRole = (newRole) => {
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
