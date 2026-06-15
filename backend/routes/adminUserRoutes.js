const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { auth, authorize } = require('../middleware/auth');

// All routes require Admin authorization
router.use(auth, authorize('Admin'));

router.get('/', adminUserController.getAllUsers);
router.post('/', adminUserController.createUser);
router.put('/:id', adminUserController.updateUser);
router.put('/:id/role', adminUserController.updateUserRole);
router.get('/lecturers', adminUserController.getLecturers);
router.delete('/:id', adminUserController.deleteUser);

module.exports = router;
