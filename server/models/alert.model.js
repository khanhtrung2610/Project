const db = require('../config/db.config');

class Alert {
    // Lấy tất cả cảnh báo
    static async getAllAlerts() {
        try {
            const [rows] = await db.query('SELECT * FROM alerts ORDER BY timestamp DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Lấy cảnh báo theo ID
    static async getAlertById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM alerts WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Thêm cảnh báo mới
    static async createAlert(alertData) {
        try {
            const [result] = await db.query(
                'INSERT INTO alerts (type, severity, title, message, deviceId, deviceName, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [alertData.type, alertData.severity, alertData.title, alertData.message, alertData.deviceId, alertData.deviceName, new Date()]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật cảnh báo
    static async updateAlert(id, alertData) {
        try {
            const [result] = await db.query(
                'UPDATE alerts SET type = ?, severity = ?, title = ?, message = ?, isRead = ? WHERE id = ?',
                [alertData.type, alertData.severity, alertData.title, alertData.message, alertData.isRead, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Xóa cảnh báo
    static async deleteAlert(id) {
        try {
            const [result] = await db.query('DELETE FROM alerts WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Alert; 