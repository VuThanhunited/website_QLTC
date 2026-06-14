import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import logoImg from '../img/logo.jpg';
import { 
  Search, 
  Layers, 
  CheckCircle, 
  Activity, 
  Cpu, 
  BookOpen, 
  FileText,
  Clock,
  User,
  ShieldCheck
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
      let url = `/assets?search=${debouncedSearch}&`;
      if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;
      const res = await api.get(url);
      setAssets(res.data);
    } catch (err) {
      console.error('Lỗi khi fetch assets:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAssets();
    fetchAuditLogs();
  }, [debouncedSearch, categoryFilter, statusFilter]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Software License': return <Cpu className="text-sky-500" size={20} />;
      case 'Digital Course': return <BookOpen className="text-emerald-500" size={20} />;
      default: return <FileText className="text-violet-500" size={20} />;
    }
  };

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
    { name: 'Phạm Hồng Hải', role: 'Admin', dept: 'Phòng Quản trị thiết bị', email: 'hai.ph@hust.edu.vn' },
    { name: 'Lê Hoàng Nam', role: 'Lecturer', dept: 'Khoa Khoa học máy tính', email: 'nam.lh@hust.edu.vn' },
    { name: 'Nguyễn Văn Hùng', role: 'Student (Tester)', dept: 'Lớp KTPM K20', email: 'hung.nv@sis.hust.edu.vn' }
  ];

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      {/* Universal Search Bar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-4 px-8 flex justify-center z-10">
        <div className="w-full max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            id="admin-universal-search"
            type="text"
            placeholder="Tìm kiếm vạn năng (Dành cho cán bộ): Nhập mã AST, phần mềm, khóa học, tài liệu..."
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
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Cổng Điều Hành Cán Bộ</h2>
          <p className="text-sm text-slate-500">Xem nhanh chỉ số động và phân bổ tài sản phẳng</p>
        </div>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group bg-white shadow-sm border border-slate-200/60">
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
              <span className="text-primary-600 font-semibold">Live</span> • Cơ sở dữ liệu MongoDB Atlas
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group bg-white shadow-sm border border-slate-200/60">
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

          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group bg-white shadow-sm border border-slate-200/60">
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

        {/* Unified Grid View */}
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
              
              <button
                onClick={() => setActiveTab('personnel')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'personnel'
                    ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Nhân sự & Đội ngũ ({simulatedPersonnel.length})
              </button>

              {user?.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('audit-logs')}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === 'audit-logs'
                      ? 'bg-primary-50 text-primary-600 border border-primary-100 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Nhật ký kiểm toán ({auditLogs.length})
                </button>
              )}
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
          </div>

          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <div key={asset._id} className="glass-card rounded-2xl p-5 border border-slate-200/60 flex flex-col justify-between bg-white shadow-sm">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded">
                          {asset.astId}
                        </span>
                        {getStatusBadge(asset.status)}
                      </div>

                      <div className="mt-4 flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-xl bg-slate-50 border border-slate-200/40 shrink-0">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-800 line-clamp-2">{asset.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{asset.category}</p>
                        </div>
                      </div>

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
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center glass-card rounded-2xl bg-white shadow-sm border border-slate-200/60">
                  <p className="text-slate-500 text-sm">Không tìm thấy tài sản số nào.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'personnel' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {activeTab === 'audit-logs' && user?.role === 'Admin' && (
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-sm">
              <div className="p-4 bg-slate-50/50 border-b border-slate-200/60 flex items-center gap-2">
                <Clock size={16} className="text-primary-600" />
                <h4 className="font-semibold text-sm text-slate-800">Hoạt động thời gian thực (Audit Logs)</h4>
              </div>
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
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/50 transition-all">
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
