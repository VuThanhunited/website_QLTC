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
  Calendar,
  Send,
  Plus,
  RefreshCw,
  Search
} from 'lucide-react';

export default function RequestManagement() {
  const { user } = useAuth();
  
  // Data states
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState({}); // { [reqId]: true }
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States for student request creation helper (within this page)
  const [assets, setAssets] = useState([]);
  const [newRequestModal, setNewRequestModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [reqType, setReqType] = useState('borrow');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu cầu:', err);
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
    const matchSearch = assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        assetId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const fetchAssetsForSelection = async () => {
    if (user?.role === 'Student') {
      try {
        const res = await api.get('/assets');
        setAssets(res.data);
        if (res.data.length > 0) {
          setSelectedAssetId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Lỗi khi tải tài sản để chọn:', err);
      }
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchAssetsForSelection();
  }, [user]);

  // Handle Approve/Reject (Lecturer/Admin Only - UC-05)
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

  // Student: Create a request from here
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!selectedAssetId) {
      setFormError('Vui lòng chọn tài sản.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/requests', {
        assetId: selectedAssetId,
        type: reqType,
        durationDays: duration,
        notes
      });
      setNewRequestModal(false);
      setNotes('');
      fetchRequests();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Student: Request extension helper (UC-04)
  const handleQuickExtend = async (assetId, requestNotes) => {
    if (window.confirm('Bạn có chắc chắn muốn gửi yêu cầu gia hạn sử dụng thêm 30 ngày cho tài sản này?')) {
      try {
        await api.post('/requests', {
          assetId,
          type: 'extend',
          durationDays: 30,
          notes: requestNotes || 'Yêu cầu gia hạn thêm thời gian sử dụng phục vụ nghiên cứu.'
        });
        fetchRequests();
        alert('Đã gửi yêu cầu gia hạn thành công!');
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể gửi yêu cầu gia hạn.');
      }
    }
  };

  // Student: Request return helper
  const handleQuickReturn = async (assetId) => {
    if (window.confirm('Bạn có chắc chắn muốn gửi yêu cầu trả tài sản này?')) {
      try {
        await api.post('/requests', {
          assetId,
          type: 'return',
          durationDays: 0,
          notes: 'Hoàn trả tài sản số sau khi hoàn tất sử dụng.'
        });
        fetchRequests();
        alert('Đã gửi yêu cầu hoàn trả thành công!');
      } catch (err) {
        alert(err.response?.data?.message || 'Không thể gửi yêu cầu trả.');
      }
    }
  };

  // Helpers
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
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">
            {user?.role === 'Student' ? 'Đơn Yêu Cầu Của Tôi' : 'Phê Duyệt & Điều Phối Yêu Cầu'}
          </h2>
          <p className="text-sm text-slate-500">
            {user?.role === 'Student' 
              ? 'Theo dõi trạng thái phê duyệt đơn mượn, trả và xin gia hạn tài nguyên'
              : 'Trung tâm xử lý động học các yêu cầu khai thác tài sản số của sinh viên'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchRequests}
            title="Làm mới dữ liệu"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200/50 transition-all"
          >
            <RefreshCw size={16} />
          </button>

          {user?.role === 'Student' && (
            <button
              onClick={() => setNewRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/10 transition-all"
            >
              <Plus size={16} />
              Tạo yêu cầu mới
            </button>
          )}
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Bộ lọc nâng cao */}
        <section className="glass-card rounded-2xl p-4 border border-slate-200/60 flex flex-col md:flex-row gap-4 items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 focus-within:border-primary-500 rounded-xl px-4 py-2 text-xs text-slate-700 w-full md:max-w-xs transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tài sản, MSSV..."
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
                className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 cursor-pointer"
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
                className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-4 py-2 focus:outline-none focus:border-primary-500 cursor-pointer"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="approved">Đã duyệt (Approved)</option>
                <option value="rejected">Từ chối (Rejected)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Bảng đơn từ */}
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
                    <th className="p-4 font-semibold">Người gửi</th>
                    <th className="p-4 font-semibold">Loại đơn</th>
                    <th className="p-4 font-semibold">Thời hạn (ngày)</th>
                    <th className="p-4 font-semibold">Ghi chú / Lý do</th>
                    <th className="p-4 font-semibold">Trạng thái</th>
                    <th className="p-4 font-semibold text-center">Tác vụ hành động</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => {
                      const isProcessing = processingIds[req._id];
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
                          <td className="p-4 font-semibold text-slate-800">{req.durationDays || 'N/A'}</td>
                          <td className="p-4 max-w-xs truncate text-slate-500" title={req.notes}>
                            {req.notes || <span className="text-slate-400">Không ghi chú</span>}
                          </td>
                          <td className="p-4">{getStatusBadge(req.status)}</td>
                          
                          <td className="p-4 text-center">
                            {/* Phê duyệt & Từ chối dành cho Lecturer (Admin không duyệt đơn học sinh nữa) */}
                            {user?.role !== 'Student' ? (
                              req.status === 'pending' ? (
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => handleAction(req._id, 'approved')}
                                    disabled={isProcessing}
                                    title="Duyệt yêu cầu"
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-200 hover:border-emerald-600 transition-all text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
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
                                    title="Từ chối yêu cầu"
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 transition-all text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
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
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                  <span className="text-[10px] text-slate-500">
                                    Xử lý bởi: <span className="font-semibold text-slate-700">{req.actionBy?.username || 'Hệ thống'}</span>
                                  </span>
                                  <button
                                    onClick={() => handleAction(req._id, 'pending')}
                                    disabled={isProcessing}
                                    title="Hoàn tác yêu cầu về trạng thái chờ duyệt"
                                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/55 transition-all text-[9px] font-semibold flex items-center justify-center cursor-pointer"
                                  >
                                    {isProcessing ? (
                                      <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-500 rounded-full animate-spin"></div>
                                    ) : (
                                      'Hoàn tác chờ duyệt'
                                    )}
                                  </button>
                                </div>
                              )
                            ) : (
                              /* Tác vụ dành riêng cho Sinh viên khi đơn đã duyệt */
                              req.status === 'approved' && req.type === 'borrow' ? (
                                <div className="inline-flex gap-2">
                                  {/* Yêu cầu gia hạn (UC-04) */}
                                  <button
                                    onClick={() => handleQuickExtend(req.assetId?._id, `Gia hạn sử dụng thiết bị ${req.assetId?.name}`)}
                                    className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white border border-amber-200 hover:border-amber-600 transition-all text-[10px] font-bold uppercase cursor-pointer"
                                  >
                                    Gia hạn
                                  </button>
                                  {/* Trả tài sản */}
                                  <button
                                    onClick={() => handleQuickReturn(req.assetId?._id)}
                                    className="px-2 py-1 rounded bg-violet-50 hover:bg-violet-500 text-violet-600 hover:text-white border border-violet-200 hover:border-violet-600 transition-all text-[10px] font-bold uppercase cursor-pointer"
                                  >
                                    Yêu cầu trả
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[10px]">-</span>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        Không tìm thấy yêu cầu nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Student Create Request Modal Helper */}
      {newRequestModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-200/80 p-6 shadow-2xl relative bg-white">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus size={18} className="text-primary-600" />
              Khởi Tạo Đơn Yêu Cầu Mới
            </h3>
            <p className="text-xs text-slate-500 mt-1">Gửi phiếu mượn, trả hoặc gia hạn tài nguyên số</p>

            <form onSubmit={handleCreateRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Chọn tài sản số *
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm focus:border-primary-500 rounded-xl focus:outline-none transition-all cursor-pointer"
                >
                  {assets.map((asset) => (
                    <option key={asset._id} value={asset._id}>
                      [{asset.astId}] {asset.name} ({asset.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Loại yêu cầu *
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm focus:border-primary-500 rounded-xl focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="borrow">Mượn tài nguyên</option>
                    <option value="return">Trả tài nguyên</option>
                    <option value="extend">Gia hạn thời hạn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Thời gian đề xuất (ngày)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    disabled={reqType === 'return'}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-850 focus:outline-none disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Lý do / Ghi chú chi tiết *
                </label>
                <textarea
                  required
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Điền lý do thực tế..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-xs text-slate-800 focus:outline-none transition-all resize-none placeholder-slate-400"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewRequestModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all border border-slate-200/50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-primary-500/15 transition-all flex items-center justify-center cursor-pointer"
                >
                  {submitLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Gửi yêu cầu'
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
