import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestManagement from './pages/RequestManagement';
import PersonalHistory from './pages/PersonalHistory';
import Profile from './pages/Profile';

// PrivateRoute check authentication
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout cho các trang sau khi đăng nhập
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-primary-500/20 selection:text-primary-600">
      <Sidebar />
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Đăng nhập */}
          <Route path="/login" element={<Login />} />

          {/* Các tuyến đường yêu cầu đăng nhập */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/requests"
            element={
              <PrivateRoute>
                <Layout>
                  <RequestManagement />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute>
                <Layout>
                  <PersonalHistory />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Điều hướng mặc định */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
