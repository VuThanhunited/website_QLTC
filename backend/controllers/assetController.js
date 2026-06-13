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

    const assets = await Asset.find(query).sort({ astId: 1 });
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
