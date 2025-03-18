import React from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-container flex h-screen">
        {/* Sidebar chiếm cố định một phần */}
        <Sidebar />

        {/* Nội dung chính, chiếm toàn bộ phần còn lại */}
        <div className="content flex-1 p-4 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Các route khác sẽ thêm ở đây */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
