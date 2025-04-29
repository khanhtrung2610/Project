-- Tạo database
CREATE DATABASE IF NOT EXISTS inventory_management;
USE inventory_management;

-- Tạo bảng devices
CREATE TABLE IF NOT EXISTS devices (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    quantity INT DEFAULT 0,
    price DECIMAL(10,2),
    threshold INT DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng transactions
CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT PRIMARY KEY,
    device_id BIGINT,
    type ENUM('import', 'export'),
    quantity INT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Tạo bảng payments
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY,
    transaction_id BIGINT,
    amount DECIMAL(10,2),
    status ENUM('pending', 'completed', 'failed'),
    method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Tạo bảng alerts
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT PRIMARY KEY,
    device_id BIGINT,
    type VARCHAR(50),
    message TEXT,
    severity ENUM('low', 'medium', 'high'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Thêm dữ liệu mẫu
INSERT INTO devices (id, name, category, quantity, price, threshold, description) VALUES
(1, 'Laptop Dell XPS', 'Laptop', 10, 25000000, 5, 'Laptop cao cấp'),
(2, 'iPhone 15 Pro', 'Điện thoại', 20, 30000000, 10, 'Điện thoại thông minh'),
(3, 'Samsung Galaxy Tab', 'Tablet', 15, 15000000, 8, 'Máy tính bảng');

INSERT INTO transactions (id, device_id, type, quantity, price) VALUES
(1, 1, 'import', 5, 25000000),
(2, 2, 'import', 10, 30000000),
(3, 3, 'import', 8, 15000000);

INSERT INTO payments (id, transaction_id, amount, status, method) VALUES
(1, 1, 125000000, 'completed', 'bank_transfer'),
(2, 2, 300000000, 'completed', 'credit_card'),
(3, 3, 120000000, 'completed', 'cash');

INSERT INTO alerts (id, device_id, type, message, severity) VALUES
(1, 1, 'low_stock', 'Laptop Dell XPS sắp hết hàng', 'medium'),
(2, 2, 'low_stock', 'iPhone 15 Pro sắp hết hàng', 'high'); 