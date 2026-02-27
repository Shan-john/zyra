export default function ProductionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Production</h1>
      <p className="text-surface-700">Manage schedules, work orders, and bills of materials.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h2 className="text-lg font-semibold mb-4">Production Schedule</h2><div className="h-64 flex items-center justify-center text-surface-700">Gantt chart will render here</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Work Orders</h2><div className="h-64 flex items-center justify-center text-surface-700">Work order list will render here</div></div>
      </div>
    </div>
  );
}
