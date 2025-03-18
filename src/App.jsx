import React from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Payments from "./pages/Payments";
import Categories from "./pages/Categories";
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
            <Route path="/hoat-dong" element={<Inventory />} />
            <Route path="/thong-ke" element={<Reports />} />
            <Route path="/thanh-toan" element={<Payments />} />
            <Route path="/danh-muc" element={<Categories />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
