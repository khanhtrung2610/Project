const express = require('express');
const router = express.Router();
const db = require('./db');

// API lấy dữ liệu từ MySQL
router.get('/data', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM your_table');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi server');
  }
});

module.exports = router; 