const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, assetController.getAssets);
router.post('/', auth, authorize('Admin'), assetController.createAsset);
router.delete('/:id', auth, authorize('Admin'), assetController.deleteAsset);

// Asset ownership proposal & approval routes
router.put('/:id/propose-manager', auth, authorize('Lecturer'), assetController.proposeManager);
router.put('/:id/approve-manager', auth, authorize('Admin'), assetController.approveManager);
router.put('/:id/reject-manager', auth, authorize('Admin'), assetController.rejectManager);
router.put('/:id/assign-manager', auth, authorize('Admin'), assetController.assignManager);

module.exports = router;
