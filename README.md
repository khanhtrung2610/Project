# 🏢 Hệ Thống Quản Lý Thiết Bị Văn Phòng

![GitHub](https://img.shields.io/badge/version-1.0.0-blue)
![GitHub](https://img.shields.io/badge/license-MIT-green)

## 📝 Giới Thiệu

Hệ thống quản lý thiết bị văn phòng là một ứng dụng web giúp quản lý và theo dõi tình trạng các thiết bị trong văn phòng một cách hiệu quả. Hệ thống cung cấp các tính năng quản lý thiết bị, theo dõi tồn kho, và cảnh báo tự động.

## ✨ Tính Năng Chính

- 📊 **Quản lý thiết bị**: Thêm, sửa, xóa và theo dõi thông tin thiết bị
- 📈 **Theo dõi tồn kho**: Quản lý số lượng và trạng thái thiết bị
- 🔔 **Hệ thống cảnh báo**: Tự động cảnh báo khi thiết bị sắp hết hoặc cần bảo trì
- 📱 **Giao diện responsive**: Tương thích với mọi thiết bị
- 📊 **Báo cáo và thống kê**: Xuất báo cáo và thống kê tình hình thiết bị

## 🛠️ Công Nghệ Sử Dụng

- HTML5, CSS3, JavaScript
- LocalStorage cho lưu trữ dữ liệu
- Chart.js cho biểu đồ thống kê
- Responsive Design

## 🏗️ Kiến Trúc Phần Mềm

Hệ thống được xây dựng theo mô hình kiến trúc 3 lớp (3-Tier Architecture) với các thành phần chính sau:

### 1. Presentation Layer (Frontend)
- Sử dụng HTML5, CSS3 và JavaScript thuần
- Giao diện người dùng responsive, tương thích với mọi thiết bị
- Tương tác với người dùng thông qua các form và bảng điều khiển
- Hiển thị dữ liệu dưới dạng bảng và biểu đồ

### 2. Business Logic Layer (Backend)
- Xử lý logic nghiệp vụ chính của hệ thống
- Quản lý các luồng dữ liệu và quy tắc nghiệp vụ
- Xử lý các yêu cầu từ frontend và tương tác với database
- Thực hiện các tính toán và xử lý dữ liệu

### 3. Data Access Layer (Database)
- Sử dụng MySQL làm hệ quản trị cơ sở dữ liệu
- Lưu trữ và quản lý dữ liệu thiết bị, người dùng và các thông tin khác
- Đảm bảo tính toàn vẹn và bảo mật dữ liệu
- Hỗ trợ các thao tác CRUD (Create, Read, Update, Delete)

### Mô Hình MVC
Hệ thống cũng áp dụng mô hình MVC (Model-View-Controller) để tăng tính module và dễ bảo trì:
- **Model**: Đại diện cho cấu trúc dữ liệu và logic nghiệp vụ
- **View**: Hiển thị dữ liệu và giao diện người dùng
- **Controller**: Xử lý các yêu cầu và điều phối luồng dữ liệu
  
## 🚀 Cài Đặt và Chạy

1. Clone repository:
```bash
git clone [(https://github.com/khanhtrung2610/Project.git)]
```

2. Mở file `index.html` trong trình duyệt web

3. Hoặc sử dụng Live Server trong VS Code

## 📋 Cấu Trúc Dự Án

```
├── index.html          # Trang chủ
├── style.css          # File CSS chính
├── script.js          # File JavaScript chính
├── assets/            # Thư mục chứa hình ảnh và tài nguyên
└── README.md          # Tài liệu dự án
```

## 👥 Thành Viên Nhóm

| Tên | Mã Sinh Viên | Vai Trò | Mức Độ Đóng Góp |
|-----|-------------|---------|----------------|
| Đoàn Hoàng Khánh Trung | B22DCVT563 | Backend Developer | 9/10 |
| Vũ Quang Vinh | B22DCVT587 | UML Designer | 8/10 |
| Trần Ngô Anh Dũng | B22DCVT094 | Tổng hợp biên bản họp | 8/10 |
| Bùi Đình Tuấn | B22DCVT478 | Frontend Developer | 7/10 |
| Vũ Minh Hiếu | B22DCVT198 | System Designer | 7/10 |

## 📄 Giấy Phép

Dự án được phát triển dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên Hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ qua:
- Email: trungkttnl8@gmail.com
- Số điện thoại: 0962243675

## 🙏 Cảm Ơn

Cảm ơn bạn đã quan tâm đến dự án của chúng tôi!
