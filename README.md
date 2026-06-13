# Website Quản Lý Tài Chính (QLTC) - Quản lý Tài sản Số

Dự án quản lý tài sản số dành cho trường đại học, bao gồm cổng thông tin cho sinh viên, giảng viên và quản trị viên.

## 🔗 Liên kết triển khai (Deployment Links)

* **Cổng Frontend (Người dùng/Sinh viên/Giảng viên)**: [https://website-qltc.vercel.app](https://website-qltc.vercel.app)
* **Cổng Backend API**: [https://website-qltc.onrender.com](https://website-qltc.onrender.com)
* **Kho lưu trữ GitHub**: [https://github.com/VuThanhunited/website_QLTC](https://github.com/VuThanhunited/website_QLTC)

---

## 📁 Cấu trúc dự án

Dự án được chia làm 3 phần chính:

1. **`frontend/`**: Ứng dụng ReactJS (sử dụng Vite + Tailwind CSS) dành cho Sinh viên và Giảng viên để thực hiện tìm kiếm tài sản số, tạo yêu cầu mượn/trả và duyệt yêu cầu.
2. **`admin/`**: Ứng dụng ReactJS (sử dụng Vite + Tailwind CSS) dành riêng cho Quản trị viên (Admin) để quản lý tài sản, danh sách tài khoản người dùng, phân quyền và kiểm tra lịch sử hoạt động (Audit Logs).
3. **`backend/`**: RESTful API được xây dựng bằng Node.js, Express và MongoDB để xử lý logic nghiệp vụ, xác thực JWT, phân quyền RBAC và ghi nhật ký hoạt động.

---

## 🛠 Hướng dẫn chạy local

### 1. Cấu hình Backend
* Truy cập thư mục `backend/`
* Tạo tệp `.env` và điền cấu hình:
  ```env
  PORT=5000
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret_key
  ```
* Cài đặt dependencies và chạy server:
  ```bash
  npm install
  npm start
  ```

### 2. Cấu hình Frontend & Admin
* Cả hai ứng dụng đều kết nối tới URL Backend thông qua biến môi trường `VITE_API_URL` (mặc định sẽ tự kết nối tới backend đã deploy trên Render nếu không có cấu hình local).
* Để chạy local kết nối với local backend:
  * Tạo tệp `.env` trong thư mục `frontend/` và `admin/`:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
  * Cài đặt dependencies và khởi chạy:
    ```bash
    npm install
    npm run dev
    ```
