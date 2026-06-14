import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { 
  GitPullRequest, 
  Check, 
  X, 
  Clock, 
  User, 
  Cpu, 
  BookOpen, 
  FileText,
  RefreshCw,
  Search
} from 'lucide-react';

export default function RequestManagement() {
  const { user } = useAuth();
  
  // Data states
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu cầu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchType = typeFilter === 'All' || req.type === typeFilter;
    const assetName = req.assetId?.name || '';
    const assetId = req.assetId?.astId || '';
    const studentName = req.userId?.username || '';
    const studentEmail = req.userId?.email || '';
    const matchSearch = assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Software License': return <Cpu className="text-sky-500" size={14} />;
      case 'Digital Course': return <BookOpen className="text-emerald-500" size={14} />;
      default: return <FileText className="text-violet-500" size={14} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-600 border border-emerald-200">Đã duyệt (Approved)</span>;
      case 'rejected': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-600 border border-rose-200">Từ chối (Rejected)</span>;
      default: 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-600 border border-amber-200">Chờ duyệt (Pending)</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'borrow': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary-50 text-primary-600 border border-primary-200 uppercase">MƯỢN</span>;
      case 'return': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-violet-50 text-violet-600 border border-violet-200 uppercase">TRẢ</span>;
      default: 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-600 border border-amber-200 uppercase">GIA HẠN</span>;
    }
  };

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Giám Sát & Điều Phối Đơn Yêu Cầu</h2>
          <p className="text-sm text-slate-500">Xem trạng thái cấp phát tài nguyên số đại học cho sinh viên (Duyệt bởi Giảng viên phụ trách)</p>
        </div>

        <button
          onClick={fetchRequests}
          title="Làm mới dữ liệu"
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200/50 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Bộ lọc nâng cao */}
        <section className="glass-card rounded-2xl p-4 border border-slate-200/60 flex flex-col md:flex-row gap-4 items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:border-primary-500 rounded-xl px-4 py-2 text-xs text-slate-700 w-full md:max-w-xs transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài sản, sinh viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-800 w-full focus:outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-750 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="All">Tất cả loại đơn</option>
                <option value="borrow">Mượn (Borrow)</option>
                <option value="return">Trả (Return)</option>
                <option value="extend">Gia hạn (Extend)</option>
              </select>
            </div>

            <div className="flex-1 md:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-750 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="approved">Đã duyệt (Approved)</option>
                <option value="rejected">Từ chối (Rejected)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Table */}
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
                    <th className="p-4 font-semibold">Tài sản yêu cầu</th>
                    <th className="p-4 font-semibold">Thể loại</th>
                    <th className="p-4 font-semibold">Sinh viên gửi đơn</th>
                    <th className="p-4 font-semibold">Loại đơn</th>
                    <th className="p-4 font-semibold">Thời hạn đề xuất</th>
                    <th className="p-4 font-semibold">Lý do mượn</th>
                    <th className="p-4 font-semibold">Trạng thái</th>
                    <th className="p-4 font-semibold text-center">Xử lý bởi Cán bộ</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                      return (
                        <tr key={req._id} className="hover:bg-slate-50/30 transition-all">
                          <td className="p-4">
                            <span className="font-bold text-slate-800 block">{req.assetId?.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 inline-block bg-slate-100 border border-slate-200/50 px-1.5 py-0.2 rounded">
                              {req.assetId?.astId}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="flex items-center gap-1.5">
                              {getCategoryIcon(req.assetId?.category)}
                              {req.assetId?.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-slate-800 block">{req.userId?.username}</span>
                            <span className="text-[10px] text-slate-400">{req.userId?.email}</span>
                          </td>
                          <td className="p-4">{getTypeBadge(req.type)}</td>
                          <td className="p-4 font-semibold text-slate-800">{req.durationDays} ngày</td>
                          <td className="p-4 max-w-xs truncate text-slate-500" title={req.notes}>
                            {req.notes || <span className="text-slate-400">Không ghi chú</span>}
                          </td>
                          <td className="p-4">{getStatusBadge(req.status)}</td>
                          
                          <td className="p-4 text-center">
                            {req.status === 'pending' ? (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.8 rounded">
                                Chờ Giảng viên duyệt
                              </span>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <span className={`text-[10px] font-bold ${req.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {req.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                </span>
                                {req.actionBy && (
                                  <span className="text-[9px] text-slate-400 font-medium">
                                    Bởi: {req.actionBy.username}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        Không có đơn yêu cầu nào.
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
