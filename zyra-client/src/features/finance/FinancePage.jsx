export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Finance</h1>
      <p className="text-surface-700">General ledger, P&L reports, and cash flow analysis.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h2 className="text-lg font-semibold mb-4">Ledger</h2><div className="h-48 flex items-center justify-center text-surface-700">Ledger entries table</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Cash Flow</h2><div className="h-48 flex items-center justify-center text-surface-700">Cash flow chart</div></div>
      </div>
      <div className="card"><h2 className="text-lg font-semibold mb-4">Profit & Loss</h2><div className="h-48 flex items-center justify-center text-surface-700">P&L report</div></div>
    </div>
  );
}
