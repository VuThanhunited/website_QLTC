import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
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
    if (user?.role === 'Admin') {
      try {
        const res = await api.get('/audit-logs');
        setAuditLogs(res.data);
      } catch (err) {
        console.error('Lỗi khi fetch audit logs:', err);
      }
    }
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get(`/assets?search=${debouncedSearch}`);
      setAssets(res.data);
    } catch (err) {
      console.error('Lỗi khi fetch assets:', err);
    }
  };

  // Run on load and whenever debouncedSearch changes
  useEffect(() => {
    fetchStats();
    fetchAssets();
    fetchAuditLogs();
  }, [debouncedSearch]);

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

  // Helper icons for categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Software License': return <Cpu className="text-sky-400" size={20} />;
      case 'Digital Course': return <BookOpen className="text-emerald-400" size={20} />;
      default: return <FileText className="text-violet-400" size={20} />;
    }
  };

  // Helper status styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'available': 
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Sẵn sàng (Available)</span>;
      case 'maintaining': 
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Bảo trì (Maintaining)</span>;
      default: 
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">Đã mượn (Allocated)</span>;
    }
  };

  // Simulated personnel data for unified view
  const simulatedPersonnel = [
    { name: 'Nguyễn Văn Hùng', role: 'Student', dept: 'Khoa Công nghệ thông tin', email: 'hung.nv@university.edu.vn' },
    { name: 'Trần Thị Mai', role: 'Student', dept: 'Khoa Điện tử viễn thông', email: 'mai.tt@university.edu.vn' },
    { name: 'Lê Hoàng Nam', role: 'Lecturer', dept: 'Khoa Khoa học máy tính', email: 'nam.lh@university.edu.vn' },
    { name: 'Phạm Hồng Hải', role: 'Admin', dept: 'Phòng Quản trị thiết bị', email: 'hai.ph@university.edu.vn' }
  ];

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      {/* Universal Search Bar at the upper center position */}
      <header className="sticky top-0 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/5 py-4 px-8 flex justify-center z-10">
        <div className="w-full max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="universal-search-input"
            type="text"
            placeholder="Tìm kiếm vạn năng: Nhập mã AST, tên phần mềm, khóa học, tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-2xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
          />
          {searchTerm && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse">
              useDebounce (300ms)
            </span>
          )}
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Bảng Điều Khiển Trung Tâm</h2>
          <p className="text-sm text-gray-400">Xem nhanh chỉ số động và tra cứu kho tài sản phẳng</p>
        </div>

        {/* Metric Cards - Dynamic metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Assets */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary-500/20 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng số lượng tài sản</p>
                <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{stats.totalAssets}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-4 flex items-center gap-1">
              <span className="text-primary-400 font-semibold">Live</span> • Đồng bộ trực tiếp từ Neon MongoDB
            </p>
          </div>

          {/* Card 2: Available Slots */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Slots Sẵn Sàng (Available)</p>
                <h3 className="text-3xl font-bold text-emerald-400 mt-2 tracking-tight">{stats.availableSlots}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-4 flex items-center gap-1">
              Bản quyền phần mềm & Slot khóa học
            </p>
          </div>

          {/* Card 3: Allocated Slots */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Slots Đã Sử Dụng (Allocated)</p>
                <h3 className="text-3xl font-bold text-sky-400 mt-2 tracking-tight">{stats.allocatedSlots}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Activity size={20} />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-4 flex items-center gap-1">
              Số lượng đang được sinh viên khai thác
            </p>
          </div>
        </section>

        {/* Unified Grid View Selector Tabs */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'assets'
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tài sản số ({assets.length})
              </button>
              
              {(user?.role === 'Admin' || user?.role === 'Lecturer') && (
                <button
                  onClick={() => setActiveTab('personnel')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === 'personnel'
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Nhân sự quản trị ({simulatedPersonnel.length})
                </button>
              )}

              {user?.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('audit-logs')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === 'audit-logs'
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Nhật ký kiểm toán ({auditLogs.length})
                </button>
              )}
            </div>

            {debouncedSearch && (
              <span className="text-xs text-gray-500">
                Tìm thấy {assets.length} tài sản phù hợp từ khóa
              </span>
            )}
          </div>

          {/* Unified Grid Views content */}
          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <div key={asset._id} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                    <div>
                      {/* Header Card */}
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider bg-white/5 px-2 py-0.5 rounded">
                          {asset.astId}
                        </span>
                        {getStatusBadge(asset.status)}
                      </div>

                      {/* Info */}
                      <div className="mt-4 flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-xl bg-white/5 shrink-0">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-200 line-clamp-2">{asset.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{asset.category}</p>
                        </div>
                      </div>

                      {/* Location and slots */}
                      <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs text-gray-400">
                        <div className="flex justify-between">
                          <span>Phân bổ:</span>
                          <span className="font-medium text-gray-300">
                            {asset.allocatedSlots} / {asset.totalSlots} slots
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nơi quản lý:</span>
                          <span className="font-medium text-gray-300 truncate max-w-[150px]">{asset.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick borrow action for all roles */}
                    <div className="mt-5 pt-3 border-t border-white/5">
                      <button
                        onClick={() => handleOpenRequest(asset)}
                        disabled={asset.status === 'maintaining' || (asset.status === 'allocated' && (asset.totalSlots - asset.allocatedSlots) <= 0)}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          asset.status === 'maintaining' || (asset.status === 'allocated' && (asset.totalSlots - asset.allocatedSlots) <= 0)
                            ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                            : 'bg-primary-500/10 hover:bg-primary-500 text-primary-400 hover:text-white border border-primary-500/20'
                        }`}
                      >
                        <Send size={14} />
                        Khởi tạo đơn mượn
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center glass-card rounded-2xl">
                  <p className="text-gray-400 text-sm">Không tìm thấy tài sản số nào khớp với từ khóa tìm kiếm.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'personnel' && (user?.role === 'Admin' || user?.role === 'Lecturer') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {simulatedPersonnel.map((person, index) => (
                <div key={index} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-primary-400">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-200">{person.name}</h4>
                      <p className="text-xs text-gray-500">{person.dept}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 text-xs space-y-1">
                    <p className="text-gray-400"><span className="text-gray-500">Quyền:</span> {person.role}</p>
                    <p className="text-gray-400 truncate"><span className="text-gray-500">Email:</span> {person.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audit-logs' && user?.role === 'Admin' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-2">
                <Clock size={16} className="text-primary-400" />
                <h4 className="font-semibold text-sm text-gray-200">Hoạt động thời gian thực (Audit Logs)</h4>
              </div>
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
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-white/[0.02] transition-all">
                        <td className="p-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4">
                          <span className="font-medium text-gray-200">{log.username}</span>
                          <span className="ml-2 text-[9px] bg-white/5 px-1 py-0.5 rounded text-gray-400">{log.role}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            log.action.includes('ADD') || log.action.includes('APPROVE') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 font-mono text-[11px]">{log.details}</td>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send size={18} className="text-primary-400" />
              Khởi tạo Đơn Mượn Tài Sản
            </h3>
            <p className="text-xs text-gray-400 mt-1">Gửi phiếu mượn tài nguyên số tới ban quản lý phê duyệt</p>

            <form onSubmit={handleSendRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Tài sản yêu cầu
                </label>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-3 items-center">
                  <div className="p-1.5 bg-white/5 rounded">
                    {getCategoryIcon(requestModal.asset.category)}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-gray-200">{requestModal.asset.name}</h5>
                    <p className="text-[10px] text-gray-500">{requestModal.asset.astId} • {requestModal.asset.category}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Thời hạn mượn đề xuất (ngày)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  value={requestModal.durationDays}
                  onChange={(e) => setRequestModal({ ...requestModal, durationDays: parseInt(e.target.value) || 30 })}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Lý do mượn / Ghi chú
                </label>
                <textarea
                  required
                  rows="3"
                  value={requestModal.notes}
                  onChange={(e) => setRequestModal({ ...requestModal, notes: e.target.value })}
                  placeholder="Ví dụ: Em cần phục vụ làm nghiên cứu đề tài môn học..."
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl text-xs text-white focus:outline-none transition-all resize-none"
                />
              </div>

              {requestStatus.message && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  requestStatus.success 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                  {requestStatus.message}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseRequest}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all border border-transparent hover:border-white/5"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={requestStatus.loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-primary-500/10 transition-all flex items-center justify-center gap-1.5"
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
