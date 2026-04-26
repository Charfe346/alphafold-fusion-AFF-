import {
  type ProteinRecord, SHOWCASE_PROTEINS,
  detectFlexibleRegions, computePrecisionMetrics, generateAnalysisReport,
} from '../../forge-engine';
import { QualityRadar } from '../charts/QualityRadar';
import { DisorderConfidenceOverlay } from '../charts/DisorderConfidenceOverlay';
import { RestraintDecisionMap } from '../charts/RestraintDecisionMap';
import { ErrorTrace } from '../charts/ErrorTrace';
import { EntropyProfile } from '../charts/EntropyProfile';
import { ContactDensityChart } from '../charts/ContactDensityChart';
import { ChunkInfoBanner } from '../ui/ChunkInfoBanner';

export function AnalysisPage({ protein, onDemo }: {
  protein: ProteinRecord | null; onDemo: (id: string, label: string) => void;
}) {
  if (!protein) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">📐 Deep Analysis</h2>
      <p className="text-gray-500">Load a protein first.</p>
      <div className="flex flex-wrap gap-2">
        {SHOWCASE_PROTEINS.slice(0, 4).map(p => (
          <button key={p.id} onClick={() => onDemo(p.id, p.label)}
            className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );

  const flex = detectFlexibleRegions(protein.confidenceScores);
  const precision = computePrecisionMetrics(protein.confidenceScores);
  const idrCount = protein.restraintProfile.filter(r => r.isIDR).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">
        📐 Analysis — {protein.label}
      </h2>

      {protein.chunkInfo && <ChunkInfoBanner protein={protein} />}

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-emerald-700">1. Quality Radar</h3>
        <QualityRadar protein={protein} />
      </section>

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-emerald-700">2. Disorder & IDR Analysis</h3>
        <p className="text-xs text-gray-500">
          Disorder propensity from amino acid composition (Campen et al. 2008). Window size: 21 residues.
        </p>
        <div className="flex gap-4 flex-wrap">
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">IDR Residues</div>
            <div className="text-lg font-bold text-orange-600">{idrCount}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">IDR Fraction</div>
            <div className="text-lg font-bold text-orange-600">
              {((idrCount / (protein.chain.length || 1)) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Flexible (pLDDT&lt;50)</div>
            <div className="text-lg font-bold text-blue-600">
              {(flex.flexibleFraction * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <DisorderConfidenceOverlay scores={protein.confidenceScores} disorder={protein.disorderProfile} />
        <RestraintDecisionMap protein={protein} />
      </section>

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-emerald-700">3. Positional Error (Jumper 2021)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Mean Error</div>
            <div className="text-lg font-bold text-red-600">{precision.avgPositionalError.toFixed(2)} Å</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Median</div>
            <div className="text-lg font-bold">{precision.medianPositionalError.toFixed(2)} Å</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">B-factor</div>
            <div className="text-lg font-bold">{precision.avgDisplacement.toFixed(1)} Å²</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">Resolution</div>
            <div className="text-lg font-bold">{precision.effectiveResolution.toFixed(2)} Å</div>
          </div>
        </div>
        <ErrorTrace errors={precision.perResidueErrors} />
      </section>

      <section className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-emerald-700">4. Sequence Complexity (Shannon Entropy)</h3>
        <p className="text-xs text-gray-500">
          Low complexity regions may indicate repeats, compositionally biased segments, or disordered regions.
        </p>
        <EntropyProfile sequence={protein.chain} />
      </section>

      {protein.paeMatrix && (
        <section className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="font-bold text-emerald-700">5. Contact Density (from PAE)</h3>
          <p className="text-xs text-gray-500">
            Number of residues with PAE &lt; 8Å. High values indicate well-packed core regions.
          </p>
          <ContactDensityChart pae={protein.paeMatrix} />
        </section>
      )}

      <section className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold text-emerald-700">6. Export</h3>
        <a href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(generateAnalysisReport(protein), null, 2))}`}
          download={`${protein.label}_report.json`}
          className="inline-block mt-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700">
          📥 JSON Report
        </a>
      </section>
    </div>
  );
}