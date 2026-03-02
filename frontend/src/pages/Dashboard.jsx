import React from "react";
import { useEffect, useState } from "react";
import { getDashboard } from "../api";

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error)   return <div className="error-banner">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back. Here's your HR overview for today.</p>
      </div>

    
      <div className="stats-grid">
        <StatCard label="Total Employees"   value={data.total_employees}         color="purple" />
        <StatCard label="Present Today"     value={data.present_today}           color="teal"   />
        <StatCard label="Absent Today"      value={data.absent_today}            color="red"    />
        <StatCard label="Total Records"     value={data.total_attendance_records} color="orange" />
      </div>

      <div className="card">
        <div className="toolbar">
          <h2>Employee Summary</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("employees")}>
            Manage Employees →
          </button>
        </div>

        {data.employee_stats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No employees yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Present Days</th>
                </tr>
              </thead>
              <tbody>
                {data.employee_stats.map((e) => (
                  <tr key={e.employee_id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{initials(e.name)}</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{e.name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{e.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-dept">{e.department}</span></td>
                    <td>
                      <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 18 }}>
                        {e.present_days}
                      </span>
                      <span style={{ color: "var(--muted)", fontSize: 12, marginLeft: 4 }}>days</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function Loader() {
  return <div className="loading-dots"><span /><span /><span /></div>;
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}
