const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller');

// Lấy tất cả giao dịch
router.get('/', TransactionController.getAllTransactions);

// Lấy giao dịch theo ID
router.get('/:id', TransactionController.getTransactionById);

// Thêm giao dịch mới
router.post('/', TransactionController.createTransaction);

// Cập nhật giao dịch
router.put('/:id', TransactionController.updateTransaction);

// Xóa giao dịch
router.delete('/:id', TransactionController.deleteTransaction);

module.exports = router; 