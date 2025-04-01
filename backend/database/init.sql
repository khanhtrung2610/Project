-- Tạo database
CREATE DATABASE IF NOT EXISTS warehouse_db;
USE warehouse_db;

-- Bảng thiết bị
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(15,2) NOT NULL,
    threshold INT NOT NULL DEFAULT 5,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng giao dịch
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(20) PRIMARY KEY,
    type ENUM('import', 'export') NOT NULL,
    device_id VARCHAR(20) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user VARCHAR(50) NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    note TEXT,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Bảng thanh toán
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(20) PRIMARY KEY,
    transaction_id VARCHAR(20),
    amount DECIMAL(15,2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type ENUM('import', 'export') NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    method ENUM('cash', 'bank_transfer', 'credit_card') NOT NULL,
    note TEXT,
    created_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- Bảng cảnh báo
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(20) PRIMARY KEY,
    type ENUM('low-stock', 'inventory', 'system', 'transaction') NOT NULL,
    severity ENUM('high', 'medium', 'low') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    device_id VARCHAR(20),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);