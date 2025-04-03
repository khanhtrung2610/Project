const express = require('express');
const router = express.Router();
const AlertController = require('../controllers/alert.controller');

// Lấy tất cả cảnh báo
router.get('/', AlertController.getAllAlerts);

// Lấy cảnh báo theo ID
router.get('/:id', AlertController.getAlertById);

// Thêm cảnh báo mới
router.post('/', AlertController.createAlert);

// Cập nhật cảnh báo
router.put('/:id', AlertController.updateAlert);

// Xóa cảnh báo
router.delete('/:id', AlertController.deleteAlert);

module.exports = router; 