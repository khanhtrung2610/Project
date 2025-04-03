const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'inventory_management'
    });

    try {
        // Xóa các bảng cũ nếu tồn tại
        await connection.query('DROP TABLE IF EXISTS payments');
        await connection.query('DROP TABLE IF EXISTS transactions');
        await connection.query('DROP TABLE IF EXISTS alerts');
        console.log('Đã xóa các bảng cũ');

        // Đọc file SQL
        const sqlFile = await fs.readFile(path.join(__dirname, 'init.sql'), 'utf8');
        
        // Chia file SQL thành các câu lệnh riêng biệt
        const statements = sqlFile.split(';').filter(statement => statement.trim());
        
        // Thực thi từng câu lệnh
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.query(statement);
                console.log('Đã thực thi câu lệnh SQL thành công');
            }
        }
        
        console.log('Khởi tạo cơ sở dữ liệu hoàn tất');
    } catch (error) {
        console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', error);
    } finally {
        await connection.end();
    }
}

initializeDatabase(); 