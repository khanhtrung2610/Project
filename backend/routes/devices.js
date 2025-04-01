const express = require("express");
const router = express.Router();
const db = require("../config/db.config");

// Lấy tất cả thiết bị
router.get("/", async (req, res) => {
    try {
        const [devices] = await db.query("SELECT * FROM devices ORDER BY created_at DESC");
        res.json(devices);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách thiết bị" });
    }
});

// Thêm thiết bị mới
router.post("/", async (req, res) => {
    const { name, category, quantity, price, threshold, description } = req.body;
    const id = "D" + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();

    try {
        await db.query(
            "INSERT INTO devices (id, name, category, quantity, price, threshold, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, name, category, quantity, price, threshold, description]
        );
        res.status(201).json({ message: "Thêm thiết bị thành công", id });
    } catch (error) {
        console.error("Error adding device:", error);
        res.status(500).json({ message: "Lỗi khi thêm thiết bị" });
    }
});

// Cập nhật thiết bị
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, category, quantity, price, threshold, description } = req.body;

    try {
        await db.query(
            "UPDATE devices SET name = ?, category = ?, quantity = ?, price = ?, threshold = ?, description = ? WHERE id = ?",
            [name, category, quantity, price, threshold, description, id]
        );
        res.json({ message: "Cập nhật thiết bị thành công" });
    } catch (error) {
        console.error("Error updating device:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật thiết bị" });
    }
});

// Xóa thiết bị
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Kiểm tra xem thiết bị có đang được sử dụng trong giao dịch không
        const [transactions] = await db.query("SELECT COUNT(*) as count FROM transactions WHERE device_id = ?", [id]);
        if (transactions[0].count > 0) {
            return res.status(400).json({ message: "Không thể xóa thiết bị đã có giao dịch" });
        }

        await db.query("DELETE FROM devices WHERE id = ?", [id]);
        res.json({ message: "Xóa thiết bị thành công" });
    } catch (error) {
        console.error("Error deleting device:", error);
        res.status(500).json({ message: "Lỗi khi xóa thiết bị" });
    }
});

module.exports = router;
