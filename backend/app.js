const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

// Fake database
let devices = [
    { id: 1, name: "Modem ABC", quantity: 50 },
    { id: 2, name: "Router XYZ", quantity: 30 }
];

let transactions = [
    { id: 1, time: "2025-03-25", device: "Modem ABC", quantity: 5, type: "Xuất kho" }
];

let payments = [
    { id: 1, customer: "Công ty A", amount: 5000000, date: "2025-03-20", method: "Chuyển khoản", status: "Đã thanh toán" }
];

let statistics = {
    totalDevices: 80,
    importedThisMonth: 20,
    exportedThisMonth: 10,
    lowStockDevices: 5
};

// ========================== API ROUTES ==========================
// 📌 Lấy danh sách thiết bị
app.get("/api/devices", (req, res) => res.json(devices));

// 📌 Lấy danh sách giao dịch
app.get("/api/transactions", (req, res) => res.json(transactions));

// 📌 Lấy danh sách thanh toán
app.get("/api/payments", (req, res) => res.json(payments));

// 📌 Lấy thống kê tổng quan
app.get("/api/statistics", (req, res) => res.json(statistics));

// 📌 Thêm thiết bị mới
app.post("/api/devices", (req, res) => {
    const { name, quantity } = req.body;
    if (!name || !quantity) return res.status(400).json({ error: "Thiếu thông tin thiết bị" });

    const newDevice = { id: devices.length + 1, name, quantity };
    devices.push(newDevice);
    res.json({ message: "Thêm thành công!", device: newDevice });
});

// 📌 Sửa thiết bị
app.put("/api/devices/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    const device = devices.find(d => d.id === id);
    if (!device) return res.status(404).json({ error: "Không tìm thấy thiết bị" });

    device.name = name;
    res.json({ message: "Cập nhật thành công!", device });
});

// 📌 Xóa thiết bị
app.delete("/api/devices/:id", (req, res) => {
    const id = parseInt(req.params.id);
    devices = devices.filter(d => d.id !== id);
    res.json({ message: "Xóa thành công!" });
});

// ===================== IMPORT EXCEL =====================
const upload = multer({ dest: "uploads/" });

app.post("/api/import-excel", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Không có file" });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);

    const worksheet = workbook.worksheets[0];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            const id = row.getCell(1).value;
            const name = row.getCell(2).value;
            const quantity = row.getCell(3).value;
            devices.push({ id, name, quantity });
        }
    });

    fs.unlinkSync(req.file.path); // Xóa file sau khi import
    res.json({ message: "Import thành công!" });
});

// ===================== EXPORT EXCEL =====================
app.get("/api/export-excel", async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Devices");

    worksheet.addRow(["ID", "Tên thiết bị", "Số lượng"]);
    devices.forEach(d => worksheet.addRow([d.id, d.name, d.quantity]));

    const filePath = "devices.xlsx";
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, "devices.xlsx", () => fs.unlinkSync(filePath));
});

// ===================== EXPORT PDF =====================
app.get("/api/export-pdf", (req, res) => {
    const doc = new PDFDocument();
    const filePath = "devices.pdf";

    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(16).text("Danh sách thiết bị", { align: "center" });
    doc.moveDown();

    devices.forEach(d => {
        doc.fontSize(12).text(`${d.id} - ${d.name} - ${d.quantity}`);
    });

    doc.end();
    res.download(filePath, "devices.pdf", () => fs.unlinkSync(filePath));
});
// API lấy dữ liệu lịch sử
app.get('/api/history', (req, res) => {
    res.json({ message: "Dữ liệu lịch sử" });
});

// API lấy dữ liệu cảnh báo
app.get('/api/alerts', (req, res) => {
    res.json({ message: "Dữ liệu cảnh báo" });
});
// ========================== SERVER LISTEN ==========================
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
