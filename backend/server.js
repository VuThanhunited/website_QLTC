const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./models/User');
const Asset = require('./models/Asset');
const Request = require('./models/Request');
const AuditLog = require('./models/AuditLog');
const { auth, authorize, JWT_SECRET } = require('./middleware/auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// --- TỰ ĐỘNG KHỞI TẠO DỮ LIỆU MẪU (AUTO SEED FUNCTION) ---
async function autoSeed() {
  try {
    // Tạo Users
    const admin = new User({
      username: 'admin',
      email: 'admin@university.edu.vn',
      password: 'admin123',
      role: 'Admin'
    });

    const lecturer = new User({
      username: 'lecturer',
      email: 'lecturer@university.edu.vn',
      password: 'lecturer123',
      role: 'Lecturer'
    });

    const student = new User({
      username: 'student',
      email: 'student@university.edu.vn',
      password: 'student123',
      role: 'Student'
    });

    await admin.save();
    await lecturer.save();
    await student.save();

    // Tạo Assets
    const assets = [
      {
        astId: 'AST-001',
        name: 'MATLAB Campus-Wide License',
        category: 'Software License',
        location: 'Lab Room 302 / Cloud Portal',
        status: 'available',
        totalSlots: 100,
        allocatedSlots: 45
      },
      {
        astId: 'AST-002',
        name: 'AutoDesk AutoCAD 2026 Education',
        category: 'Software License',
        location: 'Lab Room 405',
        status: 'available',
        totalSlots: 50,
        allocatedSlots: 12
      },
      {
        astId: 'AST-003',
        name: 'JetBrains All Products Pack',
        category: 'Software License',
        location: 'Lab Room 201',
        status: 'allocated',
        totalSlots: 20,
        allocatedSlots: 20
      },
      {
        astId: 'AST-004',
        name: 'SolidWorks Premium Edition',
        category: 'Software License',
        location: 'Lab Room 304',
        status: 'maintaining',
        totalSlots: 10,
        allocatedSlots: 0
      },
      {
        astId: 'AST-005',
        name: 'Machine Learning & AI Basics Course',
        category: 'Digital Course',
        location: 'Moodle LMS - Course ID #1092',
        status: 'available',
        totalSlots: 200,
        allocatedSlots: 110
      },
      {
        astId: 'AST-006',
        name: 'Full-Stack React & Node.js Bootcamp',
        category: 'Digital Course',
        location: 'Coursera Partner Portal',
        status: 'available',
        totalSlots: 150,
        allocatedSlots: 85
      },
      {
        astId: 'AST-007',
        name: 'Introduction to Cybersecurity',
        category: 'Digital Course',
        location: 'Udemy Enterprise',
        status: 'allocated',
        totalSlots: 50,
        allocatedSlots: 50
      },
      {
        astId: 'AST-008',
        name: 'IEEE Research Paper Template (Docx/LaTeX)',
        category: 'Digital Document',
        location: 'Digital Library (Elib)',
        status: 'available',
        totalSlots: 1000,
        allocatedSlots: 320
      },
      {
        astId: 'AST-009',
        name: 'CS301 Data Structures & Algorithms Slide Lecture',
        category: 'Digital Document',
        location: 'Google Shared Drive - FIT',
        status: 'available',
        totalSlots: 500,
        allocatedSlots: 150
      },
      {
        astId: 'AST-010',
        name: 'University Graduation Thesis Guideline 2026',
        category: 'Digital Document',
        location: 'Academic Office Portal',
        status: 'available',
        totalSlots: 1000,
        allocatedSlots: 780
      }
    ];

    const savedAssets = [];
    for (const a of assets) {
      const savedAsset = await Asset.create(a);
      savedAssets.push(savedAsset);
    }

    // Tạo Requests
    const requests = [
      {
        userId: student._id,
        assetId: savedAssets[0]._id, // MATLAB
        type: 'borrow',
        status: 'pending',
        notes: 'Em cần bản quyền MATLAB để làm bài tập lớn môn Xử lý tín hiệu số.',
        durationDays: 30
      },
      {
        userId: student._id,
        assetId: savedAssets[4]._id, // Machine Learning
        type: 'borrow',
        status: 'approved',
        notes: 'Đăng ký học phần AI đại cương.',
        durationDays: 60,
        actionBy: lecturer._id,
        actionDate: new Date()
      },
      {
        userId: student._id,
        assetId: savedAssets[2]._id, // JetBrains
        type: 'extend',
        status: 'pending',
        notes: 'Dự án nghiên cứu khoa học kéo dài thêm 1 tháng, em xin gia hạn dùng IntelliJ.',
        durationDays: 30
      }
    ];

    for (const r of requests) {
      await Request.create(r);
    }

    // Tạo Audit Logs
    const auditLogs = [
      {
        userId: admin._id,
        username: admin.username,
        role: admin.role,
        action: 'DATABASE_INITIALIZATION',
        details: 'Khởi tạo cơ sở dữ liệu và tự động seed dữ liệu mẫu.'
      },
      {
        userId: student._id,
        username: student.username,
        role: student.role,
        action: 'LOGIN',
        details: 'Đăng nhập vào hệ thống.'
      },
      {
        userId: student._id,
        username: student.username,
        role: student.role,
        action: 'SEARCH',
        details: 'Tìm kiếm từ khóa: "MATLAB"'
      }
    ];

    for (const log of auditLogs) {
      await AuditLog.create(log);
    }

    console.log('=== TỰ ĐỘNG SEED DỮ LIỆU THÀNH CÔNG ===');
  } catch (error) {
    console.error('Lỗi khi tự động seed dữ liệu:', error);
  }
}


// --- API XÁC THỰC (AUTH API) ---

app.post('/api/auth/login', async (req, res) => {
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
});

app.post('/api/auth/register', async (req, res) => {
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
});


// --- API BẢNG ĐIỀU KHIỂN (DASHBOARD STATS) ---

app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    const assets = await Asset.find({ is_deleted: false });
    
    let totalAssets = assets.length;
    let availableSlots = 0;
    let allocatedSlots = 0;

    assets.forEach(asset => {
      availableSlots += (asset.totalSlots - asset.allocatedSlots);
      allocatedSlots += asset.allocatedSlots;
    });

    res.json({
      totalAssets,
      availableSlots: Math.max(0, availableSlots),
      allocatedSlots
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});


// --- API TÀI SẢN SỐ (ASSETS API - Search-Centric) ---

app.get('/api/assets', auth, async (req, res) => {
  const { search, category, status } = req.query;
  try {
    let query = { is_deleted: false };

    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { astId: searchRegex },
        { name: searchRegex },
        { location: searchRegex },
        { category: searchRegex }
      ];

      await AuditLog.create({
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        action: 'SEARCH',
        details: `Tìm kiếm từ khóa: "${search.trim()}"`
      });
    }

    const assets = await Asset.find(query).sort({ astId: 1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});

app.post('/api/assets', auth, authorize('Admin'), async (req, res) => {
  const { astId, name, category, location, totalSlots } = req.body;
  try {
    const exist = await Asset.findOne({ astId });
    if (exist) {
      return res.status(400).json({ message: `Mã tài sản ${astId} đã tồn tại trong cơ sở dữ liệu.` });
    }

    const newAsset = new Asset({
      astId,
      name,
      category,
      location,
      totalSlots: totalSlots || 1,
      allocatedSlots: 0,
      status: 'available'
    });

    await newAsset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'ADD_ASSET',
      details: `Thêm tài sản mới: [${astId}] ${name}`
    });

    res.status(201).json(newAsset);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});

app.delete('/api/assets/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Không tìm thấy tài sản này.' });
    }

    asset.is_deleted = true;
    await asset.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'DELETE_ASSET',
      details: `Xóa mềm tài sản: [${asset.astId}] ${asset.name}`
    });

    res.json({ message: 'Xóa mềm tài sản thành công.', asset });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});


