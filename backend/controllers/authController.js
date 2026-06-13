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
