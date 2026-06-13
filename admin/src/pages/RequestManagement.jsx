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
  RefreshCw
} from 'lucide-react';

export default function RequestManagement() {
  const { user } = useAuth();
  
  // Data states
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState({}); // { [reqId]: true }

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

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle Approve/Reject (UC-05)
  const handleAction = async (id, action) => {
    setProcessingIds(prev => ({ ...prev, [id]: true }));
    try {
      await api.post(`/requests/${id}/action`, { action });
      await fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xử lý yêu cầu này.');
    } finally {
      setProcessingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Software License': return <Cpu className="text-sky-400" size={14} />;
      case 'Digital Course': return <BookOpen className="text-emerald-400" size={14} />;
      default: return <FileText className="text-violet-400" size={14} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Đã duyệt (Approved)</span>;
      case 'rejected': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Từ chối (Rejected)</span>;
      default: 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Chờ duyệt (Pending)</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'borrow': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase">MƯỢN</span>;
      case 'return': 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 uppercase">TRẢ</span>;
      default: 
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">GIA HẠN</span>;
    }
  };

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      <header className="sticky top-0 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/5 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Phê Duyệt & Điều Phối Đơn Yêu Cầu</h2>
          <p className="text-sm text-gray-400">Trung tâm kiểm soát và cấp phát tài nguyên số đại học cho sinh viên</p>
        </div>

        <button
          onClick={fetchRequests}
          title="Làm mới dữ liệu"
          className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Table */}
        <section className="glass-card rounded-2xl overflow-hidden border border-white/5">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-gray-400 uppercase bg-white/[0.01]">
                    <th className="p-4 font-semibold">Tài sản yêu cầu</th>
                    <th className="p-4 font-semibold">Thể loại</th>
                    <th className="p-4 font-semibold">Sinh viên gửi đơn</th>
                    <th className="p-4 font-semibold">Loại đơn</th>
                    <th className="p-4 font-semibold">Thời hạn đề xuất</th>
                    <th className="p-4 font-semibold">Lý do mượn</th>
                    <th className="p-4 font-semibold">Trạng thái</th>
                    <th className="p-4 font-semibold text-center">Tác vụ phê duyệt</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-300 divide-y divide-white/5">
                  {requests.length > 0 ? (
                    requests.map((req) => {
                      const isProcessing = processingIds[req._id];
                      return (
                        <tr key={req._id} className="hover:bg-white/[0.01] transition-all">
                          <td className="p-4">
                            <span className="font-bold text-gray-200 block">{req.assetId?.name}</span>
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5 inline-block bg-white/5 px-1.5 py-0.2 rounded">
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
                            <span className="font-medium text-gray-200 block">{req.userId?.username}</span>
                            <span className="text-[10px] text-gray-500">{req.userId?.email}</span>
                          </td>
                          <td className="p-4">{getTypeBadge(req.type)}</td>
                          <td className="p-4 font-semibold text-gray-200">{req.durationDays} ngày</td>
                          <td className="p-4 max-w-xs truncate text-gray-400" title={req.notes}>
                            {req.notes || <span className="text-gray-600">Không ghi chú</span>}
                          </td>
                          <td className="p-4">{getStatusBadge(req.status)}</td>
                          
                          <td className="p-4 text-center">
                            {req.status === 'pending' ? (
                              <div className="inline-flex gap-2 justify-center">
                                <button
                                  onClick={() => handleAction(req._id, 'approved')}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 transition-all text-[11px] font-semibold flex items-center gap-1"
                                >
                                  {isProcessing ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  ) : (
                                    <>
                                      <Check size={12} />
                                      Duyệt
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleAction(req._id, 'rejected')}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-all text-[11px] font-semibold flex items-center gap-1"
                                >
                                  {isProcessing ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  ) : (
                                    <>
                                      <X size={12} />
                                      Từ chối
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500">
                                Đã xử lý
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-400">
                        Không có đơn yêu cầu chờ duyệt.
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
