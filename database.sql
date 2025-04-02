-- Tạo database
CREATE DATABASE IF NOT EXISTS inventory_management;
USE inventory_management;

-- Bảng thiết bị
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    threshold INT NOT NULL DEFAULT 10,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng giao dịch
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    type ENUM('import', 'export') NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    user VARCHAR(50) NOT NULL,
    note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Bảng thanh toán
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    transaction_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Bảng cảnh báo
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Thêm dữ liệu mẫu
INSERT INTO devices (id, name, category, quantity, price, threshold, status, description) VALUES
('DEV001', 'Máy tính xách tay Dell XPS 13', 'Laptop', 15, 25000000, 5, 'active', 'Laptop cao cấp'),
('DEV002', 'Máy in HP LaserJet Pro', 'Máy in', 8, 8000000, 3, 'active', 'Máy in laser'),
('DEV003', 'Màn hình Dell 24"', 'Màn hình', 20, 5000000, 5, 'active', 'Màn hình Full HD'),
('DEV004', 'Bàn phím cơ Logitech G915', 'Phụ kiện', 30, 3500000, 10, 'active', 'Bàn phím cơ RGB'),
('DEV005', 'Chuột không dây Microsoft Surface', 'Phụ kiện', 25, 1500000, 8, 'active', 'Chuột không dây');

INSERT INTO transactions (id, type, device_id, quantity, price, total_amount, user, note) VALUES
('TXN001', 'import', 'DEV001', 10, 25000000, 250000000, 'admin', 'Nhập hàng mới'),
('TXN002', 'export', 'DEV001', 5, 25000000, 125000000, 'admin', 'Xuất cho khách hàng'),
('TXN003', 'import', 'DEV002', 5, 8000000, 40000000, 'admin', 'Nhập hàng mới');

INSERT INTO payments (id, transaction_id, amount, payment_method, status, note) VALUES
('PAY001', 'TXN001', 250000000, 'bank_transfer', 'completed', 'Thanh toán chuyển khoản'),
('PAY002', 'TXN002', 125000000, 'cash', 'completed', 'Thanh toán tiền mặt'),
('PAY003', 'TXN003', 40000000, 'bank_transfer', 'pending', 'Chờ xác nhận');

INSERT INTO alerts (id, device_id, type, message, status) VALUES
('ALR001', 'DEV001', 'low_stock', 'Máy tính xách tay Dell XPS 13 sắp hết hàng', 'active'),
('ALR002', 'DEV002', 'low_stock', 'Máy in HP LaserJet Pro sắp hết hàng', 'active'); 