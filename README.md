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
| Đoàn Hoàng Khánh Trung | B22DCVT563 | Business Logic Layer Developer | 9/10 |
| Vũ Quang Vinh | B22DCVT587 | Data Access Layer Developer | 8/10 |
| Trần Ngô Anh Dũng | B22DCVT094 | Presentation Layer Developer | 8/10 |
| Bùi Đình Tuấn | B22DCVT478 | Presentation Layer Developer | 7/10 |
| Vũ Minh Hiếu | B22DCVT198 | System Integration Developer | 7/10 |

## 📄 Giấy Phép

Dự án được phát triển dưới giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên Hệ

Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng liên hệ qua:
- Email: trungkttnl8@gmail.com
- Số điện thoại: 0962243675

## 🙏 Cảm Ơn

Cảm ơn bạn đã quan tâm đến dự án của chúng tôi!

## 👥 Bảng đánh giá đóng góp của các thành viên:

| Thành viên | Phân chia công việc | Mức độ đóng góp |
|------------|-------------------|-----------------|
| Đoàn Hoàng Khánh Trung | - Xác định, làm rõ nội dung, đề xuất các tính năng chính của hệ thống quản lý thiết bị văn phòng<br>- Thiết kế các yêu cầu chức năng cụ thể cho từng tính năng: quản lý thiết bị, theo dõi tồn kho, cảnh báo<br>- Thực hiện triển khai các phần: giao diện trang chủ, trang chi tiết thiết bị, trang tìm kiếm<br>- Chịu trách nhiệm code các tính năng chính: hiển thị danh sách thiết bị, tìm kiếm thiết bị | 9/10 |
| Vũ Quang Vinh | - Tạo bản đặc tả các chức năng theo form chuẩn<br>- Đảm bảo các nội dung đã được làm rõ trước đó<br>- Tham gia nghiên cứu phát triển chức năng tìm kiếm thiết bị<br>- Phát triển các chức năng truy xuất và quản lý dữ liệu | 8/10 |
| Trần Ngô Anh Dũng | - Tìm kiếm và tích hợp các API phù hợp để lấy dữ liệu thiết bị, thông tin chi tiết<br>- Ghi lại nội dung các cuộc họp nhóm, xác định các vấn đề phát sinh<br>- Cập nhật tiến độ, thảo luận và giải quyết các khó khăn trong quá trình phát triển | 8/10 |
| Bùi Đình Tuấn | - Thiết kế sơ đồ Usecase, Class diagram<br>- Sơ đồ luồng dữ liệu cho hệ thống<br>- Góp ý phát triển chức năng, thiết kế giao diện các trang web<br>- Phát triển giao diện người dùng | 7/10 |
| Vũ Minh Hiếu | - Tạo bản đặc tả các chức năng theo form chuẩn<br>- Thực hiện kiểm thử phần mềm: kiểm thử chức năng, kiểm thử hệ thống<br>- Mô hình thực hiện dự án, qua đó lựa chọn mô hình phù hợp với đề tài thực hiện | 7/10 |

## 📋 Kanban Board Quá Trình Thực Hiện Dự Án

### 📝 Khởi Động Dự Án (Sprint 1)
- [x] Phân tích yêu cầu dự án
- [x] Khảo sát hiện trạng
- [x] Lập kế hoạch thực hiện
- [x] Phân công nhiệm vụ
- [x] Thiết lập môi trường phát triển

### 🎯 Thiết Kế Hệ Thống (Sprint 2)
- [x] Thiết kế kiến trúc 3 lớp
- [x] Vẽ sơ đồ Use Case
- [x] Thiết kế Class Diagram
- [x] Thiết kế cơ sở dữ liệu
- [x] Thiết kế giao diện người dùng
- [x] Xác định các API cần thiết

### 🔨 Phát Triển Backend (Sprint 3)
- [x] Xây dựng cấu trúc database MySQL
- [x] Phát triển Data Access Layer
- [x] Tạo các API CRUD cơ bản
- [x] Xây dựng Business Logic Layer
- [x] Tích hợp xác thực và phân quyền
- [x] Viết unit test cho backend

### 💻 Phát Triển Frontend (Sprint 4)
- [x] Xây dựng layout tổng thể
- [x] Tạo các component cơ bản
- [x] Phát triển trang quản lý thiết bị
- [x] Tích hợp form thêm/sửa thiết bị
- [x] Thêm tính năng tìm kiếm và lọc
- [x] Tạo dashboard thống kê

### 🔄 Tích Hợp & Kiểm Thử (Sprint 5)
- [x] Tích hợp frontend với backend
- [x] Kiểm thử chức năng (Functional Testing)
- [x] Kiểm thử giao diện (UI Testing)
- [x] Kiểm thử hiệu năng (Performance Testing)
- [x] Sửa lỗi và tối ưu hóa
- [x] Kiểm thử bảo mật

### 📦 Triển Khai & Hoàn Thiện (Sprint 6)
- [x] Triển khai lên môi trường test
- [x] Viết tài liệu hướng dẫn sử dụng
- [x] Đào tạo người dùng
- [x] Thu thập phản hồi
- [x] Sửa lỗi phát sinh
- [x] Bàn giao sản phẩm

### 🔜 Kế Hoạch Phát Triển Tiếp Theo
- [ ] Tối ưu hóa hiệu suất database
- [ ] Thêm tính năng export dữ liệu
- [ ] Tích hợp thông báo email
- [ ] Phát triển ứng dụng mobile
- [ ] Thêm tính năng quét mã QR

### 📊 Thống Kê Tiến Độ
- Tổng số sprint: 6
- Sprint đã hoàn thành: 6
- Tổng số task: 35
- Task đã hoàn thành: 30
- Task đang thực hiện: 5
- Tỷ lệ hoàn thành: 85.7%
