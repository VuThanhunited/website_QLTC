import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { 
  Clock, 
  Search, 
  RefreshCw
} from 'lucide-react';

export default function PersonalHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Lỗi khi tải lịch sử hoạt động:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const filteredLogs = logs.filter(log => {
    if (log.action === 'LOGIN' || log.action === 'SEARCH') return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.action?.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Lịch sử Hoạt động Cá nhân</h2>
          <p className="text-sm text-slate-500">Xem lại lịch sử gửi đơn yêu cầu, gia hạn, mượn trả tài sản và các hoạt động nghiệp vụ của bạn trên hệ thống</p>
        </div>

        <button
          onClick={fetchLogs}
          title="Làm mới dữ liệu"
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200/50 transition-all cursor-pointer"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Bộ lọc */}
        <section className="glass-card rounded-2xl p-4 border border-slate-200/60 flex items-center relative bg-white shadow-sm">
          <Search className="absolute left-4 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm hành động hoặc chi tiết lịch sử..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </section>

        {/* Bảng Audit Logs */}
        <section className="glass-card rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-sm">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/60 text-xs text-slate-400 uppercase bg-slate-50/50">
                    <th className="p-4 font-semibold w-1/4">Thời gian</th>
                    <th className="p-4 font-semibold w-1/4">Hành động</th>
                    <th className="p-4 font-semibold w-1/2">Chi tiết hoạt động</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/30 transition-all">
                        <td className="p-4 text-slate-400 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action.includes('DELETE') || log.action.includes('REJECT') ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                            log.action.includes('ADD') || log.action.includes('APPROVE') || log.action.includes('CREATE') || log.action.includes('SUBMIT') || log.action.includes('UPDATE') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            'bg-primary-50 text-primary-600 border border-primary-200'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono text-[11px] break-words">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-400">
                        Không tìm thấy lịch sử hoạt động nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
