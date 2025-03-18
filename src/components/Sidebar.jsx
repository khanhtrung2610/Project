import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar w-64 h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">📦 Quản lý kho</h1>
      <nav>
        <ul>
          <li className="mb-2">
            <Link to="/" className="block p-2 bg-gray-800 rounded">📊 Dashboard</Link>
          </li>
          <li className="mb-2">
            <Link to="/hoat-dong" className="block p-2 bg-gray-800 rounded">📦 Hoạt động kho</Link>
          </li>
          <li className="mb-2">
            <Link to="/thong-ke" className="block p-2 bg-gray-800 rounded">📈 Báo cáo & Thống kê</Link>
          </li>
          <li className="mb-2">
            <Link to="/thanh-toan" className="block p-2 bg-gray-800 rounded">💰 Thanh toán</Link>
          </li>
          <li className="mb-2">
            <Link to="/danh-muc" className="block p-2 bg-gray-800 rounded">🔧 Danh mục thiết bị</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
