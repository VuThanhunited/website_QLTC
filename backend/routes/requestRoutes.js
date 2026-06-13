const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, requestController.createRequest);
router.get('/', auth, requestController.getRequests);
router.post('/:id/action', auth, authorize(['Lecturer', 'Admin']), requestController.processAction);

module.exports = router;
