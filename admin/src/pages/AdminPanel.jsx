import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { 
  Users, 
  Clock, 
  UserPlus, 
  Trash2, 
  Search,
  UserCheck
} from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs'
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logsSearch, setLogsSearch] = useState('');
  const [usersSearch, setUsersSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Add User Modal States
  const [addModal, setAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'Student' });
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Filtered users
  const filteredUsers = users.filter(u => {
    const searchLower = usersSearch.toLowerCase();
    const matchSearch = (u.username?.toLowerCase().includes(searchLower) || u.email?.toLowerCase().includes(searchLower));
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Load Users & Audit Logs
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Lỗi khi tải audit logs:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchLogs();
    }
  }, [activeTab]);

  // Handle Add User
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!newUser.username || !newUser.email || !newUser.password) {
      setFormError('Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/admin/users', newUser);
      setAddModal(false);
      setNewUser({ username: '', email: '', password: '', role: 'Student' });
      fetchUsers();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Không thể tạo tài khoản mới.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Change User Role (RBAC)
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
      alert('Cập nhật vai trò người dùng thành công!');
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể thay đổi vai trò.');
      fetchUsers(); // Rollback UI
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"? Hành động này không thể hoàn tác.`)) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể xóa người dùng.');
      }
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const searchLower = logsSearch.toLowerCase();
    return (
      log.username?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Lecturer': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
    }
  };

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      <header className="sticky top-0 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/5 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Quản lý Tài khoản Hệ thống (Frontend & Admin)</h2>
          <p className="text-sm text-gray-400">Phân quyền RBAC người dùng và kiểm toán nhật ký an ninh hệ thống</p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-rose-500/15 transition-all"
          >
            <UserPlus size={16} />
            Tạo tài khoản mới
          </button>
        )}
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Tab selector */}
        <div className="flex border-b border-white/5 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={16} />
              Quản lý tài khoản ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock size={16} />
              Nhật ký kiểm toán ({logs.length})
            </button>
          </div>
        </div>

        {/* Tab Contents: Users List */}
        {activeTab === 'users' && (
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search user */}
              <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center relative flex-1 w-full">
                <Search className="absolute left-4 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài khoản theo tên hoặc địa chỉ email..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                />
              </div>

              {/* Role filter buttons */}
              <div className="flex gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5 self-stretch md:self-auto overflow-x-auto">
                {[
                  { value: 'All', label: 'Tất cả' },
                  { value: 'Student', label: 'Sinh viên (Frontend)' },
                  { value: 'Lecturer', label: 'Cán bộ (Giảng viên)' },
                  { value: 'Admin', label: 'Quản trị viên' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setRoleFilter(item.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      roleFilter === item.value
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              {loading ? (
                <div className="py-20 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-gray-400 uppercase bg-white/[0.01]">
                        <th className="p-4 font-semibold">Tên tài khoản</th>
                        <th className="p-4 font-semibold">Địa chỉ Email</th>
                        <th className="p-4 font-semibold">Ngày đăng ký</th>
                        <th className="p-4 font-semibold">Vai trò phân quyền (RBAC)</th>
                        <th className="p-4 font-semibold text-center">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-gray-300 divide-y divide-white/5">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-white/[0.01] transition-all">
                            <td className="p-4">
                              <span className="font-semibold text-gray-200 block">{u.username}</span>
                              {u._id === user?.id && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded font-bold mt-0.5 inline-block">
                                  Tài khoản của bạn
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-gray-400">{u.email}</td>
                            <td className="p-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <div className="relative inline-block">
                                <select
                                  value={u.role}
                                  disabled={u._id === user?.id}
                                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                  className={`bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none transition-all font-semibold ${getRoleBadgeColor(u.role)} ${
                                    u._id === user?.id ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                                  }`}
                                >
                                  <option value="Student" className="bg-[#0b0f19] text-primary-400">Student (Sinh viên)</option>
                                  <option value="Lecturer" className="bg-[#0b0f19] text-amber-400">Lecturer (Giảng viên / Manager)</option>
                                  <option value="Admin" className="bg-[#0b0f19] text-rose-400">Admin (Quản trị viên)</option>
                                </select>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleDeleteUser(u._id, u.username)}
                                disabled={u._id === user?.id}
                                title={u._id === user?.id ? 'Không thể tự xóa' : 'Xóa tài khoản'}
                                className={`p-2 rounded-lg transition-all ${
                                  u._id === user?.id
                                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                    : 'bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400'
                                }`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-400">
                            Không tìm thấy tài khoản phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab Contents: Filterable Audit Logs */}
        {activeTab === 'logs' && (
          <section className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-center relative">
              <Search className="absolute left-4 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Lọc nhật ký theo tác nhân, hành động hoặc từ khóa chi tiết..."
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-xs text-gray-400 uppercase bg-white/[0.01]">
                      <th className="p-4 font-semibold">Thời gian</th>
                      <th className="p-4 font-semibold">Tác nhân</th>
                      <th className="p-4 font-semibold">Hành động</th>
                      <th className="p-4 font-semibold">Chi tiết hành vi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-gray-300 divide-y divide-white/5">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-white/[0.01] transition-all">
                          <td className="p-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-4">
                            <span className="font-medium text-gray-200">{log.username}</span>
                            <span className="ml-2 text-[9px] bg-white/5 px-1 py-0.5 rounded text-gray-400">{log.role}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              log.action.includes('ADD') || log.action.includes('APPROVE') || log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400 font-mono text-[11px]">{log.details}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-400">
                          Không tìm thấy nhật ký kiểm toán phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Add User Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus size={18} className="text-rose-400" />
              Tạo Tài Khoản Mới
            </h3>
            <p className="text-xs text-gray-400 mt-1">Đăng ký tài khoản mới trực tiếp vào hệ thống cơ sở dữ liệu đại học</p>

            <form onSubmit={handleAddUserSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Tên tài khoản (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: nguyenvanb"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Địa chỉ Email học viện *
                </label>
                <input
                  type="email"
                  required
                  placeholder="nguyenvanb@university.edu.vn"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Mật khẩu khởi tạo *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Vai trò (RBAC Role) *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-gray-300 focus:outline-none transition-all"
                  >
                    <option value="Student" className="bg-[#0b0f19]">Student (Sinh viên)</option>
                    <option value="Lecturer" className="bg-[#0b0f19]">Lecturer (Giảng viên / Manager)</option>
                    <option value="Admin" className="bg-[#0b0f19]">Admin (Quản trị viên)</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all border border-transparent hover:border-white/5"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-500/10 transition-all flex items-center justify-center"
                >
                  {submitLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Tạo tài khoản'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
