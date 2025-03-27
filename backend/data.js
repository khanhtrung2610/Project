const devices = [
  { id: 1, name: "Router Cisco", quantity: 10 },
  { id: 2, name: "Switch TP-Link", quantity: 15 },
  { id: 3, name: "Modem Huawei", quantity: 8 },
];

const transactions = [
  { id: 1, time: "2025-03-20 10:30", device: "Router Cisco", quantity: 2, type: "Nhập" },
  { id: 2, time: "2025-03-21 14:15", device: "Switch TP-Link", quantity: 1, type: "Xuất" },
  { id: 3, time: "2025-03-22 09:45", device: "Modem Huawei", quantity: 3, type: "Nhập" },
];

const payments = [
  { id: 1, customer: "Công ty A", amount: 5000000, date: "2025-03-20", method: "Chuyển khoản", status: "Đã thanh toán" },
  { id: 2, customer: "Công ty B", amount: 3000000, date: "2025-03-21", method: "Tiền mặt", status: "Chờ xử lý" },
  { id: 3, customer: "Công ty C", amount: 2000000, date: "2025-03-22", method: "Chuyển khoản", status: "Đã thanh toán" },
];

const statistics = {
  totalDevices: 50,
  importedThisMonth: 20,
  exportedThisMonth: 15,
  lowStockDevices: 5,
};

module.exports = { devices, transactions, payments, statistics };
