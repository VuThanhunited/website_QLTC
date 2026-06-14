require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Request = require('./models/Request');
const AuditLog = require('./models/AuditLog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/university-assets';

const seedDatabase = async () => {
  try {
    console.log('Đang kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Kết nối thành công! Đang dọn dẹp cơ sở dữ liệu...');

    // Clear collections
    await User.deleteMany({});
    await Asset.deleteMany({});
    await Request.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Đang tạo người dùng mẫu...');
    // Create Users (password will be hashed by mongoose pre-save hook)
    const admin = new User({
      username: 'admin',
      email: 'admin@hust.edu.vn',
      password: 'admin123',
      role: 'Admin'
    });

    const lecturer = new User({
      username: 'lecturer',
      email: 'lecturer@hust.edu.vn',
      password: 'lecturer123',
      role: 'Lecturer'
    });

    const student = new User({
      username: 'student',
      email: 'student@sis.hust.edu.vn',
      password: 'student123',
      role: 'Student'
    });

    await admin.save();
    await lecturer.save();
    await student.save();
    console.log('Tạo người dùng thành công!');

    console.log('Đang tạo tài sản số mẫu...');
    // Create Assets
    const assets = [
      // Software Licenses
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

      // Digital Courses
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

      // Digital Documents
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
    for (let i = 0; i < assets.length; i++) {
      const a = assets[i];
      if (i === 0 || i === 4) {
        a.managedBy = lecturer._id;
        a.isManagerApproved = true;
      }
      const savedAsset = await Asset.create(a);
      savedAssets.push(savedAsset);
    }
    console.log('Tạo tài sản số thành công!');

    console.log('Đang tạo đơn yêu cầu mẫu...');
    // Create Requests
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
        assetId: savedAssets[4]._id, // Machine Learning Course
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
    console.log('Tạo đơn yêu cầu thành công!');

    console.log('Đang tạo nhật ký kiểm toán mẫu...');
    // Create Audit Logs
    const auditLogs = [
      {
        userId: admin._id,
        username: admin.username,
        role: admin.role,
        action: 'DATABASE_INITIALIZATION',
        details: 'Khởi tạo cơ sở dữ liệu và seed dữ liệu mẫu.'
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
      },
      {
        userId: student._id,
        username: student.username,
        role: student.role,
        action: 'CREATE_REQUEST',
        details: `Tạo yêu cầu mượn tài sản AST-001 (MATLAB Campus-Wide License)`
      }
    ];

    for (const log of auditLogs) {
      await AuditLog.create(log);
    }
    console.log('Tạo nhật ký thành công!');

    console.log('=== SEEDING CƠ SỞ DỮ LIỆU HOÀN TẤT THÀNH CÔNG ===');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedDatabase();
