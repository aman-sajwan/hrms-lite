const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Something went wrong");
  }
  return data;
}

// ── Employees ─────
export const getEmployees = () => request("/employees");

export const addEmployee = (payload) =>
  request("/employees", { method: "POST", body: JSON.stringify(payload) });

export const deleteEmployee = (employeeId) =>
  request(`/employees/${employeeId}`, { method: "DELETE" });

// ── Attendance ─────

export const getAttendance = (employeeId, dateFilter) => {
  const params = new URLSearchParams();
  if (employeeId) params.append("employee_id", employeeId);
  if (dateFilter) params.append("date_filter", dateFilter);
  return request(`/attendance?${params.toString()}`);
};

export const markAttendance = (payload) =>
  request("/attendance", { method: "POST", body: JSON.stringify(payload) });

export const deleteAttendance = (id) =>
  request(`/attendance/${id}`, { method: "DELETE" });

// ── Dashboard ──────
export const getDashboard = () => request("/dashboard");
