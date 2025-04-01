const express = require('express');
const router = express.Router();
const db = require('../config/db.config');

// Lấy tất cả giao dịch
router.get('/', async (req, res) => {
    try {
        const [transactions] = await db.query('SELECT * FROM transactions ORDER BY date DESC');
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách giao dịch' });
    }
});

// Thêm giao dịch mới
router.post('/', async (req, res) => {
    const { type, deviceId, deviceName, quantity, price, totalAmount, user, status, note } = req.body;
    const id = 'T' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();

    try {
        await db.query('START TRANSACTION');

        // Thêm giao dịch
        await db.query(
            'INSERT INTO transactions (id, type, device_id, device_name, quantity, price, total_amount, user, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, type, deviceId, deviceName, quantity, price, totalAmount, user, status, note]
        );

        // Cập nhật số lượng thiết bị
        const updateQuantity = type === 'import' ? quantity : -quantity;
        await db.query(
            'UPDATE devices SET quantity = quantity + ? WHERE id = ?',
            [updateQuantity, deviceId]
        );

        await db.query('COMMIT');
        res.status(201).json({ message: 'Thêm giao dịch thành công', id });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error adding transaction:', error);
        res.status(500).json({ message: 'Lỗi khi thêm giao dịch' });
    }
});

// Cập nhật trạng thái giao dịch
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query(
            'UPDATE transactions SET status = ? WHERE id = ?',
            [status, id]
        );
        res.json({ message: 'Cập nhật trạng thái giao dịch thành công' });
    } catch (error) {
        console.error('Error updating transaction status:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái giao dịch' });
    }
});

// Xóa giao dịch
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Bắt đầu transaction
        await db.query('START TRANSACTION');

        // Lấy thông tin giao dịch
        const [transactions] = await db.query('SELECT * FROM transactions WHERE id = ?', [id]);
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
        }

        const transaction = transactions[0];

        // Cập nhật số lượng thiết bị (hoàn tác giao dịch)
        const updateQuantity = transaction.type === 'import' ? -transaction.quantity : transaction.quantity;
        await db.query(
            'UPDATE devices SET quantity = quantity + ? WHERE id = ?',
            [updateQuantity, transaction.device_id]
        );

        // Xóa giao dịch
        await db.query('DELETE FROM transactions WHERE id = ?', [id]);

        // Commit transaction
        await db.query('COMMIT');

        res.json({ message: 'Xóa giao dịch thành công' });
    } catch (error) {
        // Rollback nếu có lỗi
        await db.query('ROLLBACK');
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Lỗi khi xóa giao dịch' });
    }
});

module.exports = router;
