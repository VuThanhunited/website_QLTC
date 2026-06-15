const AuditLog = require('../models/AuditLog');

// @desc    Get audit logs
// @route   GET /api/audit-logs
exports.getLogs = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      query.userId = req.user.id;
      query.action = { $nin: ['LOGIN', 'SEARCH'] };
    }
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};
