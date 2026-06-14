import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import logoImg from '../img/logo.jpg';
import { 
  Search, 
  Layers, 
  CheckCircle, 
  Activity, 
  HelpCircle, 
  Cpu, 
  BookOpen, 
  FileText, 
  Send,
  PlusCircle,
  Calendar,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Criteria Filters states
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Data states
  const [stats, setStats] = useState({ totalAssets: 0, availableSlots: 0, allocatedSlots: 0 });
  const [assets, setAssets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'personnel', 'audit-logs'

  // Modal State for Request
  const [requestModal, setRequestModal] = useState({ isOpen: false, asset: null, notes: '', durationDays: 30 });
  const [requestStatus, setRequestStatus] = useState({ loading: false, success: false, message: '' });

  // Load statistics and logs
  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Lỗi khi fetch stats:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Lỗi khi fetch audit logs:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      let url = `/assets?search=${debouncedSearch}&`;
      if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;
      
      const res = await api.get(url);
      setAssets(res.data);
    } catch (err) {
      console.error('Lỗi khi fetch assets:', err);
    }
  };

  // Run on load and whenever filters change
  useEffect(() => {
    fetchStats();
    fetchAssets();
    fetchAuditLogs();
  }, [debouncedSearch, categoryFilter, statusFilter]);

  const handleOpenRequest = (asset) => {
    setRequestModal({ isOpen: true, asset, notes: '', durationDays: 30 });
    setRequestStatus({ loading: false, success: false, message: '' });
  };

  const handleCloseRequest = () => {
    setRequestModal({ isOpen: false, asset: null, notes: '', durationDays: 30 });
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setRequestStatus({ loading: true, success: false, message: '' });
    try {
      const payload = {
        assetId: requestModal.asset._id,
        type: 'borrow',
        durationDays: requestModal.durationDays,
        notes: requestModal.notes
      };
      await api.post('/requests', payload);
      setRequestStatus({ loading: false, success: true, message: 'Đã gửi yêu cầu mượn tài nguyên thành công. Đang chờ phê duyệt!' });
      
      // Reload stats and assets
      fetchStats();
      fetchAssets();
      fetchAuditLogs();

      setTimeout(() => {
        handleCloseRequest();
      }, 1500);
    } catch (error) {
      setRequestStatus({ 
        loading: false, 
        success: false, 
        message: error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.' 
      });
    }
  };

  const handleProposeManager = async (assetId) => {
    try {
      await api.put(`/assets/${assetId}/propose-manager`);
      alert('Gửi yêu cầu đăng ký quản lý thành công! Chờ Admin phê duyệt.');
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể đăng ký quản lý.');
    }
  };

  // Helper icons for categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Software License': return <Cpu className="text-sky-500" size={20} />;
      case 'Digital Course': return <BookOpen className="text-emerald-500" size={20} />;
      default: return <FileText className="text-violet-500" size={20} />;
    }
  };

  // Helper status styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available': 
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-600 border border-emerald-200">Sẵn sàng (Available)</span>;
      case 'maintaining': 
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-600 border border-amber-200">Bảo trì (Maintaining)</span>;
      default: 
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-50 text-sky-600 border border-sky-200">Đã mượn (Allocated)</span>;
    }
  };

  const simulatedPersonnel = [
    { name: 'Nguyễn Văn Hùng', role: 'Student', dept: 'Khoa Công nghệ thông tin', email: 'hung.nv@sis.hust.edu.vn' },
    { name: 'Trần Thị Mai', role: 'Student', dept: 'Khoa Điện tử viễn thông', email: 'mai.tt@sis.hust.edu.vn' },
    { name: 'Lê Hoàng Nam', role: 'Lecturer', dept: 'Khoa Khoa học máy tính', email: 'nam.lh@hust.edu.vn' },
    { name: 'Phạm Hồng Hải', role: 'Admin', dept: 'Phòng Quản trị thiết bị', email: 'hai.ph@hust.edu.vn' }
  ];

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      {/* Universal Search Bar at the upper center position */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-4 px-8 flex justify-center z-10">
        <div className="w-full max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            id="universal-search-input"
            type="text"
            placeholder="Tìm kiếm vạn năng: Nhập mã AST, tên phần mềm, khóa học, tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 hover:bg-slate-200 focus:bg-white border border-slate-200/80 focus:border-primary-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
          />
          {searchTerm && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              useDebounce (300ms)
            </span>
          )}
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Bảng Điều Khiển Trung Tâm</h2>
          <p className="text-sm text-slate-500">Xem nhanh chỉ số động và tra cứu kho tài sản phẳng</p>
        </div>

        {/* Metric Cards - Dynamic metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Assets */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary-500/10 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số lượng tài sản</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2 tracking-tight">{stats.totalAssets}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                <Layers size={20} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1">
              <span className="text-primary-600 font-semibold">Live</span> • Đồng bộ trực tiếp từ Neon MongoDB
            </p>
          </div>

          {/* Card 2: Available Slots */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slots Sẵn Sàng (Available)</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{stats.availableSlots}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle size={20} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1">
              Bản quyền phần mềm & Slot khóa học
            </p>
          </div>

          {/* Card 3: Allocated Slots */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/10 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slots Đã Sử Dụng (Allocated)</p>
                <h3 className="text-3xl font-bold text-sky-600 mt-2 tracking-tight">{stats.allocatedSlots}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Activity size={20} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1">
              Số lượng đang được sinh viên khai thác
            </p>
          </div>
        </section>

        {/* Unified Grid View Selector Tabs */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-200/60 pb-2 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'assets'
                    ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tài sản số ({assets.length})
              </button>
              
              {(user?.role === 'Admin' || user?.role === 'Lecturer') && (
                <button
                  onClick={() => setActiveTab('personnel')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === 'personnel'
                      ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Nhân sự quản trị ({simulatedPersonnel.length})
                </button>
              )}

              <button
                onClick={() => setActiveTab('audit-logs')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'audit-logs'
                    ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {user?.role === 'Admin' ? `Nhật ký kiểm toán (${auditLogs.length})` : `Lịch sử cá nhân (${auditLogs.length})`}
              </button>
            </div>

            {activeTab === 'assets' && (
              <div className="flex flex-wrap gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="">Tất cả thể loại</option>
                  <option value="Software License">Software License</option>
                  <option value="Digital Course">Digital Course</option>
                  <option value="Digital Document">Digital Document</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary-500 cursor-pointer"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="available">Sẵn sàng (Available)</option>
                  <option value="maintaining">Bảo trì (Maintaining)</option>
                  <option value="allocated">Đã mượn (Allocated)</option>
                </select>
              </div>
            )}

            {debouncedSearch && (
              <span className="text-xs text-slate-400">
                Tìm thấy {assets.length} tài sản phù hợp từ khóa
              </span>
            )}
          </div>

          {/* Unified Grid Views content */}
          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <div key={asset._id} className="glass-card rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-all">
                    <div>
                      {/* Header Card */}
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">
                          {asset.astId}
                        </span>
                        {getStatusBadge(asset.status)}
                      </div>

                      {/* Info */}
                      <div className="mt-4 flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200/40 shrink-0">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-800 line-clamp-2">{asset.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{asset.category}</p>
                        </div>
                      </div>

                      {/* Location, slots and manager */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Phân bổ:</span>
                          <span className="font-medium text-slate-800">
                            {asset.allocatedSlots} / {asset.totalSlots} slots
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nơi quản lý:</span>
                          <span className="font-medium text-slate-800 truncate max-w-[150px]">{asset.location}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Người phụ trách:</span>
                          {asset.managedBy ? (
                            <span className={`font-semibold ${asset.isManagerApproved ? 'text-amber-600' : 'text-slate-400 italic'}`}>
                              {asset.managedBy.username} {asset.isManagerApproved ? '' : '(Chờ duyệt)'}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa giao</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick borrow / manage actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100">
                      {user?.role === 'Lecturer' ? (
                        !asset.managedBy ? (
                          <button
                            onClick={() => handleProposeManager(asset._id)}
                            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-amber-50 hover:bg-amber-500 border border-amber-200 hover:border-amber-600 text-amber-600 hover:text-white cursor-pointer"
                          >
                            Đăng ký quản lý tài sản
                          </button>
                        ) : asset.managedBy._id === user.id ? (
                          <button
                            disabled
                            className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              asset.isManagerApproved
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-slate-50 text-slate-400 border border-slate-200/50'
                            }`}
                          >
                            {asset.isManagerApproved ? 'Bạn đang quản lý tài sản này' : 'Chờ Admin duyệt quản lý'}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-slate-50 text-slate-400 border border-slate-200/50"
                          >
                            Quản lý bởi: {asset.managedBy.username}
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => handleOpenRequest(asset)}
                          disabled={asset.status === 'maintaining' || (asset.status === 'allocated' && (asset.totalSlots - asset.allocatedSlots) <= 0)}
                          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            asset.status === 'maintaining' || (asset.status === 'allocated' && (asset.totalSlots - asset.allocatedSlots) <= 0)
                              ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200/40'
                              : 'bg-primary-50 hover:bg-primary-500 text-primary-600 hover:text-white border border-primary-200 hover:border-primary-600 cursor-pointer'
                          }`}
                        >
                          <Send size={14} />
                          Khởi tạo đơn mượn
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center glass-card rounded-2xl bg-white shadow-sm border border-slate-200/60">
                  <p className="text-slate-500 text-sm">Không tìm thấy tài sản số nào khớp với từ khóa tìm kiếm.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'personnel' && (user?.role === 'Admin' || user?.role === 'Lecturer') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {simulatedPersonnel.map((person, index) => (
                <div key={index} className="glass-card rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center font-bold text-primary-600">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800">{person.name}</h4>
                      <p className="text-xs text-slate-500">{person.dept}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                    <p><span className="text-slate-400">Quyền:</span> {person.role}</p>
                    <p className="truncate"><span className="text-slate-400">Email:</span> {person.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audit-logs' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-sm">
              <div className="p-4 bg-slate-50/50 border-b border-slate-200/60 flex items-center gap-2">
                <Clock size={16} className="text-primary-600" />
                <h4 className="font-semibold text-sm text-slate-800">
                  {user?.role === 'Admin' ? 'Hoạt động thời gian thực (Audit Logs)' : 'Lịch sử hoạt động cá nhân'}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/60 text-xs text-slate-400 uppercase bg-slate-50/50">
                      <th className="p-4 font-semibold">Thời gian</th>
                      {user?.role === 'Admin' && <th className="p-4 font-semibold">Tác nhân</th>}
                      <th className="p-4 font-semibold">Hành động</th>
                      <th className="p-4 font-semibold">Chi tiết hành vi</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/30 transition-all">
                        <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        {user?.role === 'Admin' && (
                          <td className="p-4">
                            <span className="font-medium text-slate-800">{log.username}</span>
                            <span className="ml-2 text-[9px] bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-slate-500 font-semibold">{log.role}</span>
                          </td>
                        )}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Borrow Request Form Modal */}
      {requestModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-200/80 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 bg-white">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Send size={18} className="text-primary-600" />
              Khởi tạo Đơn Mượn Tài Sản
            </h3>
            <p className="text-xs text-slate-500 mt-1">Gửi phiếu mượn tài nguyên số tới ban quản lý phê duyệt</p>

            <form onSubmit={handleSendRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tài sản yêu cầu
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex gap-3 items-center">
                  <div className="p-1.5 bg-white rounded border border-slate-200/50">
                    {getCategoryIcon(requestModal.asset.category)}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-800">{requestModal.asset.name}</h5>
                    <p className="text-[10px] text-slate-400">{requestModal.asset.astId} • {requestModal.asset.category}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Thời hạn mượn đề xuất (ngày)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={requestModal.durationDays}
                  onChange={(e) => setRequestModal({ ...requestModal, durationDays: parseInt(e.target.value) || 30 })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Lý do mượn / Ghi chú
                </label>
                <textarea
                  required
                  rows="3"
                  value={requestModal.notes}
                  onChange={(e) => setRequestModal({ ...requestModal, notes: e.target.value })}
                  placeholder="Ví dụ: Em cần phục vụ làm nghiên cứu đề tài môn học..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-primary-500 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/10 transition-all resize-none"
                />
              </div>

              {requestStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-semibold border ${
                  requestStatus.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}>
                  {requestStatus.message}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseRequest}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all border border-slate-200/50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={requestStatus.loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-primary-500/10 transition-all flex items-center justify-center gap-1.5"
                >
                  {requestStatus.loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Gửi đơn mượn'
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