// --- API YÊU CẦU MƯỢN/TRẢ/GIA HẠN (REQUESTS API) ---

app.post('/api/requests', auth, async (req, res) => {
  const { assetId, type, durationDays, notes } = req.body;
  try {
    const asset = await Asset.findOne({ _id: assetId, is_deleted: false });
    if (!asset) {
      return res.status(404).json({ message: 'Tài sản số không tồn tại hoặc đã bị xóa.' });
    }

    if (type === 'borrow' && asset.status === 'maintaining') {
      return res.status(400).json({ message: 'Tài sản đang được bảo trì, không thể mượn.' });
    }

    if (type === 'borrow' && asset.status === 'allocated' && (asset.totalSlots - asset.allocatedSlots) <= 0) {
      return res.status(400).json({ message: 'Số lượng bản quyền/slot hiện đã hết.' });
    }

    const newRequest = new Request({
      userId: req.user.id,
      assetId,
      type,
      durationDays: durationDays || 30,
      notes,
      status: 'pending'
    });

    await newRequest.save();

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: 'CREATE_REQUEST',
      details: `Tạo yêu cầu ${type} tài sản ${asset.name}`
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});

app.get('/api/requests', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Student') {
      query.userId = req.user.id;
    }

    const requests = await Request.find(query)
      .populate('userId', 'username email role')
      .populate('assetId', 'astId name category status totalSlots allocatedSlots')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});

