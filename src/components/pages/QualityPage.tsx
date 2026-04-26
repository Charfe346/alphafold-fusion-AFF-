import { type ProteinRecord } from '../../forge-engine';
import { ConfidenceDonut } from '../charts/ConfidenceDonut';
import { ConfidenceGauge } from '../charts/ConfidenceGauge';
import { ConfidenceTrace } from '../charts/ConfidenceTrace';
import { QualityRadar } from '../charts/QualityRadar';
import { ChunkInfoBanner } from '../ui/ChunkInfoBanner';

export function QualityPage({ proteins, active, activeIdx, setActiveIdx }: {
  proteins: ProteinRecord[]; active: ProteinRecord | null;
  activeIdx: number; setActiveIdx: (i: number) => void;
}) {
  if (!proteins.length)
    return <div className="text-center text-gray-500 py-8">No proteins loaded.</div>;
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">
        📊 Quality Overview
      </h2>
      <table className="w-full bg-white rounded-xl shadow text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Protein</th><th className="p-2">Source</th>
            <th className="p-2">Length</th><th className="p-2">pLDDT</th>
            <th className="p-2">IDR</th><th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {proteins.map((p, i) => {
            const idrC = p.restraintProfile.filter(r => r.isIDR).length;
            return (
              <tr key={i} className={`border-t ${i === activeIdx ? 'bg-emerald-50' : ''}`}>
                <td className="p-2 font-semibold">{p.label}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    p.origin === 'alphafold-db' ? 'bg-green-100 text-green-700' :
                    p.origin === 'esmfold-chunked' ? 'bg-amber-100 text-amber-700' :
                    p.origin === 'esm-atlas' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{
                    p.origin === 'alphafold-db' ? 'AFDB' :
                    p.origin === 'esmfold-chunked' ? 'Chunked' :
                    p.origin === 'esm-atlas' ? 'Atlas' : 'ESMFold'
                  }</span>
                </td>
                <td className="p-2 text-center">{p.chain.length}</td>
                <td className="p-2 text-center">
                  <span className="font-bold"
                    style={{ color: p.meanConfidence >= 70 ? '#059669' : '#dc2626' }}>
                    {p.meanConfidence.toFixed(1)}
                  </span>
                </td>
                <td className="p-2 text-center text-xs">
                  {idrC > 0 ? <span className="text-orange-600">{idrC} res</span> : '—'}
                </td>
                <td className="p-2 text-center">
                  <button onClick={() => setActiveIdx(i)}
                    className="text-xs text-emerald-600 hover:underline">Select</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {active && (
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="font-bold text-emerald-700">{active.label} — Quality</h3>
          {active.chunkInfo && <ChunkInfoBanner protein={active} />}
          <div className="flex flex-wrap gap-4 items-start">
            <ConfidenceDonut scores={active.confidenceScores} />
            <ConfidenceGauge value={active.meanConfidence} />
            <QualityRadar protein={active} />
          </div>
          <ConfidenceTrace scores={active.confidenceScores} />
        </div>
      )}
    </div>
  );
}