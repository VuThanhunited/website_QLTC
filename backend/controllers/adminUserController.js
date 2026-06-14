const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users (excluding passwords)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Create a new user directly
// @route   POST /api/admin/users
exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin.' });
    }

    // Kiểm tra định dạng email theo vai trò
    if (role === 'Student' && !email.endsWith('@sis.hust.edu.vn')) {
      return res.status(400).json({ message: 'Email sinh viên phải kết thúc bằng @sis.hust.edu.vn' });
    }
    if ((role === 'Lecturer' || role === 'Admin') && !email.endsWith('@hust.edu.vn')) {
      return res.status(400).json({ message: 'Email giảng viên/quản trị viên phải kết thúc bằng @hust.edu.vn' });
    }

    const exist = await User.findOne({ $or: [{ email }, { username }] });
    if (exist) {
      return res.status(400).json({ message: 'Tên tài khoản hoặc email đã tồn tại.' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADMIN_CREATE_USER',
      details: `Admin tạo tài khoản mới: ${username} (${role})`
    });

    res.status(201).json({
      message: 'Tạo người dùng thành công.',
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  try {
    if (!['Student', 'Lecturer', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò cập nhật không hợp lệ.' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Do not allow self-demotion
    if (targetUser._id.toString() === req.user.id.toString() && role !== 'Admin') {
      return res.status(400).json({ message: 'Bạn không thể tự hạ quyền Admin của chính mình.' });
    }

    const oldRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADMIN_UPDATE_USER_ROLE',
      details: `Admin đổi vai trò của ${targetUser.username} từ ${oldRole} sang ${role}`
    });

    res.json({ message: 'Cập nhật vai trò người dùng thành công.', user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Do not allow self-deletion
    if (targetUser._id.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình.' });
    }

    await User.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADMIN_DELETE_USER',
      details: `Admin xóa tài khoản người dùng: ${targetUser.username} (${targetUser.role})`
    });

    res.json({ message: 'Xóa tài khoản người dùng thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Get all lecturer users
// @route   GET /api/admin/lecturers
exports.getLecturers = async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'Lecturer' }).select('username email');
    res.json(lecturers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};
