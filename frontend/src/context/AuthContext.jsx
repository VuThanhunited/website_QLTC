import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'https://website-qltc.onrender.com/api';

// Tạo Instance Axios cấu hình sẵn Authorization header
export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setToken(token);
      return { success: true };
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại kết nối.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  // Switch role tiện ích cho việc kiểm thử
  const switchUserRole = async (targetRole) => {
    let email = '';
    let password = '';
    
    if (targetRole === 'Admin') {
      email = 'admin@hust.edu.vn';
      password = 'admin123';
    } else if (targetRole === 'Lecturer') {
      email = 'lecturer@hust.edu.vn';
      password = 'lecturer123';
    } else {
      email = 'student@sis.hust.edu.vn';
      password = 'student123';
    }

    return await login(email, password);
  };

  const value = {
    user,
    setUser,
    token,
    setToken,
    loading,
    login,
    logout,
    switchUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
