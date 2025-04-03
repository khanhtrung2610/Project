-- Tạo bảng alerts
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    deviceId INT,
    deviceName VARCHAR(255),
    timestamp DATETIME NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mẫu vào bảng alerts
INSERT INTO alerts (type, severity, title, message, deviceId, deviceName, timestamp, isRead) VALUES
('system', 'high', 'Cảnh báo hệ thống', 'Hệ thống đang gặp sự cố', 1, 'Server 1', NOW(), false),
('device', 'medium', 'Cảnh báo thiết bị', 'Thiết bị cần bảo trì', 2, 'Router 1', NOW(), false),
('security', 'low', 'Cảnh báo bảo mật', 'Phát hiện đăng nhập bất thường', 3, 'Firewall 1', NOW(), false);

-- Tạo bảng transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    deviceId INT NOT NULL,
    deviceName VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    date DATETIME NOT NULL,
    user VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mẫu vào bảng transactions
INSERT INTO transactions (type, deviceId, deviceName, quantity, price, totalAmount, date, user, status, note) VALUES
('import', 1, 'Laptop Dell', 5, 15000000, 75000000, NOW(), 'admin', 'completed', 'Nhập hàng từ nhà cung cấp'),
('export', 2, 'Monitor LG', 3, 5000000, 15000000, NOW(), 'admin', 'pending', 'Xuất hàng cho khách hàng');

-- Tạo bảng payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transactionId INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATETIME NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    method VARCHAR(50) NOT NULL,
    note TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transactionId) REFERENCES transactions(id)
);

-- Thêm dữ liệu mẫu vào bảng payments
INSERT INTO payments (transactionId, amount, date, type, status, method, note) VALUES
(1, 75000000, NOW(), 'cash', 'completed', 'bank_transfer', 'Thanh toán qua chuyển khoản'),
(2, 15000000, NOW(), 'partial', 'pending', 'cash', 'Thanh toán một phần'); 