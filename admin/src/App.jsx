import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetManagement from './pages/AssetManagement';
import RequestManagement from './pages/RequestManagement';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';

// PrivateRoute kiểm tra xác thực cho Cán bộ quản lý
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="w-10 h-10 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
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

// Bố cục Layout Cán bộ
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

          {/* Các tuyến đường yêu cầu vai trò Quản trị viên (Admin) */}
          <Route
            path="/"
            element={
              <PrivateRoute allowedRoles={['Admin']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/assets"
            element={
              <PrivateRoute allowedRoles={['Admin']}>
                <Layout>
                  <AssetManagement />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <PrivateRoute allowedRoles={['Admin']}>
                <Layout>
                  <RequestManagement />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['Admin']}>
                <Layout>
                  <AdminPanel />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={['Admin']}>
                <Layout>
                  <Profile />
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
