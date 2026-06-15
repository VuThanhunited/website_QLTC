import React, { useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { User, Key, Mail, Shield, RefreshCw } from 'lucide-react';

export default function Profile() {
  const { user, setUser, setToken } = useAuth();
  
  // Form states
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getRoleNameVi = (role) => {
    switch (role) {
      case 'Admin': return 'Quản trị viên';
      case 'Lecturer': return 'Giảng viên / Manager';
      default: return 'Sinh viên';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Lecturer': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-primary-50 text-primary-600 border-primary-200';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email) {
      setError('Vui lòng nhập đầy đủ Tên tài khoản và Email.');
      return;
    }

    if (!currentPassword) {
      setError('Vui lòng cung cấp mật khẩu hiện tại để xác minh danh tính.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Mật khẩu mới và Xác nhận mật khẩu mới không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        username,
        email,
        currentPassword,
        newPassword: newPassword || undefined
      });

      // Save updated data (Admin Portal uses admin_user and admin_token)
      localStorage.setItem('admin_user', JSON.stringify(res.data.user));
      localStorage.setItem('admin_token', res.data.token);

      // Update state
      setUser(res.data.user);
      setToken(res.data.token);

      setSuccess('Cập nhật thông tin tài khoản thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Thông tin cá nhân</h2>
          <p className="text-sm text-slate-500">Xem và thay đổi thông tin cá nhân của bạn, hoặc cập nhật mật khẩu đăng nhập</p>
        </div>
      </header>

      <main className="p-8 max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl border border-slate-200/60 p-6 bg-white shadow-sm space-y-6">
          {/* Header Info */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-2xl text-primary-600 uppercase">
              {user?.username?.[0] || 'A'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{user?.username}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${getRoleBadgeColor(user?.role)}`}>
                  {getRoleNameVi(user?.role)}
                </span>
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200">
                  Hoạt động
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold">
                {success}
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Tên tài khoản (Username)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Nhập tên tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Địa chỉ Email học viện
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="username@hust.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>
            </div>

            <hr className="border-slate-100 my-4" />

            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Key size={14} className="text-slate-400" />
              Đổi mật khẩu tài khoản
            </h4>

            {/* New Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Để trống nếu không đổi"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-850 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-850 focus:outline-none transition-all"
                />
              </div>
            </div>

            <hr className="border-slate-100 my-4" />

            {/* Current Password for authorization */}
            <div>
              <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Shield size={12} />
                Mật khẩu hiện tại để xác nhận thay đổi *
              </label>
              <input
                type="password"
                required
                placeholder="Nhập mật khẩu hiện tại của bạn"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-rose-200 focus:border-rose-500 rounded-xl text-sm text-slate-850 focus:outline-none transition-all placeholder-rose-300"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/10 transition-all flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
