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
    } else if (req.user.role === 'Lecturer') {
      const managedAssets = await Asset.find({ managedBy: req.user.id, isManagerApproved: true, is_deleted: false });
      const assetIds = managedAssets.map(a => a._id);
      query.assetId = { $in: assetIds };
    }

    const requests = await Request.find(query)
      .populate('userId', 'username email role')
      .populate('assetId', 'astId name category status totalSlots allocatedSlots managedBy isManagerApproved')
      .populate('actionBy', 'username role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Process approval/rejection/reversion of a request
// @route   POST /api/requests/:id/action
exports.processAction = async (req, res) => {
  const { action } = req.body;
  try {
    if (!['approved', 'rejected', 'pending'].includes(action)) {
      return res.status(400).json({ message: 'Hành động duyệt không hợp lệ.' });
    }

    const request = await Request.findById(req.params.id)
      .populate('assetId')
      .populate('userId');
      
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu này.' });
    }

    // Kiểm tra phân quyền: Chỉ giảng viên quản lý tài sản đã được duyệt mới có quyền duyệt/từ chối/hoàn tác
    const asset = request.assetId;
    if (!asset || !asset.managedBy || asset.managedBy.toString() !== req.user.id.toString() || !asset.isManagerApproved) {
      return res.status(403).json({ message: 'Bạn không quản lý tài sản này nên không thể duyệt yêu cầu của sinh viên.' });
    }

    const oldStatus = request.status;
    if (oldStatus === action) {
      return res.status(400).json({ message: 'Trạng thái mới trùng với trạng thái hiện tại.' });
    }

    // 1. Nếu trạng thái cũ đã được duyệt (approved), cần hoàn trả số lượng slot phân bổ (allocatedSlots)
    if (oldStatus === 'approved') {
      if (request.type === 'borrow') {
        asset.allocatedSlots = Math.max(0, asset.allocatedSlots - 1);
        if (asset.allocatedSlots < asset.totalSlots && asset.status === 'allocated') {
          asset.status = 'available';
        }
      } else if (request.type === 'return') {
        asset.allocatedSlots += 1;
        if (asset.allocatedSlots >= asset.totalSlots) {
          asset.status = 'allocated';
        }
      }
      await asset.save();
    }

    // 2. Nếu trạng thái mới là đã duyệt (approved), cần tăng/giảm số lượng slot tương ứng
    if (action === 'approved') {
      if (request.type === 'borrow') {
        // Kiểm tra xem còn slot trống hay không trước khi phê duyệt
        if ((asset.totalSlots - asset.allocatedSlots) <= 0) {
          return res.status(400).json({ message: 'Số lượng bản quyền/slot hiện đã hết, không thể phê duyệt.' });
        }
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

    // 3. Cập nhật các trường thông tin của yêu cầu
    request.status = action;
    if (action === 'pending') {
      request.actionBy = null;
      request.actionDate = null;
    } else {
      request.actionBy = req.user.id;
      request.actionDate = new Date();
    }
    await request.save();

    // 4. Ghi nhận log
    let auditAction = '';
    if (action === 'approved') auditAction = 'APPROVE_REQUEST';
    else if (action === 'rejected') auditAction = 'REJECT_REQUEST';
    else auditAction = 'REVERT_REQUEST';

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: auditAction,
      details: `Đã ${action === 'approved' ? 'duyệt' : action === 'rejected' ? 'từ chối' : 'hoàn tác về chờ duyệt'} yêu cầu ${request.type} tài sản ${request.assetId.name} của ${request.userId.username}`
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};
