import { useState } from 'react';

export function DpiExportBtn({ onExport }: { onExport: (dpi: number) => void }) {
  const [dpi, setDpi] = useState(300);
  return (
    <div className="flex items-center gap-1 mt-1">
      <select value={dpi} onChange={e => setDpi(Number(e.target.value))}
        className="text-xs border rounded px-1 py-0.5 bg-white">
        <option value={300}>300 DPI</option>
        <option value={600}>600 DPI</option>
      </select>
      <button onClick={() => onExport(dpi)}
        className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300">
        📥 PNG
      </button>
    </div>
  );
}