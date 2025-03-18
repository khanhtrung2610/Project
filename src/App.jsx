import React from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-container flex">
        <Sidebar />
        <div className="content flex-1 p-4">
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
