const db = require('../config/db.config');
const Device = require('./device.model');

class Transaction {
    // Lấy tất cả giao dịch
    static async getAllTransactions() {
        try {
            const [rows] = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Lấy giao dịch theo ID
    static async getTransactionById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM transactions WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Thêm giao dịch mới
    static async createTransaction(transactionData) {
        try {
            const [result] = await db.query(
                'INSERT INTO transactions (id, type, device_id, quantity, price, total_amount, user, note, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    transactionData.id,
                    transactionData.type,
                    transactionData.device_id,
                    transactionData.quantity,
                    transactionData.price,
                    transactionData.total_amount,
                    transactionData.user,
                    transactionData.note,
                    transactionData.status || 'completed'
                ]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật giao dịch
    static async updateTransaction(id, transactionData) {
        try {
            const [result] = await db.query(
                'UPDATE transactions SET type = ?, device_id = ?, quantity = ?, price = ?, total_amount = ?, user = ?, note = ?, status = ? WHERE id = ?',
                [
                    transactionData.type,
                    transactionData.device_id,
                    transactionData.quantity,
                    transactionData.price,
                    transactionData.total_amount,
                    transactionData.user,
                    transactionData.note,
                    transactionData.status,
                    id
                ]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Xóa giao dịch
    static async deleteTransaction(id) {
        try {
            const [result] = await db.query('DELETE FROM transactions WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Transaction; 