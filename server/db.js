const mysql = require('mysql2');

// Tạo pool connection để tái sử dụng kết nối
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise(); // Sử dụng promise-based API 