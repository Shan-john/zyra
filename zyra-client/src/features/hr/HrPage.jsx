export default function HrPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Human Resources</h1>
      <p className="text-surface-700">Employee directory, attendance, and payroll management.</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card"><h2 className="text-lg font-semibold mb-4">Employee Directory</h2><div className="h-48 flex items-center justify-center text-surface-700">Employee list</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Attendance</h2><div className="h-48 flex items-center justify-center text-surface-700">Attendance tracker</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Payroll</h2><div className="h-48 flex items-center justify-center text-surface-700">Payroll records</div></div>
      </div>
    </div>
  );
}
