import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../img/logo.jpg';
import { 
  LayoutDashboard, 
  FolderLock, 
  GitPullRequest, 
  LogOut, 
  Users, 
  Cpu, 
  BookOpen, 
  FileText,
  UserCheck,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, switchUserRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (role) => {
    const res = await switchUserRole(role);
    if (res.success) {
      navigate('/');
    }
  };

  const menuItems = [
    {
      name: 'Bảng điều khiển',
      path: '/',
      icon: LayoutDashboard,
      roles: ['Student', 'Lecturer', 'Admin']
    },
    {
      name: 'Đơn yêu cầu của tôi',
      path: '/requests',
      icon: GitPullRequest,
      roles: ['Student', 'Lecturer', 'Admin']
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'Lecturer': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-primary-500/10 text-primary-600 border-primary-500/20';
    }
  };

  const getRoleNameVi = (role) => {
    switch (role) {
      case 'Admin': return 'Quản trị viên';
      case 'Lecturer': return 'Giảng viên / Manager';
      default: return 'Sinh viên';
    }
  };

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/60 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-md border border-slate-200/50 shrink-0">
          <img src={logoImg} alt="HUST Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-md leading-tight text-slate-800 tracking-wide">UniAsset</h1>
          <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-wide">HUST DAM</p>
        </div>
      </div>

      {/* Profile */}
      <div className="p-5 border-b border-slate-200/60 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-lg text-primary-600 uppercase">
            {user?.username?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-medium text-sm text-slate-800 truncate">{user?.username}</h4>
            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded border ${getRoleBadgeColor(user?.role)}`}>
              {getRoleNameVi(user?.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200/80 bg-slate-50/80">
        {/* Log out */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 transition-all"
        >
          <LogOut size={14} />
          Đăng xuất hệ thống
        </button>
      </div>
    </aside>
  );
}
