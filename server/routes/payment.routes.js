const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/payment.controller');

// Lấy tất cả thanh toán
router.get('/', PaymentController.getAllPayments);

// Lấy thanh toán theo ID
router.get('/:id', PaymentController.getPaymentById);

// Thêm thanh toán mới
router.post('/', PaymentController.createPayment);

// Cập nhật thanh toán
router.put('/:id', PaymentController.updatePayment);

// Xóa thanh toán
router.delete('/:id', PaymentController.deletePayment);

module.exports = router; 