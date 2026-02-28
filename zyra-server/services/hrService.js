const { db } = require("../config/firebase");
const { ref, get, set, push, remove, child } = require("firebase/database");
const { appendToCSV } = require("../utils/csvExport");

// ─── Seed Data ────────────────────────────────────────────────────────────────
const EMPLOYEE_SEED = [
  { employeeId: "EMP-001", firstName: "Alice",  lastName: "Martin",  department: "Engineering", designation: "Senior Engineer",  status: "active", salary: 95000, joinDate: "2021-03-15", email: "alice.martin@zyra.com",  phone: "555-1001" },
  { employeeId: "EMP-002", firstName: "Bob",    lastName: "Thompson",department: "Operations",  designation: "Operations Lead",  status: "active", salary: 78000, joinDate: "2020-07-01", email: "bob.thompson@zyra.com",  phone: "555-1002" },
  { employeeId: "EMP-003", firstName: "Clara",  lastName: "Singh",   department: "Finance",     designation: "Finance Analyst",  status: "active", salary: 72000, joinDate: "2022-01-10", email: "clara.singh@zyra.com",    phone: "555-1003" },
  { employeeId: "EMP-004", firstName: "David",  lastName: "Lee",     department: "HR",          designation: "HR Manager",       status: "active", salary: 80000, joinDate: "2019-11-20", email: "david.lee@zyra.com",      phone: "555-1004" },
  { employeeId: "EMP-005", firstName: "Eva",    lastName: "Patel",   department: "Production",  designation: "Production Supervisor", status: "active", salary: 68000, joinDate: "2023-02-05", email: "eva.patel@zyra.com", phone: "555-1005" },
];

const ATTENDANCE_SEED = (() => {
  const records = [];
  EMPLOYEE_SEED.forEach(e => {
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i - 1);
      const dateStr = d.toISOString().split("T")[0];
      records.push({
        id: `ATT-${e.employeeId}-${dateStr}`,
        employeeId: e.employeeId,
        employeeName: `${e.firstName} ${e.lastName}`,
        department: e.department,
        date: dateStr,
        clockIn: "09:00",
        clockOut: "18:00",
        hoursWorked: 9,
        overtime: 1,
        status: "present",
      });
    }
  });
  return records;
})();

const PAYROLL_SEED = EMPLOYEE_SEED.map(e => ({
  id: `PAY-${e.employeeId}-2026-02`,
  employeeId: e.employeeId,
  employeeName: `${e.firstName} ${e.lastName}`,
  department: e.department,
  designation: e.designation,
  month: 2,
  year: 2026,
  basicSalary: e.salary,
  allowances: Math.round(e.salary * 0.1),
  deductions: Math.round(e.salary * 0.12),
  netPay: Math.round(e.salary + e.salary * 0.1 - e.salary * 0.12),
  status: "paid",
  processedAt: new Date().toISOString(),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getList = async (path) => {
  const snap = await get(child(ref(db), path));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const seedIfEmpty = async (path, seedData, keyFn) => {
  const snap = await get(child(ref(db), path));
  if (!snap.exists()) {
    for (const item of seedData) {
      await set(ref(db, `${path}/${keyFn(item)}`), item);
    }
  }
};

// ─── Employees ────────────────────────────────────────────────────────────────
exports.getEmployees = async ({ page = 1, limit = 20, department, status } = {}) => {
  await seedIfEmpty("employees", EMPLOYEE_SEED, e => e.employeeId);
  let employees = await getList("employees");
  if (department) employees = employees.filter(e => e.department === department);
  if (status) employees = employees.filter(e => e.status === status);
  employees.sort((a, b) => a.firstName.localeCompare(b.firstName));
  const total = employees.length;
  const start = (page - 1) * limit;
  return { employees: employees.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

exports.addEmployee = async (data) => {
  const employees = await getList("employees");
  if (employees.find(e => e.employeeId === data.employeeId)) {
    throw Object.assign(new Error("Employee ID already exists"), { statusCode: 409 });
  }
  await set(ref(db, `employees/${data.employeeId}`), data);
  appendToCSV("employees.csv", data);
  return data;
};

// ─── Attendance ───────────────────────────────────────────────────────────────
exports.getAttendance = async ({ employeeId, startDate, endDate } = {}) => {
  await seedIfEmpty("attendance", ATTENDANCE_SEED, a => a.id);
  let records = await getList("attendance");
  if (employeeId) records = records.filter(r => r.employeeId === employeeId);
  if (startDate && endDate) {
    records = records.filter(r => r.date >= startDate && r.date <= endDate);
  }
  records.sort((a, b) => b.date.localeCompare(a.date));
  return records;
};

exports.clockInOut = async (data) => {
  const today = new Date().toISOString().split("T")[0];
  const id = `ATT-${data.employeeId}-${today}`;
  const snap = await get(ref(db, `attendance/${id}`));
  let record;
  if (!snap.exists()) {
    record = {
      id,
      employeeId: data.employeeId,
      employeeName: data.employeeName || "",
      date: today,
      clockIn: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      clockOut: null,
      hoursWorked: null,
      overtime: 0,
      status: "present",
    };
  } else {
    record = snap.val();
    if (!record.clockOut) {
      record.clockOut = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      record.hoursWorked = 9; // simplified
      record.overtime = Math.max(0, record.hoursWorked - 8);
    }
  }
  await set(ref(db, `attendance/${id}`), record);
  appendToCSV("attendance.csv", record);
  return record;
};

// ─── Payroll ──────────────────────────────────────────────────────────────────
exports.getPayroll = async ({ month, year } = {}) => {
  await seedIfEmpty("payroll", PAYROLL_SEED, p => p.id);
  let records = await getList("payroll");
  if (month) records = records.filter(r => String(r.month) === String(month));
  if (year)  records = records.filter(r => String(r.year)  === String(year));
  records.sort((a, b) => `${b.year}-${b.month}`.localeCompare(`${a.year}-${a.month}`));
  return records;
};
