import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin đăng nhập.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = async (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
    setLoading(true);
    const result = await login(roleEmail, rolePass);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-white/10 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white mb-4 shadow-xl shadow-rose-500/20">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wide">UniAsset Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Cổng đăng nhập dành riêng cho Cán bộ & Admin</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email cán bộ / quản trị
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                id="admin-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="canbo@university.edu.vn"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Mật khẩu truy cập
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-rose-500/15 focus:outline-none focus:ring-2 focus:ring-rose-500/35 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Đăng nhập quản trị'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-white/5 text-gray-400 border border-white/10 rounded-full">
              <Sparkles size={11} className="text-indigo-400" />
              Đăng nhập nhanh Cán bộ (Test)
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('lecturer@university.edu.vn', 'lecturer123')}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-xs transition-all text-left group"
            >
              <div>
                <span className="font-semibold text-gray-300">Giảng viên (Lecturer / Manager)</span>
                <p className="text-[10px] text-gray-500">lecturer@university.edu.vn</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md group-hover:bg-amber-500 group-hover:text-white transition-all">
                Chọn
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin@university.edu.vn', 'admin123')}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-xl text-xs transition-all text-left group"
            >
              <div>
                <span className="font-semibold text-gray-300">Quản trị viên (Admin)</span>
                <p className="text-[10px] text-gray-500">admin@university.edu.vn</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md group-hover:bg-rose-500 group-hover:text-white transition-all">
                Chọn
              </span>
            </button>

            {/* Tài khoản sinh viên thử đăng nhập -> Báo lỗi chặn */}
            <button
              onClick={() => handleQuickLogin('student@university.edu.vn', 'student123')}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-xl text-xs transition-all text-left group"
            >
              <div>
                <span className="font-semibold text-rose-400">Sinh viên (Student - Thử Đăng Nhập)</span>
                <p className="text-[10px] text-gray-500">student@university.edu.vn (Sẽ bị chặn)</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-md">
                Chặn
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
