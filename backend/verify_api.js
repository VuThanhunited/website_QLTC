const BASE_URL = process.env.API_URL || 'https://website-qltc.onrender.com/api';

async function runTests() {
  console.log('=== KHỞI ĐẦU CHƯƠNG TRÌNH KIỂM THỬ TỰ ĐỘNG API (NATIVE FETCH) ===');
  
  let studentToken, lecturerToken, adminToken;
  let createdAssetId, createdRequestId;

  try {
    // Helper to simplify fetch with JSON
    const request = async (url, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };
      
      const res = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw { status: res.status, data };
      }
      return data;
    };

    // 1. Kiểm thử Đăng nhập (UC-01)
    console.log('\n[1] Kiểm thử đăng nhập các vai trò (RBAC Authentications)...');
    
    const studentLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'student@sis.hust.edu.vn',
        password: 'student123'
      }
    });
    studentToken = studentLogin.token;
    console.log('✔ Đăng nhập Sinh viên thành công! Role:', studentLogin.user.role);

    const lecturerLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'lecturer@hust.edu.vn',
        password: 'lecturer123'
      }
    });
    lecturerToken = lecturerLogin.token;
    console.log('✔ Đăng nhập Giảng viên thành công! Role:', lecturerLogin.user.role);

    const adminLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@hust.edu.vn',
        password: 'admin123'
      }
    });
    adminToken = adminLogin.token;
    console.log('✔ Đăng nhập Admin thành công! Role:', adminLogin.user.role);

    // 2. Tra cứu & Tìm kiếm vạn năng (UC-02)
    console.log('\n[2] Kiểm thử tìm kiếm vạn năng (Universal Search)...');
    const searchRes = await request(`${BASE_URL}/assets?search=MATLAB`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log(`✔ Sinh viên tìm kiếm từ khóa "MATLAB". Kết quả tìm thấy: ${searchRes.length} tài sản.`);
    if (searchRes.length > 0) {
      console.log(`   Tên tài sản tìm thấy: "${searchRes[0].name}"`);
    }

    // Lấy ID tài sản để mượn
    const matlabAsset = searchRes[0];

    // 3. Khởi tạo đơn mượn (UC-03)
    console.log('\n[3] Khởi tạo đơn mượn tài sản số (Sinh viên)...');
    const requestRes = await request(`${BASE_URL}/requests`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        assetId: matlabAsset._id,
        type: 'borrow',
        durationDays: 30,
        notes: 'Kiểm thử tạo đơn mượn qua API'
      }
    });
    createdRequestId = requestRes._id;
    console.log('✔ Khởi tạo đơn mượn thành công! ID Đơn:', createdRequestId);

    // 4. Phê duyệt đơn hàng (UC-05)
    console.log('\n[4] Phê duyệt đơn mượn tài sản số (Giảng viên)...');
    const approveRes = await request(`${BASE_URL}/requests/${createdRequestId}/action`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${lecturerToken}` },
      body: { action: 'approved' }
    });
    console.log('✔ Phê duyệt đơn thành công! Trạng thái đơn:', approveRes.status);

    // 5. Thêm mới tài sản (Admin only - UC-06)
    console.log('\n[5] Thêm tài sản mới (Admin)...');
    const tempAstId = 'AST-' + Math.floor(100 + Math.random() * 900);
    const addAssetRes = await request(`${BASE_URL}/assets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        astId: tempAstId,
        name: 'GitHub Copilot Business Plan',
        category: 'Software License',
        location: 'GitHub Cloud Portal',
        totalSlots: 10
      }
    });
    createdAssetId = addAssetRes._id;
    console.log(`✔ Thêm tài sản thành công! Mã: ${addAssetRes.astId}, Tên: "${addAssetRes.name}"`);

    // Kiểm tra chặn quyền thêm tài sản (Sinh viên)
    try {
      await request(`${BASE_URL}/assets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken}` },
        body: {
          astId: 'AST-999',
          name: 'Hacked Asset',
          category: 'Software License',
          location: 'Nowhere',
          totalSlots: 1
        }
      });
      console.log('❌ LỖI: Sinh viên vẫn có thể thêm tài sản! Thất bại.');
    } catch (err) {
      console.log('✔ Chặn Sinh viên thêm tài sản thành công! Status:', err.status, '-', err.data?.message);
    }

    // 6. Xóa mềm tài sản (Admin only - UC-07)
    console.log('\n[6] Xóa mềm tài sản (Admin)...');
    const deleteRes = await request(`${BASE_URL}/assets/${createdAssetId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✔ Xóa mềm tài sản thành công! Trạng thái is_deleted:', deleteRes.asset.is_deleted);

    // Kiểm tra chặn quyền xóa tài sản (Giảng viên)
    try {
      await request(`${BASE_URL}/assets/${createdAssetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${lecturerToken}` }
      });
      console.log('❌ LỖI: Giảng viên vẫn có thể xóa tài sản! Thất bại.');
    } catch (err) {
      console.log('✔ Chặn Giảng viên xóa tài sản thành công! Status:', err.status, '-', err.data?.message);
    }

    // 7. Khai thác dữ liệu Nhật ký kiểm toán (Admin only - UC-08)
    console.log('\n[7] Khai thác Nhật ký kiểm toán (Audit Logs - Admin)...');
    const logsRes = await request(`${BASE_URL}/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✔ Đọc thành công ${logsRes.length} dòng nhật ký hoạt động.`);
    console.log('   Dòng log gần nhất:', logsRes[0].action, '-', logsRes[0].details);

    // 8. Quản lý Người dùng (Admin only)
    console.log('\n[8] Kiểm thử Quản lý tài khoản người dùng (Admin CRUD & RBAC)...');
    
    // Admin lấy danh sách người dùng
    const usersList = await request(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✔ Admin lấy danh sách người dùng thành công! Tổng số: ${usersList.length} tài khoản.`);

    // Sinh viên thử lấy danh sách -> Bị chặn
    try {
      await request(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('❌ LỖI: Sinh viên vẫn lấy được danh sách tài khoản!');
    } catch (err) {
      console.log('✔ Chặn Sinh viên truy cập danh sách người dùng thành công! Status:', err.status, '-', err.data?.message);
    }

    // Admin tạo tài khoản mới
    const tempUsername = `testuser_${Date.now()}`;
    const createUserRes = await request(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        username: tempUsername,
        email: `${tempUsername}@sis.hust.edu.vn`,
        password: 'password123',
        role: 'Student'
      }
    });
    const createdUserId = createUserRes.user.id;
    console.log(`✔ Admin tạo tài khoản "${tempUsername}" thành công! ID:`, createdUserId);

    // Admin thay đổi vai trò
    const updateRoleRes = await request(`${BASE_URL}/admin/users/${createdUserId}/role`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { role: 'Lecturer' }
    });
    console.log(`✔ Admin nâng quyền người dùng thành công! Vai trò mới: ${updateRoleRes.user.role}`);

    // Admin xóa tài khoản vừa tạo
    const deleteUserRes = await request(`${BASE_URL}/admin/users/${createdUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✔ Admin xóa tài khoản thành công! Phản hồi:', deleteUserRes.message);

    console.log('\n=== TẤT CẢ CÁC BƯỚC THỬ NGHIỆM ĐỀU THÀNH CÔNG RỰC RỠ! ===');
  } catch (error) {
    console.error('❌ LỖI THỬ NGHIỆM API:', error.data || error.message || error);
  }
}

runTests();
