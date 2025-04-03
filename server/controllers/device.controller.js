const Device = require('../models/device.model');

class DeviceController {
    // Lấy tất cả thiết bị
    static async getAllDevices(req, res) {
        try {
            const devices = await Device.getAllDevices();
            res.json(devices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy thiết bị theo ID
    static async getDeviceById(req, res) {
        try {
            const device = await Device.getDeviceById(req.params.id);
            if (!device) {
                return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
            }
            res.json(device);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Thêm thiết bị mới
    static async createDevice(req, res) {
        try {
            const deviceId = await Device.createDevice(req.body);
            res.status(201).json({ message: 'Thêm thiết bị thành công', id: deviceId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Cập nhật thiết bị
    static async updateDevice(req, res) {
        try {
            const success = await Device.updateDevice(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
            }
            res.json({ message: 'Cập nhật thiết bị thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Xóa thiết bị
    static async deleteDevice(req, res) {
        try {
            const success = await Device.deleteDevice(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
            }
            res.json({ message: 'Xóa thiết bị thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy thiết bị sắp hết hàng
    static async getLowStockDevices(req, res) {
        try {
            const devices = await Device.getLowStockDevices();
            res.json(devices);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = DeviceController; 