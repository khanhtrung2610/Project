const db = require('../config/db.config');

class Device {
    // Lấy tất cả thiết bị
    static async getAllDevices() {
        try {
            const [rows] = await db.query('SELECT * FROM devices');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Lấy thiết bị theo ID
    static async getDeviceById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM devices WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Thêm thiết bị mới
    static async createDevice(deviceData) {
        const { id, name, category, quantity, price, threshold, description } = deviceData;
        try {
            const [result] = await db.query(
                'INSERT INTO devices (id, name, category, quantity, price, threshold, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id, name, category, quantity, price, threshold, description]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật thiết bị
    static async updateDevice(id, deviceData) {
        const { name, category, quantity, price, threshold, description } = deviceData;
        try {
            const [result] = await db.query(
                'UPDATE devices SET name = ?, category = ?, quantity = ?, price = ?, threshold = ?, description = ? WHERE id = ?',
                [name, category, quantity, price, threshold, description, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật số lượng thiết bị
    static async updateDeviceQuantity(id, quantityChange) {
        try {
            const [result] = await db.query(
                'UPDATE devices SET quantity = quantity + ? WHERE id = ?',
                [quantityChange, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Xóa thiết bị
    static async deleteDevice(id) {
        try {
            const [result] = await db.query('DELETE FROM devices WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Lấy thiết bị sắp hết hàng
    static async getLowStockDevices() {
        try {
            const [rows] = await db.query('SELECT * FROM devices WHERE quantity <= threshold');
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Device; 