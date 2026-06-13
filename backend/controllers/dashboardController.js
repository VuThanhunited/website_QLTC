const Asset = require('../models/Asset');

// @desc    Get dashboard metrics
// @route   GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const assets = await Asset.find({ is_deleted: false });
    
    let totalAssets = assets.length;
    let availableSlots = 0;
    let allocatedSlots = 0;

    assets.forEach(asset => {
      availableSlots += (asset.totalSlots - asset.allocatedSlots);
      allocatedSlots += asset.allocatedSlots;
    });

    res.json({
      totalAssets,
      availableSlots: Math.max(0, availableSlots),
      allocatedSlots
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};
