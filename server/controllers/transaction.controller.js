const Transaction = require('../models/transaction.model');

class TransactionController {
    // Lấy tất cả giao dịch
    static async getAllTransactions(req, res) {
        try {
            const transactions = await Transaction.getAllTransactions();
            res.json(transactions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy giao dịch theo ID
    static async getTransactionById(req, res) {
        try {
            const transaction = await Transaction.getTransactionById(req.params.id);
            if (!transaction) {
                return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
            }
            res.json(transaction);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Thêm giao dịch mới
    static async createTransaction(req, res) {
        try {
            const transactionId = await Transaction.createTransaction(req.body);
            res.status(201).json({ message: 'Thêm giao dịch thành công', id: transactionId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Cập nhật giao dịch
    static async updateTransaction(req, res) {
        try {
            const success = await Transaction.updateTransaction(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
            }
            res.json({ message: 'Cập nhật giao dịch thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Xóa giao dịch
    static async deleteTransaction(req, res) {
        try {
            const success = await Transaction.deleteTransaction(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy giao dịch' });
            }
            res.json({ message: 'Xóa giao dịch thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = TransactionController; 