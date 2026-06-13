import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
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
      const res = await api.get(`/assets?search=${debouncedSearch}`);
      setAssets(res.data);
    } catch (err) {
      console.error('Lỗi khi fetch assets:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAssets();
    fetchAuditLogs();
  }, [debouncedSearch]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Software License': return <Cpu className="text-sky-400" size={20} />;
      case 'Digital Course': return <BookOpen className="text-emerald-400" size={20} />;
      default: return <FileText className="text-violet-400" size={20} />;
    }
  };

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

  const simulatedPersonnel = [
    { name: 'Phạm Hồng Hải', role: 'Admin', dept: 'Phòng Quản trị thiết bị', email: 'hai.ph@university.edu.vn' },
    { name: 'Lê Hoàng Nam', role: 'Lecturer', dept: 'Khoa Khoa học máy tính', email: 'nam.lh@university.edu.vn' },
    { name: 'Nguyễn Văn Hùng', role: 'Student (Tester)', dept: 'Lớp KTPM K20', email: 'hung.nv@university.edu.vn' }
  ];

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      {/* Universal Search Bar */}
      <header className="sticky top-0 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/5 py-4 px-8 flex justify-center z-10">
        <div className="w-full max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="admin-universal-search"
            type="text"
            placeholder="Tìm kiếm vạn năng (Dành cho cán bộ): Nhập mã AST, phần mềm, khóa học, tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-2xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all shadow-inner"
          />
          {searchTerm && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              useDebounce (300ms)
            </span>
          )}
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Cổng Điều Hành Cán Bộ</h2>
          <p className="text-sm text-gray-400">Xem nhanh chỉ số động và phân bổ tài sản phẳng</p>
        </div>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng số lượng tài sản</p>
                <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{stats.totalAssets}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Layers size={20} />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-4 flex items-center gap-1">
              <span className="text-rose-400 font-semibold">Live</span> • Cơ sở dữ liệu MongoDB Atlas
            </p>
          </div>

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

        {/* Unified Grid View */}
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
              
              <button
                onClick={() => setActiveTab('personnel')}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'personnel'
                    ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Nhân sự & Đội ngũ ({simulatedPersonnel.length})
              </button>

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
          </div>

          {activeTab === 'assets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.length > 0 ? (
                assets.map((asset) => (
                  <div key={asset._id} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-gray-500 tracking-wider bg-white/5 px-2 py-0.5 rounded">
                          {asset.astId}
                        </span>
                        {getStatusBadge(asset.status)}
                      </div>

                      <div className="mt-4 flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-xl bg-white/5 shrink-0">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-200 line-clamp-2">{asset.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{asset.category}</p>
                        </div>
                      </div>

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
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center glass-card rounded-2xl">
                  <p className="text-gray-400 text-sm">Không tìm thấy tài sản số nào.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'personnel' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {simulatedPersonnel.map((person, index) => (
                <div key={index} className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-rose-400">
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
                <Clock size={16} className="text-rose-400" />
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
                            log.action.includes('ADD') || log.action.includes('APPROVE') || log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
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
    </div>
  );
}
