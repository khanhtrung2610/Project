const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const devicePath = path.join(__dirname, "../data/devices.json");
const transactionPath = path.join(__dirname, "../data/transactions.json");

const readDevices = () => JSON.parse(fs.readFileSync(devicePath, "utf8"));
const readTransactions = () => JSON.parse(fs.readFileSync(transactionPath, "utf8"));

router.get("/", (req, res) => {
    const devices = readDevices();
    const transactions = readTransactions();

    const totalDevices = devices.length;
    const importedThisMonth = transactions.filter(t => t.type === "import").length;
    const exportedThisMonth = transactions.filter(t => t.type === "export").length;
    const lowStockDevices = devices.filter(d => d.quantity < 5).length;

    res.json({ totalDevices, importedThisMonth, exportedThisMonth, lowStockDevices });
});

module.exports = router;
