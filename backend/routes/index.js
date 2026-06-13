const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const assetRoutes = require('./assetRoutes');
const requestRoutes = require('./requestRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const adminUserRoutes = require('./adminUserRoutes');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/assets', assetRoutes);
router.use('/requests', requestRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/admin/users', adminUserRoutes);

module.exports = router;
