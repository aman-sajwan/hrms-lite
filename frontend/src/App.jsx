import React from "react";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import "./index.css";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "employees", label: "Employees", icon: "◈" },
  { id: "attendance", label: "Attendance", icon: "◉" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">HR</span>
          <span className="brand-text">HRMS<em>lite</em></span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">Admin Panel</div>
      </aside>

      <main className="main-content">
        {page === "dashboard" && <Dashboard onNavigate={setPage} />}
        {page === "employees" && <Employees />}
        {page === "attendance" && <Attendance />}
      </main>
    </div>
  );
}
