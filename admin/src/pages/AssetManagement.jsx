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

  useEffect(() => {
    fetchAssets();
  }, [categoryFilter, statusFilter]);

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
      case 'Software License': return <Cpu className="text-sky-400" size={16} />;
      case 'Digital Course': return <BookOpen className="text-emerald-400" size={16} />;
      default: return <FileText className="text-violet-400" size={16} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available': 
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'maintaining': 
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: 
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
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
      <header className="sticky top-0 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/5 py-6 px-8 flex justify-between items-center z-10">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Kho Quản Lý Tài Sản Số</h2>
          <p className="text-sm text-gray-400">Phân hệ quản trị danh mục tài nguyên phẳng (Chỉ dành cho Cán bộ & Admin)</p>
        </div>

        {user?.role === 'Admin' ? (
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-rose-500/15 transition-all"
          >
            <Plus size={16} />
            Thêm thiết bị mới
          </button>
        ) : (
          <div className="text-xs text-amber-400 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle size={14} />
            Vai trò: Giảng viên (Chỉ xem và duyệt đơn)
          </div>
        )}
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Lọc nâng cao */}
        <section className="glass-card rounded-2xl p-4 border border-white/5 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold">
            <Filter size={16} />
            <span>BỘ LỌC HỆ THỐNG</span>
          </div>
          <div className="flex gap-4">
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl px-4 py-2 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
              >
                <option value="" className="bg-[#0b0f19]">Tất cả thể loại</option>
                <option value="Software License" className="bg-[#0b0f19]">Software License (Phần mềm)</option>
                <option value="Digital Course" className="bg-[#0b0f19]">Digital Course (Khóa học)</option>
                <option value="Digital Document" className="bg-[#0b0f19]">Digital Document (Tài liệu)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 hover:border-white/20 focus:border-rose-500 rounded-xl px-4 py-2 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
              >
                <option value="" className="bg-[#0b0f19]">Tất cả trạng thái</option>
                <option value="available" className="bg-[#0b0f19]">Sẵn sàng (Available)</option>
                <option value="maintaining" className="bg-[#0b0f19]">Đang bảo trì (Maintaining)</option>
                <option value="allocated" className="bg-[#0b0f19]">Đã cấp phát (Allocated)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Dense Data Table */}
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
                    <th className="p-4 font-semibold">Mã tài sản</th>
                    <th className="p-4 font-semibold">Tên thiết bị/phần mềm/khóa học</th>
                    <th className="p-4 font-semibold">Chủng loại</th>
                    <th className="p-4 font-semibold">Vị trí Lab/Lưu trữ</th>
                    <th className="p-4 font-semibold">Tổng Slot</th>
                    <th className="p-4 font-semibold">Trạng thái</th>
                    <th className="p-4 font-semibold text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-300 divide-y divide-white/5">
                  {assets.length > 0 ? (
                    assets.map((asset) => (
                      <tr key={asset._id} className="hover:bg-white/[0.01] transition-all">
                        <td className="p-4 font-mono font-bold text-rose-400">{asset.astId}</td>
                        <td className="p-4">
                          <span className="font-semibold text-gray-200 block max-w-xs truncate">{asset.name}</span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5">
                            {getCategoryIcon(asset.category)}
                            {asset.category}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 max-w-[180px] truncate">{asset.location}</td>
                        <td className="p-4">
                          <span className="font-semibold text-gray-200">{asset.allocatedSlots}</span>
                          <span className="text-gray-500"> / {asset.totalSlots}</span>
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
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                            >
                              <Eye size={14} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteAsset(asset._id)}
                              disabled={user?.role !== 'Admin'}
                              title={user?.role === 'Admin' ? 'Xóa tài sản' : 'Chỉ Admin được xóa'}
                              className={`p-1.5 rounded-lg transition-all ${
                                user?.role === 'Admin'
                                  ? 'bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400'
                                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
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
                      <td colSpan="7" className="p-8 text-center text-gray-400">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle size={18} className="text-rose-400" />
              Thêm Tài Sản Số Mới
            </h3>
            <p className="text-xs text-gray-400 mt-1">Tạo mới tài nguyên phần mềm, khóa học hoặc tài liệu vào cơ sở dữ liệu</p>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Mã tài sản (AST-ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: AST-011"
                  value={newAsset.astId}
                  onChange={(e) => setNewAsset({ ...newAsset, astId: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Tên tài sản/thiết bị *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Microsoft Windows 11 Enterprise"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Chủng loại *
                  </label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-gray-300 focus:outline-none transition-all"
                  >
                    <option value="Software License" className="bg-[#0b0f19]">Software License</option>
                    <option value="Digital Course" className="bg-[#0b0f19]">Digital Course</option>
                    <option value="Digital Document" className="bg-[#0b0f19]">Digital Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Tổng số Slot khả dụng *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAsset.totalSlots}
                    onChange={(e) => setNewAsset({ ...newAsset, totalSlots: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Vị trí Lab / Đường dẫn lưu trữ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lab Room 302, Google Drive..."
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/10 focus:border-rose-500 rounded-xl text-sm text-white focus:outline-none transition-all"
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
                  onClick={() => setAddModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all border border-transparent hover:border-white/5"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-500/10 transition-all flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-2xl border border-white/10 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setDetailModal({ isOpen: false, asset: null })}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderLock size={18} className="text-rose-400" />
              Chi Tiết Tài Sản Số
            </h3>
            
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Mã tài sản (AST-ID):</span>
                <span className="font-mono font-bold text-gray-200">{detailModal.asset.astId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Tên tài sản:</span>
                <span className="font-semibold text-gray-200 text-right max-w-[240px]">{detailModal.asset.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Chủng loại:</span>
                <span className="text-gray-200 flex items-center gap-1">
                  {getCategoryIcon(detailModal.asset.category)}
                  {detailModal.asset.category}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Vị trí Lab / Lưu trữ:</span>
                <span className="text-gray-200 text-right max-w-[240px]">{detailModal.asset.location}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Phân bổ Slot:</span>
                <span className="text-gray-200 font-semibold">{detailModal.asset.allocatedSlots} / {detailModal.asset.totalSlots} Slots đã chiếm</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Trạng thái:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(detailModal.asset.status)}`}>
                  {getStatusTextVi(detailModal.asset.status)}
                </span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500">Ngày tạo bản ghi:</span>
                <span className="text-gray-400">{new Date(detailModal.asset.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setDetailModal({ isOpen: false, asset: null })}
              className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 font-semibold rounded-xl text-xs transition-all border border-white/5"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
