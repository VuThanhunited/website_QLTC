const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, assetController.getAssets);
router.post('/', auth, authorize('Admin'), assetController.createAsset);
router.delete('/:id', auth, authorize('Admin'), assetController.deleteAsset);

module.exports = router;
