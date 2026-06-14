const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');

// @desc    Get all assets (with search & filtering)
// @route   GET /api/assets
exports.getAssets = async (req, res) => {
  const { search, category, status } = req.query;
  try {
    let query = { is_deleted: false };

    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { astId: searchRegex },
        { name: searchRegex },
        { location: searchRegex },
        { category: searchRegex }
      ];

      await AuditLog.create({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'SEARCH',
        details: `Tìm kiếm từ khóa: "${search.trim()}"`
      });
    }

    const assets = await Asset.find(query).populate('managedBy', 'username email').sort({ astId: 1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Create a new asset
// @route   POST /api/assets
exports.createAsset = async (req, res) => {
  const { astId, name, category, location, totalSlots } = req.body;
  try {
    const exist = await Asset.findOne({ astId });
    if (exist) {
      return res.status(400).json({ message: `Mã tài sản ${astId} đã tồn tại trong cơ sở dữ liệu.` });
    }

    const newAsset = new Asset({
      astId,
      name,
      category,
      location,
      totalSlots: totalSlots || 1,
      allocatedSlots: 0,
      status: 'available'
    });

    await newAsset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADD_ASSET',
      details: `Thêm tài sản mới: [${astId}] ${name}`
    });

    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Soft delete an asset
// @route   DELETE /api/assets/:id
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản này.' });
    }

    asset.is_deleted = true;
    await asset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DELETE_ASSET',
      details: `Xóa mềm tài sản: [${asset.astId}] ${asset.name}`
    });

    res.json({ message: 'Xóa mềm tài sản thành công.', asset });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Lecturer registers/proposes to manage an asset
// @route   PUT /api/assets/:id/propose-manager
exports.proposeManager = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản này.' });
    }

    if (asset.managedBy) {
      return res.status(400).json({ message: 'Tài sản này đã có người đăng ký quản lý hoặc đã được duyệt.' });
    }

    asset.managedBy = req.user.id;
    asset.isManagerApproved = false;
    await asset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'PROPOSE_ASSET_MANAGER',
      details: `Giảng viên đăng ký quản lý tài sản: [${asset.astId}] ${asset.name}`
    });

    res.json({ message: 'Đăng ký quản lý tài sản thành công. Chờ Admin phê duyệt.', asset });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Admin approves lecturer management proposal
// @route   PUT /api/assets/:id/approve-manager
exports.approveManager = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('managedBy', 'username');
    if (!asset) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản.' });
    }

    if (!asset.managedBy) {
      return res.status(400).json({ message: 'Tài sản này chưa được giảng viên nào đăng ký quản lý.' });
    }

    asset.isManagerApproved = true;
    await asset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'APPROVE_ASSET_MANAGER',
      details: `Admin phê duyệt giảng viên ${asset.managedBy.username} quản lý tài sản [${asset.astId}] ${asset.name}`
    });

    res.json({ message: 'Phê duyệt quản lý tài sản thành công.', asset });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Admin rejects manager proposal or removes manager
// @route   PUT /api/assets/:id/reject-manager
exports.rejectManager = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản.' });
    }

    asset.managedBy = null;
    asset.isManagerApproved = false;
    await asset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'REJECT_ASSET_MANAGER',
      details: `Admin hủy bỏ/từ chối phân quyền quản lý tài sản [${asset.astId}] ${asset.name}`
    });

    res.json({ message: 'Từ chối/Hủy bỏ quản lý thành công.', asset });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Admin directly assigns lecturer to manage an asset
// @route   PUT /api/assets/:id/assign-manager
exports.assignManager = async (req, res) => {
  const { lecturerId } = req.body;
  try {
    if (!lecturerId) {
      return res.status(400).json({ message: 'Vui lòng cung cấp ID giảng viên.' });
    }

    const lecturer = await User.findOne({ _id: lecturerId, role: 'Lecturer' });
    if (!lecturer) {
      return res.status(404).json({ message: 'Không tìm thấy giảng viên hợp lệ.' });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản.' });
    }

    asset.managedBy = lecturerId;
    asset.isManagerApproved = true;
    await asset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ASSIGN_ASSET_MANAGER',
      details: `Admin phân công giảng viên ${lecturer.username} quản lý tài sản [${asset.astId}] ${asset.name}`
    });

    res.json({ message: 'Phân công quản lý thành công.', asset });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};
