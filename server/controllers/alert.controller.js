const Alert = require('../models/alert.model');

class AlertController {
    // Lấy tất cả cảnh báo
    static async getAllAlerts(req, res) {
        try {
            const alerts = await Alert.getAllAlerts();
            res.json(alerts);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy cảnh báo theo ID
    static async getAlertById(req, res) {
        try {
            const alert = await Alert.getAlertById(req.params.id);
            if (!alert) {
                return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
            }
            res.json(alert);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Thêm cảnh báo mới
    static async createAlert(req, res) {
        try {
            const alertId = await Alert.createAlert(req.body);
            res.status(201).json({ message: 'Thêm cảnh báo thành công', id: alertId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Cập nhật cảnh báo
    static async updateAlert(req, res) {
        try {
            const success = await Alert.updateAlert(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
            }
            res.json({ message: 'Cập nhật cảnh báo thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Xóa cảnh báo
    static async deleteAlert(req, res) {
        try {
            const success = await Alert.deleteAlert(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
            }
            res.json({ message: 'Xóa cảnh báo thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AlertController; 