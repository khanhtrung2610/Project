const express = require('express');
const router = express.Router();
const DeviceController = require('../controllers/device.controller');

// Lấy tất cả thiết bị
router.get('/', DeviceController.getAllDevices);

// Lấy thiết bị theo ID
router.get('/:id', DeviceController.getDeviceById);

// Thêm thiết bị mới
router.post('/', DeviceController.createDevice);

// Cập nhật thiết bị
router.put('/:id', DeviceController.updateDevice);

// Xóa thiết bị
router.delete('/:id', DeviceController.deleteDevice);

// Lấy thiết bị sắp hết hàng
router.get('/low-stock', DeviceController.getLowStockDevices);

module.exports = router; 