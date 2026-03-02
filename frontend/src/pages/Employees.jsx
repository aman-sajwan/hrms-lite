import React from "react";
import { useEffect, useState } from "react";
import { getEmployees, addEmployee, deleteEmployee } from "../api";

const DEPARTMENTS = ["Engineering", "Marketing", "Design", "HR", "Finance", "Operations", "Sales"];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    getEmployees()
      .then(setEmployees)
      .catch(() => setError("Failed to load employees."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee and all their attendance records?")) return;
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.employee_id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Employees</h1>
        <p>Manage your organisation's employee records.</p>
      </div>

      <div className="card">
        <div className="toolbar">
          <h2>{employees.length} Employee{employees.length !== 1 ? "s" : ""}</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Add Employee
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="loading-dots"><span /><span /><span /></div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No employees yet. Add your first one!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.employee_id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{initials(e.full_name)}</div>
                        <span style={{ fontWeight: 500 }}>{e.full_name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--muted)", fontFamily: "monospace" }}>{e.employee_id}</td>
                    <td><span className="badge badge-dept">{e.department}</span></td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{e.email}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDelete(e.employee_id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddEmployeeModal
          onClose={() => setShowModal(false)}
          onSuccess={(emp) => {
            setEmployees((prev) => [...prev, emp]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm]     = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError("");
    if (!form.employee_id || !form.full_name || !form.email || !form.department) {
      return setError("All fields are required.");
    }
    setLoading(true);
    try {
      const emp = await addEmployee(form);
      onSuccess(emp);
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
          <h3>Add New Employee</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>Employee ID</label>
            <input placeholder="e.g. EMP001" value={form.employee_id} onChange={set("employee_id")} />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="John Doe" value={form.full_name} onChange={set("full_name")} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="john@company.com" value={form.email} onChange={set("email")} />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select value={form.department} onChange={set("department")}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="form-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? "Adding…" : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}

function initials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}
