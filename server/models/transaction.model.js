const db = require('../config/db.config');
const Device = require('./device.model');

class Transaction {
    // Lấy tất cả giao dịch
    static async getAllTransactions() {
        try {
            const [rows] = await db.query('SELECT * FROM transactions ORDER BY date DESC');
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
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Tạo giao dịch mới
            const [result] = await connection.query(
                'INSERT INTO transactions (type, deviceId, deviceName, quantity, price, totalAmount, date, user, status, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    transactionData.type,
                    transactionData.deviceId,
                    transactionData.deviceName,
                    transactionData.quantity,
                    transactionData.price,
                    transactionData.totalAmount,
                    new Date(),
                    transactionData.user,
                    transactionData.status,
                    transactionData.note
                ]
            );

            // Cập nhật số lượng thiết bị
            const quantityChange = transactionData.type === 'import' ? transactionData.quantity : -transactionData.quantity;
            await Device.updateDeviceQuantity(transactionData.deviceId, quantityChange);

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Cập nhật giao dịch
    static async updateTransaction(id, transactionData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Lấy thông tin giao dịch cũ
            const [oldTransaction] = await connection.query('SELECT * FROM transactions WHERE id = ?', [id]);
            if (!oldTransaction[0]) {
                throw new Error('Không tìm thấy giao dịch');
            }

            // Cập nhật giao dịch
            const [result] = await connection.query(
                'UPDATE transactions SET type = ?, deviceId = ?, deviceName = ?, quantity = ?, price = ?, totalAmount = ?, user = ?, status = ?, note = ? WHERE id = ?',
                [
                    transactionData.type,
                    transactionData.deviceId,
                    transactionData.deviceName,
                    transactionData.quantity,
                    transactionData.price,
                    transactionData.totalAmount,
                    transactionData.user,
                    transactionData.status,
                    transactionData.note,
                    id
                ]
            );

            // Hoàn tác số lượng thiết bị của giao dịch cũ
            const oldQuantityChange = oldTransaction[0].type === 'import' ? -oldTransaction[0].quantity : oldTransaction[0].quantity;
            await Device.updateDeviceQuantity(oldTransaction[0].deviceId, oldQuantityChange);

            // Cập nhật số lượng thiết bị của giao dịch mới
            const newQuantityChange = transactionData.type === 'import' ? transactionData.quantity : -transactionData.quantity;
            await Device.updateDeviceQuantity(transactionData.deviceId, newQuantityChange);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Xóa giao dịch
    static async deleteTransaction(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Lấy thông tin giao dịch
            const [transaction] = await connection.query('SELECT * FROM transactions WHERE id = ?', [id]);
            if (!transaction[0]) {
                throw new Error('Không tìm thấy giao dịch');
            }

            // Hoàn tác số lượng thiết bị
            const quantityChange = transaction[0].type === 'import' ? -transaction[0].quantity : transaction[0].quantity;
            await Device.updateDeviceQuantity(transaction[0].deviceId, quantityChange);

            // Xóa giao dịch
            const [result] = await connection.query('DELETE FROM transactions WHERE id = ?', [id]);

            await connection.commit();
            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Transaction; 