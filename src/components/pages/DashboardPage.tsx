import {
  type ProteinRecord, SHOWCASE_PROTEINS, ESMFOLD_MAX_LENGTH, ESMFOLD_DIRECT_LIMIT,
} from '../../forge-engine';

export function DashboardPage({ onDemo, proteins }: {
  onDemo: (id: string, label: string) => void; proteins: ProteinRecord[];
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
          AlphaFold Fusion v4.1
        </h1>
        <p className="text-gray-500 mt-2">
          Physics-based restraints • IDR-aware dynamics • Long sequence support up to {ESMFOLD_MAX_LENGTH} aa
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
        <h2 className="font-bold text-blue-800 mb-2">🆕 New in v4.1: Long Sequence Folding</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
          <div className="bg-white rounded-lg p-3 border-l-4 border-green-400">
            <div className="font-bold text-green-700">≤{ESMFOLD_DIRECT_LIMIT} aa</div>
            <div className="text-xs mt-1">Direct ESMFold API — single request, full structure</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-amber-400">
            <div className="font-bold text-amber-700">{ESMFOLD_DIRECT_LIMIT}–{ESMFOLD_MAX_LENGTH} aa</div>
            <div className="text-xs mt-1">Chunked folding — overlapping fragments merged by best pLDDT</div>
          </div>
          <div className="bg-white rounded-lg p-3 border-l-4 border-purple-400">
            <div className="font-bold text-purple-700">ESM Atlas</div>
            <div className="text-xs mt-1">772M pre-computed structures via MGYP IDs</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-3">⚡ Quick Start</h3>
        <div className="flex flex-wrap gap-2">
          {SHOWCASE_PROTEINS.map(p => (
            <button key={p.id} onClick={() => onDemo(p.id, p.label)}
              className="px-3 py-1.5 rounded-full text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
              {p.label} ({p.residues} aa)
            </button>
          ))}
        </div>
      </div>

      {proteins.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold mb-3">📋 Loaded ({proteins.length})</h3>
          <div className="space-y-2">
            {proteins.map((p, i) => {
              const idrCount = p.restraintProfile.filter(r => r.isIDR).length;
              return (
                <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="w-3 h-3 rounded-full" style={{
                    backgroundColor: p.meanConfidence >= 90 ? '#0D47A1'
                      : p.meanConfidence >= 70 ? '#42A5F5'
                      : p.meanConfidence >= 50 ? '#FBC02D' : '#E65100',
                  }} />
                  <span className="font-semibold text-sm">{p.label}</span>
                  <span className="text-xs text-gray-500">{p.chain.length} aa</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    p.origin === 'alphafold-db' ? 'bg-green-100 text-green-700' :
                    p.origin === 'esmfold-chunked' ? 'bg-amber-100 text-amber-700' :
                    p.origin === 'esm-atlas' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{
                    p.origin === 'alphafold-db' ? 'AFDB' :
                    p.origin === 'esmfold-chunked' ? `Chunked (${p.chunkInfo?.totalChunks || '?'})` :
                    p.origin === 'esm-atlas' ? 'ESM Atlas' : 'ESMFold'
                  }</span>
                  {idrCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      IDR: {idrCount}
                    </span>
                  )}
                  <span className="ml-auto font-bold text-sm"
                    style={{ color: p.meanConfidence >= 70 ? '#059669' : '#dc2626' }}>
                    {p.meanConfidence.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}