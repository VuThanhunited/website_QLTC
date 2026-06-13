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
  RefreshCw
} from 'lucide-react';

export default function RequestManagement() {
  const { user } = useAuth();
  
  // Data states
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState({}); // Lưu trạng thái loading của từng dòng { [reqId]: true }
  
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
    // Set row-level loading spinner
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
          <h2 className="text-2xl font-bold text-white tracking-wide">
            {user?.role === 'Student' ? 'Đơn Yêu Cầu Của Tôi' : 'Phê Duyệt & Điều Phối Yêu Cầu'}
          </h2>
          <p className="text-sm text-gray-400">
            {user?.role === 'Student' 
              ? 'Theo dõi trạng thái phê duyệt đơn mượn, trả và xin gia hạn tài nguyên'
              : 'Trung tâm xử lý động học các yêu cầu khai thác tài sản số của sinh viên'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchRequests}
            title="Làm mới dữ liệu"
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all"
          >
            <RefreshCw size={16} />
          </button>

          {user?.role === 'Student' && (
            <button
              onClick={() => setNewRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-primary-500/15 transition-all"
            >
              <Plus size={16} />
              Tạo yêu cầu mới
            </button>
          )}
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Bảng đơn từ */}
        <section className="glass-card rounded-2xl overflow-hidden border border-white/5">
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-gray-400 uppercase bg-white/[0.01]">
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
                          <td className="p-4 font-semibold text-gray-200">{req.durationDays || 'N/A'}</td>
                          <td className="p-4 max-w-xs truncate text-gray-400" title={req.notes}>
                            {req.notes || <span className="text-gray-600">Không ghi chú</span>}
                          </td>
                          <td className="p-4">{getStatusBadge(req.status)}</td>
                          
                          <td className="p-4 text-center">
                            {/* Phê duyệt & Từ chối dành cho Lecturer/Admin (UC-05) */}
                            {user?.role !== 'Student' ? (
                              req.status === 'pending' ? (
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => handleAction(req._id, 'approved')}
                                    disabled={isProcessing}
                                    title="Duyệt yêu cầu"
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
                                    title="Từ chối yêu cầu"
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
                                  Xử lý bởi: {req.actionBy ? 'Cán bộ' : 'Hệ thống'}
                                </span>
                              )
                            ) : (
                              /* Tác vụ dành riêng cho Sinh viên khi đơn đã duyệt */
                              req.status === 'approved' && req.type === 'borrow' ? (
                                <div className="inline-flex gap-2">
                                  {/* Yêu cầu gia hạn (UC-04) */}
                                  <button
                                    onClick={() => handleQuickExtend(req.assetId?._id, `Gia hạn sử dụng thiết bị ${req.assetId?.name}`)}
                                    className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/20 transition-all text-[10px] font-bold uppercase"
                                  >
                                    Gia hạn
                                  </button>
                                  {/* Trả tài sản */}
                                  <button
                                    onClick={() => handleQuickReturn(req.assetId?._id)}
                                    className="px-2 py-1 rounded bg-violet-500/10 hover:bg-violet-500 text-violet-400 hover:text-white border border-violet-500/20 transition-all text-[10px] font-bold uppercase"
                                  >
                                    Yêu cầu trả
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-[10px]">-</span>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-400">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={18} className="text-primary-400" />
              Khởi Tạo Đơn Yêu Cầu Mới
            </h3>
            <p className="text-xs text-gray-400 mt-1">Gửi phiếu mượn, trả hoặc gia hạn tài nguyên số</p>

            <form onSubmit={handleCreateRequest} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Chọn tài sản số *
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl text-sm text-gray-300 focus:outline-none transition-all"
                >
                  {assets.map((asset) => (
                    <option key={asset._id} value={asset._id} className="bg-[#0b0f19]">
                      [{asset.astId}] {asset.name} ({asset.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Loại yêu cầu *
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl text-sm text-gray-300 focus:outline-none transition-all"
                  >
                    <option value="borrow" className="bg-[#0b0f19]">Mượn tài nguyên</option>
                    <option value="return" className="bg-[#0b0f19]">Trả tài nguyên</option>
                    <option value="extend" className="bg-[#0b0f19]">Gia hạn thời hạn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Thời gian đề xuất (ngày)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    disabled={reqType === 'return'}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl text-sm text-white focus:outline-none disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Lý do / Ghi chú chi tiết *
                </label>
                <textarea
                  required
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Điền lý do thực tế..."
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-primary-500 rounded-xl text-xs text-white focus:outline-none transition-all resize-none"
                />
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNewRequestModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all border border-transparent hover:border-white/5"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-primary-500/10 transition-all flex items-center justify-center"
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
