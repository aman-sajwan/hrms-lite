import React from "react";
import { useEffect, useState } from "react";
import { getAttendance, getEmployees, markAttendance, deleteAttendance } from "../api";

export default function Attendance() {
  const [records, setRecords]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterEmp, setFilterEmp]   = useState("");
  const [filterDate, setFilterDate] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      getAttendance(filterEmp || undefined, filterDate || undefined),
      getEmployees()
    ])
      .then(([att, emps]) => { setRecords(att); setEmployees(emps); })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterEmp, filterDate]);

  const handleDelete = async (id) => {
    try {
      await deleteAttendance(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const empMap = Object.fromEntries(employees.map((e) => [e.employee_id, e]));

  return (
    <div>
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Track and manage daily attendance records.</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <h2>Records</h2>
          <div className="filters">
            <select value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.full_name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {(filterEmp || filterDate) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setFilterEmp(""); setFilterDate(""); }}>
                Clear
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Mark Attendance
            </button>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-dots"><span /><span /><span /></div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◉</div>
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const emp = empMap[r.employee_id];
                  return (
                    <tr key={r.id}>
                      <td>
                        <div className="name-cell">
                          <div className="avatar">{initials(emp?.full_name || r.employee_id)}</div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{emp?.full_name || r.employee_id}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {emp && <span className="badge badge-dept">{emp.department}</span>}
                      </td>
                      <td style={{ color: "var(--muted)" }}>{formatDate(r.date)}</td>
                      <td>
                        <span className={`badge badge-${r.status.toLowerCase()}`}>
                          {r.status === "Present" ? "✓" : "✗"} {r.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger" onClick={() => handleDelete(r.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <MarkAttendanceModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onSuccess={(rec) => {
            setRecords((prev) => [rec, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function MarkAttendanceModal({ employees, onClose, onSuccess }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm]       = useState({ employee_id: "", date: today, status: "Present" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.employee_id || !form.date || !form.status) {
      return setError("All fields are required.");
    }
    setLoading(true);
    try {
      const rec = await markAttendance(form);
      onSuccess(rec);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Mark Attendance</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Employee</label>
            <select value={form.employee_id} onChange={set("employee_id")}>
              <option value="">Select employee…</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.full_name} ({e.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={form.date} onChange={set("date")} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={set("status")}>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        <div className="form-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : "Mark Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
