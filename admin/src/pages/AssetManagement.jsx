import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { 
  FolderLock, 
  Plus, 
  Eye, 
  Trash2, 
  Filter, 
  Cpu, 
  BookOpen, 
  FileText, 
  X,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';

export default function AssetManagement() {
  const { user } = useAuth();
  
  // Data states
  const [assets, setAssets] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // Detail Modal state
  const [detailModal, setDetailModal] = useState({ isOpen: false, asset: null });

  // Add Asset Modal state
  const [addModal, setAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    astId: '',
    name: '',
    category: 'Software License',
    location: '',
    totalSlots: 1
  });
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Load assets
  const fetchAssets = async () => {
    setLoading(true);
    try {
      let url = `/assets?`;
      if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (statusFilter) url += `status=${encodeURIComponent(statusFilter)}&`;
      
      const res = await api.get(url);
      setAssets(res.data);
    } catch (err) {
      console.error('Lỗi khi tải tài sản:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await api.get('/admin/users/lecturers');
      setLecturers(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách giảng viên:', err);
    }
  };

  useEffect(() => {
    fetchAssets();
    if (user?.role === 'Admin') {
      fetchLecturers();
    }
  }, [categoryFilter, statusFilter, user]);

  const handleApproveManager = async (assetId) => {
    try {
      await api.put(`/assets/${assetId}/approve-manager`);
      alert('Đã phê duyệt giảng viên quản lý tài sản!');
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleRejectManager = async (assetId) => {
    try {
      await api.put(`/assets/${assetId}/reject-manager`);
      alert('Đã hủy bỏ/từ chối phân quyền quản lý!');
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleAssignManager = async (assetId, lecturerId) => {
    if (!lecturerId) return;
    try {
      await api.put(`/assets/${assetId}/assign-manager`, { lecturerId });
      alert('Phân công giảng viên quản lý tài sản thành công!');
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  // Handle Add Asset (Admin Only - UC-06)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!newAsset.astId || !newAsset.name || !newAsset.location) {
      setFormError('Vui lòng điền đầy đủ các trường thông tin bắt buộc.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/assets', newAsset);
      setAddModal(false);
      setNewAsset({ astId: '', name: '', category: 'Software License', location: '', totalSlots: 1 });
      fetchAssets();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Không thể tạo mới tài sản số.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Soft Delete (Admin Only - UC-07)
  const handleDeleteAsset = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mềm tài sản này? (Tài sản sẽ chuyển sang trạng thái ẩn và ghi log kiểm toán)')) {
      try {
        await api.delete(`/assets/${id}`);
        fetchAssets();
      } catch (err) {
        alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa tài sản.');
      }
    }
  };

  // Helpers
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Software License': return <Cpu className="text-sky-500" size={16} />;
      case 'Digital Course': return <BookOpen className="text-emerald-500" size={16} />;
      default: return <FileText className="text-violet-500" size={16} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': 
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'maintaining': 
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      default: 
        return 'bg-sky-50 text-sky-600 border border-sky-200';
    }
  };

  const getStatusTextVi = (status) => {
    switch (status) {
      case 'available': return 'Sẵn sàng';
      case 'maintaining': return 'Đang bảo trì';
      default: return 'Đã chiếm giữ';
    }
  };

  return (
    <div className="min-h-screen pl-64 bg-transparent pb-10">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-wide">Kho Quản Lý Tài Sản Số</h2>
          <p className="text-sm text-slate-500">Phân hệ quản trị danh mục tài nguyên phẳng (Chỉ dành cho Cán bộ & Admin)</p>
        </div>

        {user?.role === 'Admin' ? (
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/15 transition-all cursor-pointer"
          >
            <Plus size={16} />
            Thêm thiết bị mới
          </button>
        ) : (
          <div className="text-xs text-amber-650 flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={14} />
            Vai trò: Giảng viên (Chỉ xem và duyệt đơn)
          </div>
        )}
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Lọc nâng cao */}
        <section className="glass-card rounded-2xl p-4 border border-slate-200/60 flex flex-wrap gap-4 items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <Filter size={16} className="text-primary-600" />
            <span>BỘ LỌC HỆ THỐNG</span>
          </div>
          <div className="flex gap-4">
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
              >
                <option value="">Tất cả thể loại</option>
                <option value="Software License">Software License (Phần mềm)</option>
                <option value="Digital Course">Digital Course (Khóa học)</option>
                <option value="Digital Document">Digital Document (Tài liệu)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Sẵn sàng (Available)</option>
                <option value="maintaining">Đang bảo trì (Maintaining)</option>
                <option value="allocated">Đã cấp phát (Allocated)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Dense Data Table */}
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
                    <th className="p-4 font-semibold">Mã tài sản</th>
                    <th className="p-4 font-semibold">Tên thiết bị/phần mềm/khóa học</th>
                    <th className="p-4 font-semibold">Chủng loại</th>
                    <th className="p-4 font-semibold">Vị trí Lab/Lưu trữ</th>
                    <th className="p-4 font-semibold">Tổng Slot</th>
                    <th className="p-4 font-semibold">Người quản lý</th>
                    <th className="p-4 font-semibold">Trạng thái</th>
                    <th className="p-4 font-semibold text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-700 divide-y divide-slate-100">
                  {assets.length > 0 ? (
                    assets.map((asset) => (
                      <tr key={asset._id} className="hover:bg-slate-50/30 transition-all">
                        <td className="p-4 font-mono font-bold text-primary-600">{asset.astId}</td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800 block max-w-xs truncate">{asset.name}</span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5">
                            {getCategoryIcon(asset.category)}
                            {asset.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 max-w-[180px] truncate">{asset.location}</td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800">{asset.allocatedSlots}</span>
                          <span className="text-slate-400"> / {asset.totalSlots}</span>
                        </td>
                        <td className="p-4">
                          {asset.managedBy ? (
                            asset.isManagerApproved ? (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-amber-600">{asset.managedBy.username}</span>
                                {user?.role === 'Admin' && (
                                  <button
                                    onClick={() => handleRejectManager(asset._id)}
                                    title="Hủy phân quyền quản lý"
                                    className="px-1 py-0.5 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-200 text-rose-600 rounded text-[9px] transition-all cursor-pointer font-semibold"
                                  >
                                    Hủy
                                  </button>
                                )}
                              </div>
                            ) : (
                              user?.role === 'Admin' ? (
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="text-slate-400 italic text-[11px] block">{asset.managedBy.username} đăng ký</span>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleApproveManager(asset._id)}
                                      className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                                    >
                                      Duyệt
                                    </button>
                                    <button
                                      onClick={() => handleRejectManager(asset._id)}
                                      className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                                    >
                                      Từ chối
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">{asset.managedBy.username} (Chờ duyệt)</span>
                              )
                            )
                          ) : (
                            user?.role === 'Admin' ? (
                              <select
                                onChange={(e) => handleAssignManager(asset._id, e.target.value)}
                                defaultValue=""
                                className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
                              >
                                <option value="">Chọn Giảng viên</option>
                                {lecturers.map(lec => (
                                  <option key={lec._id} value={lec._id}>{lec.username}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-slate-400 italic">Chưa giao</span>
                            )
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(asset.status)}`}>
                            {getStatusTextVi(asset.status)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => setDetailModal({ isOpen: true, asset })}
                              title="Xem chi tiết"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                            >
                              <Eye size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteAsset(asset._id)}
                              disabled={user?.role !== 'Admin'}
                              title={user?.role === 'Admin' ? 'Xóa tài sản' : 'Chỉ Admin được xóa'}
                              className={`p-1.5 rounded-lg transition-all ${
                                user?.role === 'Admin'
                                  ? 'bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 border border-rose-200'
                                  : 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-200/40'
                              }`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        Không có dữ liệu tài sản nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add New Asset Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-200/80 p-6 shadow-2xl relative bg-white">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle size={18} className="text-primary-600" />
              Thêm Tài Sản Số Mới
            </h3>
            <p className="text-xs text-slate-500 mt-1">Tạo mới tài nguyên phần mềm, khóa học hoặc tài liệu vào cơ sở dữ liệu</p>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Mã tài sản (AST-ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: AST-011"
                  value={newAsset.astId}
                  onChange={(e) => setNewAsset({ ...newAsset, astId: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tên tài sản/thiết bị *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Microsoft Windows 11 Enterprise"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Chủng loại *
                  </label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-sm focus:border-primary-500 rounded-xl focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Software License">Software License</option>
                    <option value="Digital Course">Digital Course</option>
                    <option value="Digital Document">Digital Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tổng số Slot khả dụng *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAsset.totalSlots}
                    onChange={(e) => setNewAsset({ ...newAsset, totalSlots: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-850 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Vị trí Lab / Đường dẫn lưu trữ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lab Room 302, Google Drive..."
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-primary-500 rounded-xl text-sm text-slate-800 focus:outline-none transition-all"
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
                    'Thêm mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-slate-200/80 p-6 shadow-2xl relative bg-white">
            <button
              onClick={() => setDetailModal({ isOpen: false, asset: null })}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FolderLock size={18} className="text-primary-600" />
              Chi Tiết Tài Sản Số
            </h3>
            
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Mã tài sản (AST-ID):</span>
                <span className="font-mono font-bold text-slate-850">{detailModal.asset.astId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Tên tài sản:</span>
                <span className="font-semibold text-slate-850 text-right max-w-[240px]">{detailModal.asset.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Chủng loại:</span>
                <span className="text-slate-850 flex items-center gap-1">
                  {getCategoryIcon(detailModal.asset.category)}
                  {detailModal.asset.category}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Vị trí Lab / Lưu trữ:</span>
                <span className="text-slate-850 text-right max-w-[240px]">{detailModal.asset.location}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Phân bổ Slot:</span>
                <span className="text-slate-850 font-semibold">{detailModal.asset.allocatedSlots} / {detailModal.asset.totalSlots} Slots đã chiếm</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(detailModal.asset.status)}`}>
                  {getStatusTextVi(detailModal.asset.status)}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-400">Ngày tạo bản ghi:</span>
                <span className="text-slate-500">{new Date(detailModal.asset.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setDetailModal({ isOpen: false, asset: null })}
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all border border-slate-200/50"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