app.post('/api/requests/:id/action', auth, authorize(['Lecturer', 'Admin']), async (req, res) => {
  const { action } = req.body;
  try {
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Hành động duyệt không hợp lệ.' });
    }

    const request = await Request.findById(req.params.id)
      .populate('assetId')
      .populate('userId');
      
    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu này.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý trước đó.' });
    }

    request.status = action;
    request.actionBy = req.user.id;
    request.actionDate = new Date();
    await request.save();

    if (action === 'approved') {
      const asset = request.assetId;
      if (request.type === 'borrow') {
        asset.allocatedSlots += 1;
        if (asset.allocatedSlots >= asset.totalSlots) {
          asset.status = 'allocated';
        }
      } else if (request.type === 'return') {
        asset.allocatedSlots = Math.max(0, asset.allocatedSlots - 1);
        if (asset.allocatedSlots < asset.totalSlots && asset.status === 'allocated') {
          asset.status = 'available';
        }
      }
      await asset.save();
    }

    await AuditLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: action === 'approved' ? 'APPROVE_REQUEST' : 'REJECT_REQUEST',
      details: `Đã ${action === 'approved' ? 'duyệt' : 'từ chối'} yêu cầu ${request.type} tài sản ${request.assetId.name} của ${request.userId.username}`
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});

app.get('/api/audit-logs', auth, authorize('Admin'), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});

// --- API QUẢN TRỊ NGƯỜI DÙNG (ADMIN USER MANAGEMENT - Admin only) ---

// Lấy toàn bộ danh sách người dùng
app.get('/api/admin/users', auth, authorize('Admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.', error: error.message });
  }
});

// Thêm mới người dùng trực tiếp
app.post('/api/admin/users', auth, authorize('Admin'), async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các thông tin.' });
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
});

// Thay đổi vai trò của người dùng
app.put('/api/admin/users/:id/role', auth, authorize('Admin'), async (req, res) => {
  const { role } = req.body;
  try {
    if (!['Student', 'Lecturer', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Vai trò cập nhật không hợp lệ.' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Không cho phép tự hạ quyền của chính mình
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
});

// Xóa tài khoản người dùng
app.delete('/api/admin/users/:id', auth, authorize('Admin'), async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Không được tự xóa tài khoản của chính mình
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
});


// --- KHỞI CHẠY HỆ THỐNG VÀ KẾT NỐI DB ---
async function startServer() {
  let dbUri = process.env.MONGODB_URI;

  // Tự động khởi tạo In-Memory Server nếu không kết nối được hoặc để mặc định
  if (!dbUri || dbUri.includes('127.0.0.1') || dbUri.includes('localhost')) {
    try {
      console.log('Đang khởi tạo MongoDB In-Memory Server cho chế độ nhà phát triển...');
      const mongoServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'university-assets'
        }
      });
      dbUri = mongoServer.getUri();
      console.log(`MongoDB In-Memory đang chạy tại: ${dbUri}`);
    } catch (err) {
      console.log('Không thể khởi tạo MongoDB In-Memory Server (cổng 27017 bận hoặc MongoDB đã chạy sẵn). Thử kết nối trực tiếp...');
      dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/university-assets';
    }
  }

  try {
    await mongoose.connect(dbUri);
    console.log('Đã kết nối cơ sở dữ liệu MongoDB thành công.');

    // Kiểm tra và seed dữ liệu nếu cơ sở dữ liệu rỗng
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Phát hiện cơ sở dữ liệu trống. Đang tự động seed dữ liệu mẫu...');
      await autoSeed();
    }

    app.listen(PORT, () => {
      console.log(`=== SERVER BACKEND ĐANG CHẠY TẠI http://localhost:${PORT} ===`);
    });
  } catch (err) {
    console.error('Lỗi nghiêm trọng khi khởi động Server:', err);
    process.exit(1);
  }
}

startServer();
