const express = require('express');
const router = express.Router();
const db = require('../config/db.config');

// Lấy tất cả cảnh báo
router.get('/', async (req, res) => {
    try {
        const [alerts] = await db.query('SELECT * FROM alerts ORDER BY timestamp DESC');
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách cảnh báo' });
    }
});

// Thêm cảnh báo mới
router.post('/', async (req, res) => {
    const { type, severity, title, message, deviceId } = req.body;
    const id = 'A' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();

    try {
        await db.query(
            'INSERT INTO alerts (id, type, severity, title, message, device_id, is_read) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
            [id, type, severity, title, message, deviceId]
        );
        res.status(201).json({ message: 'Thêm cảnh báo thành công', id });
    } catch (error) {
        console.error('Error adding alert:', error);
        res.status(500).json({ message: 'Lỗi khi thêm cảnh báo' });
    }
});

// Đánh dấu cảnh báo đã đọc
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query(
            'UPDATE alerts SET is_read = TRUE WHERE id = ?',
            [id]
        );
        res.json({ message: 'Đã đánh dấu cảnh báo là đã đọc' });
    } catch (error) {
        console.error('Error marking alert as read:', error);
        res.status(500).json({ message: 'Lỗi khi đánh dấu cảnh báo' });
    }
});

// Xóa cảnh báo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM alerts WHERE id = ?', [id]);
        res.json({ message: 'Xóa cảnh báo thành công' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ message: 'Lỗi khi xóa cảnh báo' });
    }
});

module.exports = router; 