const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { JWT_SECRET } = require('../middleware/auth');

// @desc    User login
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại trên hệ thống.' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu đăng nhập không chính xác.' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await AuditLog.create({
      userId: user._id,
      username: user.username,
      role: user.role,
      action: 'LOGIN',
      details: `Người dùng đăng nhập thành công với vai trò ${user.role}`
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    User registration
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // Kiểm tra định dạng email theo vai trò
    if (role === 'Student' && !email.endsWith('@sis.hust.edu.vn')) {
      return res.status(400).json({ message: 'Email sinh viên phải kết thúc bằng @sis.hust.edu.vn' });
    }
    if ((role === 'Lecturer' || role === 'Admin') && !email.endsWith('@hust.edu.vn')) {
      return res.status(400).json({ message: 'Email giảng viên/quản trị viên phải kết thúc bằng @hust.edu.vn' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Tên tài khoản hoặc email đã tồn tại.' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({ message: 'Đăng ký tài khoản thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại để xác minh danh tính.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản.' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
    }

    // If updating username, check duplicates
    if (username && username !== user.username) {
      const existUsername = await User.findOne({ username });
      if (existUsername) {
        return res.status(400).json({ message: 'Tên tài khoản đã tồn tại.' });
      }
      user.username = username;
    }

    // If updating email, check format according to role and check duplicates
    if (email && email !== user.email) {
      if (user.role === 'Student' && !email.endsWith('@sis.hust.edu.vn')) {
        return res.status(400).json({ message: 'Email sinh viên phải kết thúc bằng @sis.hust.edu.vn' });
      }
      if ((user.role === 'Lecturer' || user.role === 'Admin') && !email.endsWith('@hust.edu.vn')) {
        return res.status(400).json({ message: 'Email giảng viên/quản trị viên phải kết thúc bằng @hust.edu.vn' });
      }

      const existEmail = await User.findOne({ email });
      if (existEmail) {
        return res.status(400).json({ message: 'Email đã tồn tại.' });
      }
      user.email = email;
    }

    // If changing password, set it
    if (newPassword) {
      user.password = newPassword; // triggers pre('save') hashing
    }

    await user.save();

    await AuditLog.create({
      userId: user._id,
      username: user.username,
      role: user.role,
      action: 'UPDATE_PROFILE',
      details: `Người dùng tự cập nhật thông tin tài khoản cá nhân. Đổi mật khẩu: ${newPassword ? 'Có' : 'Không'}`
    });

    // Generate a new JWT token with updated info
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Cập nhật thông tin cá nhân thành công.',
      user: { id: user._id, username: user.username, email: user.email, role: user.role, status: user.status },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
};

