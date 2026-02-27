const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Payroll = require("../models/Payroll");

// ─── Employees ─────────────────────────────────────────────

exports.getEmployees = async ({ page = 1, limit = 20, department, status }) => {
  const query = {};
  if (department) query.department = department;
  if (status) query.status = status;

  const employees = await Employee.find(query)
    .populate("manager", "firstName lastName")
    .sort({ firstName: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Employee.countDocuments(query);
  return { employees, total, page, totalPages: Math.ceil(total / limit) };
};

exports.addEmployee = async (data) => {
  const existing = await Employee.findOne({ employeeId: data.employeeId });
  if (existing) throw Object.assign(new Error("Employee ID already exists"), { statusCode: 409 });
  return Employee.create(data);
};

// ─── Attendance ────────────────────────────────────────────

exports.getAttendance = async ({ employeeId, startDate, endDate }) => {
  const query = {};
  if (employeeId) query.employee = employeeId;
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  return Attendance.find(query)
    .populate("employee", "firstName lastName employeeId department")
    .sort({ date: -1 })
    .lean();
};

exports.clockInOut = async (data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let record = await Attendance.findOne({ employee: data.employee, date: today });

  if (!record) {
    // Clock in
    record = await Attendance.create({
      employee: data.employee,
      date: today,
      clockIn: new Date(),
      status: "present",
    });
  } else if (!record.clockOut) {
    // Clock out
    record.clockOut = new Date();
    record.hoursWorked = ((record.clockOut - record.clockIn) / (1000 * 60 * 60)).toFixed(2);
    record.overtime = Math.max(0, record.hoursWorked - 8);
    await record.save();
  }

  return record;
};

// ─── Payroll ───────────────────────────────────────────────

exports.getPayroll = async ({ month, year }) => {
  const query = {};
  if (month) query.month = month;
  if (year) query.year = year;

  return Payroll.find(query)
    .populate("employee", "firstName lastName employeeId department designation")
    .sort({ createdAt: -1 })
    .lean();
};
