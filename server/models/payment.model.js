const db = require('../config/db.config');

class Payment {
    // Lấy tất cả thanh toán
    static async getAllPayments() {
        try {
            const [rows] = await db.query('SELECT * FROM payments ORDER BY date DESC');
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
                'INSERT INTO payments (transactionId, amount, date, type, status, method, note) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    paymentData.transactionId,
                    paymentData.amount,
                    new Date(),
                    paymentData.type,
                    paymentData.status,
                    paymentData.method,
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
                'UPDATE payments SET amount = ?, status = ?, method = ?, note = ? WHERE id = ?',
                [
                    paymentData.amount,
                    paymentData.status,
                    paymentData.method,
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