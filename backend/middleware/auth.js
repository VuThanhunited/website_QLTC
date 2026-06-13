const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'university_digital_asset_secret_key_123';

// Middleware xác thực Token JWT
const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Không tìm thấy token xác thực. Truy cập bị từ chối.' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

// Middleware phân quyền dựa trên Role
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Không thể xác định danh tính.' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Tài khoản với vai trò '${req.user.role}' không được phép thực hiện tác vụ này.` 
      });
    }

    next();
  };
};

module.exports = { auth, authorize, JWT_SECRET };
