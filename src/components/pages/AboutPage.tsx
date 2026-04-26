import { type ProteinRecord, ESMFOLD_MAX_LENGTH, ESMFOLD_DIRECT_LIMIT } from '../../forge-engine';

export function AboutPage({ proteins, setProteins }: {
  proteins: ProteinRecord[]; setProteins: (p: ProteinRecord[]) => void;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">⚙️ About</h2>
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="flex gap-4">
          <div className="bg-gray-50 rounded-lg p-3 flex-1 text-center">
            <div className="text-xs text-gray-500">Proteins</div>
            <div className="text-2xl font-bold">{proteins.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex-1 text-center">
            <div className="text-xs text-gray-500">Version</div>
            <div className="text-2xl font-bold">4.1</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex-1 text-center">
            <div className="text-xs text-gray-500">Max Length</div>
            <div className="text-2xl font-bold">{ESMFOLD_MAX_LENGTH}</div>
          </div>
        </div>
        <button onClick={() => { setProteins([]); localStorage.removeItem('af_fusion_session'); }}
          className="px-4 py-2 rounded-lg text-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
          🗑️ Clear All
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h3 className="font-bold text-emerald-800">🔬 Scientific Methodology (v4.1)</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <div className="font-semibold text-emerald-800 mb-1">Physics-Based Restraint Model</div>
            <p>Force constants derived from the <strong>equipartition theorem</strong>: k = 3k<sub>B</sub>T / σ².
               IDR regions detected via amino acid propensity (Campen et al. 2008) receive k=0.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="font-semibold text-blue-800 mb-1">🆕 Chunked ESMFold for Long Sequences</div>
            <p>Sequences exceeding {ESMFOLD_DIRECT_LIMIT} aa are automatically split into overlapping
               fragments with best-pLDDT selection at junctions.</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="font-semibold text-purple-800 mb-1">🌐 ESM Metagenomic Atlas Integration</div>
            <p>Access to 772 million pre-computed protein structures from the ESM Atlas
               (Lin et al. 2023, <em>Science</em> 379:1123).</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5 space-y-2">
        <h3 className="font-bold text-emerald-800">📚 References</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Akdel, M. et al. (2022). A structural biology community assessment of AlphaFold2 applications. <em>Nat. Struct. Mol. Biol.</em>, 29, 1056–1067.</p>
          <p>• Campen, A. et al. (2008). TOP-IDP-Scale: A new amino acid scale measuring propensity for intrinsic disorder. <em>Protein Pept. Lett.</em>, 15, 956–963.</p>
          <p>• Jumper, J. et al. (2021). Highly accurate protein structure prediction with AlphaFold. <em>Nature</em>, 596, 583–589.</p>
          <p>• Kabsch, W. (1976). A solution for the best rotation to relate two sets of vectors. <em>Acta Crystallogr. A</em>, 32, 922–923.</p>
          <p>• Lin, Z. et al. (2023). Evolutionary-scale prediction of atomic-level protein structure with a language model. <em>Science</em>, 379, 1123–1130.</p>
        </div>
      </div>
    </div>
  );
}