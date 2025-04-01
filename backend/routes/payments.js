const express = require('express');
const router = express.Router();
const db = require('../config/db.config');

// Lấy tất cả thanh toán
router.get('/', async (req, res) => {
    try {
        const [payments] = await db.query('SELECT * FROM payments ORDER BY date DESC');
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách thanh toán' });
    }
});

// Thêm thanh toán mới
router.post('/', async (req, res) => {
    const { transactionId, amount, type, method, note, createdBy } = req.body;
    const id = 'P' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();

    try {
        await db.query(
            'INSERT INTO payments (id, transaction_id, amount, type, method, note, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, transactionId, amount, type, method, note, createdBy]
        );
        res.status(201).json({ message: 'Thêm thanh toán thành công', id });
    } catch (error) {
        console.error('Error adding payment:', error);
        res.status(500).json({ message: 'Lỗi khi thêm thanh toán' });
    }
});

// Cập nhật trạng thái thanh toán
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query(
            'UPDATE payments SET status = ? WHERE id = ?',
            [status, id]
        );
        res.json({ message: 'Cập nhật trạng thái thanh toán thành công' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái thanh toán' });
    }
});

// Xóa thanh toán
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM payments WHERE id = ?', [id]);
        res.json({ message: 'Xóa thanh toán thành công' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ message: 'Lỗi khi xóa thanh toán' });
    }
});

module.exports = router;
