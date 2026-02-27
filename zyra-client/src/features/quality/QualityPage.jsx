export default function QualityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Quality Control</h1>
      <p className="text-surface-700">Inspections, defect tracking, and quality analytics.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h2 className="text-lg font-semibold mb-4">Inspection Log</h2><div className="h-48 flex items-center justify-center text-surface-700">Inspection records</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Defect Heatmap</h2><div className="h-48 flex items-center justify-center text-surface-700">Defect analytics visualization</div></div>
      </div>
    </div>
  );
}
