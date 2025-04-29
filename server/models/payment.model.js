const db = require('../config/db.config');

class Payment {
    // Lấy tất cả thanh toán
    static async getAllPayments() {
        try {
            const [rows] = await db.query('SELECT * FROM payments ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Lấy thanh toán theo ID
    static async getPaymentById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Thêm thanh toán mới
    static async createPayment(paymentData) {
        try {
            const [result] = await db.query(
                'INSERT INTO payments (id, transaction_id, amount, payment_method, status, note) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    paymentData.id,
                    paymentData.transaction_id,
                    paymentData.amount,
                    paymentData.payment_method,
                    paymentData.status || 'pending',
                    paymentData.note
                ]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật thanh toán
    static async updatePayment(id, paymentData) {
        try {
            const [result] = await db.query(
                'UPDATE payments SET transaction_id = ?, amount = ?, payment_method = ?, status = ?, note = ? WHERE id = ?',
                [
                    paymentData.transaction_id,
                    paymentData.amount,
                    paymentData.payment_method,
                    paymentData.status,
                    paymentData.note,
                    id
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Xóa thanh toán
    static async deletePayment(id) {
        try {
            const [result] = await db.query('DELETE FROM payments WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Payment; 