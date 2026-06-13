const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('Admin'), auditLogController.getLogs);

module.exports = router;
