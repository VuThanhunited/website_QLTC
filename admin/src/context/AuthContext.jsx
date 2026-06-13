import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API_URL = 'http://localhost:5000/api';

// Instance Axios
export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
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
    const storedUser = localStorage.getItem('admin_user');
    const storedToken = localStorage.getItem('admin_token');
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
      
      // Kiểm tra vai trò bảo mật: Chỉ Admin mới được phép đăng nhập cổng quản trị
      if (user.role !== 'Admin') {
        return { 
          success: false, 
          message: 'Chỉ tài khoản Quản trị viên (Admin) mới được phép truy cập cổng quản trị!' 
        };
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      
      setUser(user);
      setToken(token);
      return { success: true };
    } catch (error) {
      console.error('Lỗi đăng nhập admin:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setToken(null);
  };

  // Giả lập đăng nhập nhanh cho tài khoản Admin
  const switchUserRole = async (targetRole) => {
    let email = 'admin@university.edu.vn';
    let password = 'admin123';
    return await login(email, password);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    switchUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
