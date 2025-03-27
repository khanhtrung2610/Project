const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const filePath = path.join(__dirname, "../data/transactions.json");

const readData = () => JSON.parse(fs.readFileSync(filePath, "utf8"));

// Lấy danh sách giao dịch
router.get("/", (req, res) => {
    res.json(readData());
});

// Thêm giao dịch mới
router.post("/", (req, res) => {
    const transactions = readData();
    const newTransaction = { id: Date.now(), time: new Date().toISOString(), ...req.body };
    transactions.push(newTransaction);
    fs.writeFileSync(filePath, JSON.stringify(transactions, null, 2));
    res.json({ message: "Thêm giao dịch thành công!", transaction: newTransaction });
});

module.exports = router;
