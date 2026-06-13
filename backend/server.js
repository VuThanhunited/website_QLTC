const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./models/User');
const Asset = require('./models/Asset');
const Request = require('./models/Request');
const AuditLog = require('./models/AuditLog');

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

// --- ROUTING SYSTEM ---
const apiRouter = require('./routes');
app.use('/api', apiRouter);

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
