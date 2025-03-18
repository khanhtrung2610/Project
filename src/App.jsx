import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import HoatDong from "./pages/HoatDong";
import ThongKe from "./pages/ThongKe";
import ThanhToan from "./pages/ThanhToan";
import DanhMuc from "./pages/DanhMuc";
import "./index.css";

const App = () => {
  return (
    <Router basename="/Project">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-4 bg-gray-800 text-white">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hoat-dong" element={<HoatDong />} />
            <Route path="/thong-ke" element={<ThongKe />} />
            <Route path="/thanh-toan" element={<ThanhToan />} />
            <Route path="/danh-muc" element={<DanhMuc />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

export default App;
