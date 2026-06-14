import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../img/logo.jpg';
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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-200/80 relative z-10 bg-white/95">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shadow-md border border-slate-200/60 flex items-center justify-center mb-4">
            <img src={logoImg} alt="HUST Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">HustAsset Admin</h2>
          <p className="text-slate-500 text-sm mt-1">Cổng đăng nhập dành riêng cho Cán bộ & Admin</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email cán bộ / quản trị
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="admin-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="canbo@hust.edu.vn"
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Mật khẩu truy cập
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/10 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Đăng nhập quản trị'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/60">
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded-full">
              <Sparkles size={11} className="text-primary-500" />
              Đăng nhập nhanh Cán bộ (Test)
            </span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('lecturer@hust.edu.vn', 'lecturer123')}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 hover:border-slate-300 rounded-xl text-xs transition-all text-left group"
            >
              <div>
                <span className="font-semibold text-slate-700">Giảng viên (Lecturer / Manager)</span>
                <p className="text-[10px] text-slate-400">lecturer@hust.edu.vn</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-md group-hover:bg-amber-500 group-hover:text-white transition-all font-semibold">
                Chọn
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin@hust.edu.vn', 'admin123')}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 hover:border-slate-300 rounded-xl text-xs transition-all text-left group"
            >
              <div>
                <span className="font-semibold text-slate-700">Quản trị viên (Admin)</span>
                <p className="text-[10px] text-slate-400">admin@hust.edu.vn</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-md group-hover:bg-rose-500 group-hover:text-white transition-all font-semibold">
                Chọn
              </span>
            </button>

            {/* Tài khoản sinh viên thử đăng nhập -> Báo lỗi chặn */}
            <button
              onClick={() => handleQuickLogin('student@sis.hust.edu.vn', 'student123')}
              className="w-full flex justify-between items-center px-4 py-2.5 bg-rose-50 hover:bg-rose-100/70 border border-rose-200/60 hover:border-rose-300 rounded-xl text-xs transition-all text-left group"
            >
              <div>
                <span className="font-semibold text-rose-600">Sinh viên (Student - Thử Đăng Nhập)</span>
                <p className="text-[10px] text-slate-400">student@sis.hust.edu.vn (Sẽ bị chặn)</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-semibold">
                Chặn
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
