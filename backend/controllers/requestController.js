const Request = require('../models/Request');
const Asset = require('../models/Asset');
const AuditLog = require('../models/AuditLog');

// @desc    Create a new borrow/return/extend request
// @route   POST /api/requests
exports.createRequest = async (req, res) => {
  const { assetId, type, durationDays, notes } = req.body;
  try {
    const asset = await Asset.findOne({ _id: assetId, is_deleted: false });
    if (!asset) {
      return res.status(404).json({ message: 'Tài sản số không tồn tại hoặc đã bị xóa.' });
    }

    if (type === 'borrow' && asset.status === 'maintaining') {
      return res.status(400).json({ message: 'Tài sản đang được bảo trì, không thể mượn.' });
    }

    if (type === 'borrow' && asset.status === 'allocated' && (asset.totalSlots - asset.allocatedSlots) <= 0) {
      return res.status(400).json({ message: 'Số lượng bản quyền/slot hiện đã hết.' });
    }

    const newRequest = new Request({
      userId: req.user.id,
      assetId,
      type,
      durationDays: durationDays || 30,
      notes,
      status: 'pending'
    });

    await newRequest.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CREATE_REQUEST',
      details: `Tạo yêu cầu ${type} tài sản ${asset.name}`
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Get requests list
// @route   GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Student') {
      query.userId = req.user.id;
    }

    const requests = await Request.find(query)
      .populate('userId', 'username email role')
      .populate('assetId', 'astId name category status totalSlots allocatedSlots')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Process approval/rejection of a request
// @route   POST /api/requests/:id/action
exports.processAction = async (req, res) => {
  const { action } = req.body;
  try {
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Hành động duyệt không hợp lệ.' });
    }

    const request = await Request.findById(req.params.id)
      .populate('assetId')
      .populate('userId');
      
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu này.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý trước đó.' });
    }

    request.status = action;
    request.actionBy = req.user.id;
    request.actionDate = new Date();
    await request.save();

    if (action === 'approved') {
      const asset = request.assetId;
      if (request.type === 'borrow') {
        asset.allocatedSlots += 1;
        if (asset.allocatedSlots >= asset.totalSlots) {
          asset.status = 'allocated';
        }
      } else if (request.type === 'return') {
        asset.allocatedSlots = Math.max(0, asset.allocatedSlots - 1);
        if (asset.allocatedSlots < asset.totalSlots && asset.status === 'allocated') {
          asset.status = 'available';
        }
      }
      await asset.save();
    }

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: action === 'approved' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
      details: `Đã ${action === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu ${request.type} tài sản ${request.assetId.name} của ${request.userId.username}`
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};
