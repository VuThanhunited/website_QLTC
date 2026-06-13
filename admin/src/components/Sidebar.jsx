import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Bảng điều khiển',
      path: '/',
      icon: LayoutDashboard,
      roles: ['Admin']
    },
    {
      name: 'Kho tài sản số',
      path: '/assets',
      icon: FolderLock,
      roles: ['Admin']
    },
    {
      name: 'Phê duyệt & Điều phối',
      path: '/requests',
      icon: GitPullRequest,
      roles: ['Admin']
    },
    {
      name: 'Quản trị hệ thống',
      path: '/admin',
      icon: Settings,
      roles: ['Admin']
    }
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const getRoleNameVi = (role) => {
    switch (role) {
      case 'Admin': return 'Quản trị viên';
      default: return 'Cán bộ quản lý';
    }
  };

  return (
    <aside className="w-64 glass border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/20">
          A
        </div>
        <div>
          <h1 className="font-bold text-md leading-tight text-white tracking-wide">UniAsset Admin</h1>
          <p className="text-xs text-rose-400">Cổng Quản Trị Cán Bộ</p>
        </div>
      </div>

      <div className="p-5 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg text-rose-400 uppercase">
            {user?.username?.[0] || 'A'}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-medium text-sm text-gray-200 truncate">{user?.username}</h4>
            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded border ${getRoleBadgeColor(user?.role)}`}>
              {getRoleNameVi(user?.role)}
            </span>
          </div>
        </div>
      </div>

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
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-600/15 font-semibold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
        >
          <LogOut size={14} />
          Đăng xuất quản trị
        </button>
      </div>
    </aside>
  );
}
