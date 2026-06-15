import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { 
  Users, 
  Clock, 
  UserPlus, 
  Trash2, 
  Search,
  UserCheck,
  Edit
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

  // Edit User Modal States
  const [editModal, setEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState({ id: '', username: '', email: '', password: '', role: 'Student', status: 'Active' });
  const [editFormError, setEditFormError] = useState('');
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);

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

  // Handle Edit User Click
  const handleEditUserClick = (u) => {
    setEditingUser({
      id: u._id,
      username: u.username || '',
      email: u.email || '',
      password: '', // default empty
      role: u.role || 'Student',
      status: u.status || 'Active'
    });
    setEditFormError('');
    setEditModal(true);
  };

  // Handle Edit User Submit
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditFormError('');

    if (!editingUser.username || !editingUser.email) {
      setEditFormError('Vui lòng nhập đầy đủ tên tài khoản và email.');
      return;
    }

    setEditSubmitLoading(true);
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        username: editingUser.username,
        email: editingUser.email,
        password: editingUser.password || undefined,
        role: editingUser.role,
        status: editingUser.status
      });
      setEditModal(false);
      fetchUsers();
      alert('Cập nhật tài khoản thành công!');
    } catch (error) {
      setEditFormError(error.response?.data?.message || 'Không thể cập nhật tài khoản.');
    } finally {
      setEditSubmitLoading(false);
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
      case 'Admin': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Lecturer': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-primary-50 text-primary-600 border-primary-200';
    }
  };

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Quản lý Tài khoản Hệ thống</h2>
          <p className="text-sm text-slate-500">Phân quyền RBAC người dùng và kiểm toán nhật ký an ninh hệ thống</p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/15 transition-all cursor-pointer"
          >
            <UserPlus size={16} />
            Tạo tài khoản mới
          </button>
        )}
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Tab selector */}
        <div className="flex border-b border-slate-200/60 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-850'
              }`}
            >
              <Users size={16} />
              Quản lý tài khoản ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-850'
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
              <div className="glass-card rounded-2xl p-4 border border-slate-200/60 flex items-center relative flex-1 w-full bg-white shadow-sm">
                <Search className="absolute left-4 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài khoản theo tên hoặc địa chỉ email..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Role filter buttons */}
              <div className="flex gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 self-stretch md:self-auto overflow-x-auto">
                {[
                  { value: 'All', label: 'Tất cả' },
                  { value: 'Student', label: 'Sinh viên' },
                  { value: 'Lecturer', label: 'Cán bộ (Giảng viên)' },
                  { value: 'Admin', label: 'Quản trị viên' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setRoleFilter(item.value)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                      roleFilter === item.value
                        ? 'bg-primary-50 text-primary-600 border border-primary-200'
                        : 'text-slate-500 hover:text-slate-850 border border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-sm">
              {loading ? (
                <div className="py-20 flex justify-center items-center">
                  <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200/60 text-xs text-slate-400 uppercase bg-slate-50/50">
                        <th className="p-4 font-semibold">Tên tài khoản</th>
                        <th className="p-4 font-semibold">Địa chỉ Email</th>
                        <th className="p-4 font-semibold">Ngày đăng ký</th>
                        <th className="p-4 font-semibold">Vai trò phân quyền (RBAC)</th>
                        <th className="p-4 font-semibold">Trạng thái</th>
                        <th className="p-4 font-semibold text-center">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/30 transition-all">
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 block">{u.username}</span>
                              {u._id === user?.id && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1 py-0.2 rounded font-bold mt-0.5 inline-block">
                                  Tài khoản của bạn
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-slate-500">{u.email}</td>
                            <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="p-4">
                              <div className="relative inline-block">
                                <select
                                  value={u.role}
                                  disabled={u._id === user?.id}
                                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                  className={`bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none transition-all font-semibold ${getRoleBadgeColor(u.role)} ${
                                    u._id === user?.id ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                                  }`}
                                >
                                  <option value="Student" className="bg-white text-primary-600">Student (Sinh viên)</option>
                                  <option value="Lecturer" className="bg-white text-amber-600">Lecturer (Giảng viên / Manager)</option>
                                  <option value="Admin" className="bg-white text-rose-600">Admin (Quản trị viên)</option>
                                </select>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                u.status === 'Blocked' 
                                  ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              }`}>
                                {u.status === 'Blocked' ? 'Đã khóa' : 'Hoạt động'}
                              </span>
                            </td>
                            <td className="p-4 flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditUserClick(u)}
                                title="Chỉnh sửa tài khoản"
                                className="p-2 rounded-lg bg-primary-50 hover:bg-primary-500 hover:text-white text-primary-600 border border-primary-200 transition-all cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id, u.username)}
                                disabled={u._id === user?.id}
                                title={u._id === user?.id ? 'Không thể tự xóa' : 'Xóa tài khoản'}
                                className={`p-2 rounded-lg transition-all ${
                                  u._id === user?.id
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/50'
                                    : 'bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200 cursor-pointer'
                                }`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-400">
                            Không tìm thấy tài quan phù hợp.
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
            <div className="glass-card rounded-2xl p-4 border border-slate-200/60 flex items-center relative bg-white shadow-sm">
              <Search className="absolute left-4 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Lọc nhật ký theo tác nhân, hành động hoặc từ khóa chi tiết..."
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/60 text-xs text-slate-400 uppercase bg-slate-50/50">
                      <th className="p-4 font-semibold">Thời gian</th>
                      <th className="p-4 font-semibold">Tác nhân</th>
                      <th className="p-4 font-semibold">Hành động</th>
                      <th className="p-4 font-semibold">Chi tiết hành vi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/30 transition-all">
                          <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="p-4">
                            <span className="font-medium text-slate-800">{log.username}</span>
                            <span className="ml-2 text-[9px] bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-slate-500 font-semibold">{log.role}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.action.includes('DELETE') ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                              log.action.includes('ADD') || log.action.includes('APPROVE') || log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                              'bg-primary-50 text-primary-600 border border-primary-200'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-mono text-[11px]">{log.details}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-slate-400">
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
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-200/80 p-6 shadow-2xl relative bg-white animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserPlus size={18} className="text-primary-600" />
              Tạo Tài Khoản Mới
            </h3>
            <p className="text-xs text-slate-500 mt-1">Đăng ký tài khoản mới trực tiếp vào hệ thống cơ sở dữ liệu đại học</p>

            <form onSubmit={handleAddUserSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tên tài khoản (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: nguyenvanb"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Địa chỉ Email học viện *
                </label>
                <input
                  type="email"
                  required
                  placeholder="username@sis.hust.edu.vn hoặc @hust.edu.vn"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mật khẩu khởi tạo *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-850 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Vai trò (RBAC Role) *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm focus:border-primary-500 rounded-xl focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Student">Student (Sinh viên)</option>
                    <option value="Lecturer">Lecturer (Giảng viên / Manager)</option>
                    <option value="Admin">Admin (Quản trị viên)</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all border border-slate-200/50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-primary-500/10 transition-all flex items-center justify-center cursor-pointer"
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

      {/* Edit User Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-200/80 p-6 shadow-2xl relative bg-white animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Edit size={18} className="text-primary-600" />
              Chỉnh Sửa Tài Khoản
            </h3>
            <p className="text-xs text-slate-500 mt-1">Cập nhật thông tin tài khoản người dùng trong hệ thống</p>

            <form onSubmit={handleEditUserSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tên tài khoản (Username) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: nguyenvanb"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Địa chỉ Email học viện *
                </label>
                <input
                  type="email"
                  required
                  placeholder="username@sis.hust.edu.vn hoặc @hust.edu.vn"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Mật khẩu mới (Tùy chọn)
                  </label>
                  <input
                    type="password"
                    placeholder="Để trống nếu không đổi"
                    value={editingUser.password}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-850 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Vai trò (RBAC Role) *
                  </label>
                  <select
                    value={editingUser.role}
                    disabled={editingUser.id === user?.id}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className={`w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm focus:border-primary-500 rounded-xl focus:outline-none transition-all ${
                      editingUser.id === user?.id ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                    }`}
                  >
                    <option value="Student">Student (Sinh viên)</option>
                    <option value="Lecturer">Lecturer (Giảng viên / Manager)</option>
                    <option value="Admin">Admin (Quản trị viên)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Trạng thái tài khoản *
                </label>
                <select
                  value={editingUser.status}
                  disabled={editingUser.id === user?.id}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className={`w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm focus:border-primary-500 rounded-xl focus:outline-none transition-all ${
                    editingUser.id === user?.id ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  }`}
                >
                  <option value="Active">Hoạt động (Active)</option>
                  <option value="Blocked">Tạm khóa (Blocked)</option>
                </select>
              </div>

              {editFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {editFormError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all border border-slate-200/50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={editSubmitLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-primary-500/10 transition-all flex items-center justify-center cursor-pointer"
                >
                  {editSubmitLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Cập nhật'
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
