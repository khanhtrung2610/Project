import React from "react";

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📊 Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-800 text-white rounded-lg">
          <p>📦 Tổng thiết bị:</p>
          <p className="text-2xl font-bold">100</p>
        </div>
        <div className="p-4 bg-gray-800 text-white rounded-lg">
          <p>📌 Hàng tồn kho:</p>
          <p className="text-2xl font-bold">50</p>
        </div>
        <div className="p-4 bg-gray-800 text-white rounded-lg">
          <p>🔄 Giao dịch hôm nay:</p>
          <p className="text-2xl font-bold">20</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
