import { useState, useEffect } from "react";

const Reports = () => {
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/statistics")
      .then((res) => res.json())
      .then((data) => setStatistics(data))
      .catch((error) => console.error("Lỗi:", error));
  }, []);

  return (
    <div>
      <h2>Thống kê kho</h2>
      <ul>
        <li>Tổng số thiết bị: {statistics.totalDevices}</li>
        <li>Nhập kho tháng này: {statistics.importedThisMonth}</li>
        <li>Xuất kho tháng này: {statistics.exportedThisMonth}</li>
        <li>Thiết bị sắp hết hàng: {statistics.lowStockDevices}</li>
      </ul>
    </div>
  );
};

export default Reports;
