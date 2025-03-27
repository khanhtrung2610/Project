const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const filePath = path.join(__dirname, "../data/payments.json");

const readData = () => JSON.parse(fs.readFileSync(filePath, "utf8"));

// Lấy danh sách thanh toán
router.get("/", (req, res) => {
    res.json(readData());
});

// Thêm thanh toán mới
router.post("/", (req, res) => {
    const payments = readData();
    const newPayment = { id: Date.now(), date: new Date().toISOString(), ...req.body };
    payments.push(newPayment);
    fs.writeFileSync(filePath, JSON.stringify(payments, null, 2));
    res.json({ message: "Thêm thanh toán thành công!", payment: newPayment });
});

module.exports = router;
