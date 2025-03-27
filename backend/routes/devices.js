const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const filePath = path.join(__dirname, "../data/devices.json");

const readData = () => JSON.parse(fs.readFileSync(filePath, "utf8"));

// Lấy danh sách thiết bị
router.get("/", (req, res) => {
    res.json(readData());
});

// Thêm thiết bị mới
router.post("/", (req, res) => {
    const devices = readData();
    const newDevice = { id: Date.now(), ...req.body };
    devices.push(newDevice);
    fs.writeFileSync(filePath, JSON.stringify(devices, null, 2));
    res.json({ message: "Thêm thiết bị thành công!", device: newDevice });
});

// Xóa thiết bị
router.delete("/:id", (req, res) => {
    let devices = readData();
    devices = devices.filter(d => d.id != req.params.id);
    fs.writeFileSync(filePath, JSON.stringify(devices, null, 2));
    res.json({ message: "Xóa thiết bị thành công!" });
});

// Sửa thiết bị
router.put("/:id", (req, res) => {
    let devices = readData();
    const index = devices.findIndex(d => d.id == req.params.id);
    if (index !== -1) {
        devices[index] = { ...devices[index], ...req.body };
        fs.writeFileSync(filePath, JSON.stringify(devices, null, 2));
        res.json({ message: "Cập nhật thiết bị thành công!" });
    } else {
        res.status(404).json({ message: "Không tìm thấy thiết bị!" });
    }
});

module.exports = router;
