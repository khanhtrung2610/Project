const Payment = require('../models/payment.model');

class PaymentController {
    // Lấy tất cả thanh toán
    static async getAllPayments(req, res) {
        try {
            const payments = await Payment.getAllPayments();
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Lấy thanh toán theo ID
    static async getPaymentById(req, res) {
        try {
            const payment = await Payment.getPaymentById(req.params.id);
            if (!payment) {
                return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
            }
            res.json(payment);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Thêm thanh toán mới
    static async createPayment(req, res) {
        try {
            const paymentId = await Payment.createPayment(req.body);
            res.status(201).json({ message: 'Thêm thanh toán thành công', id: paymentId });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Cập nhật thanh toán
    static async updatePayment(req, res) {
        try {
            const success = await Payment.updatePayment(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
            }
            res.json({ message: 'Cập nhật thanh toán thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Xóa thanh toán
    static async deletePayment(req, res) {
        try {
            const success = await Payment.deletePayment(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
            }
            res.json({ message: 'Xóa thanh toán thành công' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = PaymentController; 