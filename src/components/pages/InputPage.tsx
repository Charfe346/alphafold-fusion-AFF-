import {
  readFasta, findAccession, looksLikeMGYP, getFoldingStrategy,
  SHOWCASE_PROTEINS, ESMFOLD_MAX_LENGTH,
} from '../../forge-engine';

export function InputPage({ inputText, setInputText, onSubmit, onDemo, loading }: {
  inputText: string; setInputText: (t: string) => void;
  onSubmit: () => void; onDemo: (id: string, label: string) => void; loading: boolean;
}) {
  const parsed = readFasta(inputText);
  const trimmed = inputText.trim();
  const isMGYP = looksLikeMGYP(trimmed);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">
        🧬 Protein Input
      </h2>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <textarea value={inputText} onChange={e => setInputText(e.target.value)}
          rows={8}
          className="w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-emerald-300"
          placeholder={`>sp|P68871|HBB_HUMAN\nMVHLTPEEKSAVTALWGKVN...\n\nOr enter:\n• UniProt accession (e.g., P68871)\n• MGYP ID from ESM Atlas (e.g., MGYP002537940442)\n• Raw sequence (up to ${ESMFOLD_MAX_LENGTH} aa, auto-chunked if >400)`} />

        {isMGYP && (
          <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <strong>ESM Atlas ID detected:</strong> {trimmed} → Will fetch pre-computed structure from ESM Metagenomic Atlas (772M proteins)
          </div>
        )}

        {!isMGYP && parsed.length > 0 && parsed.map((e, i) => {
          const acc = findAccession(e.header);
          const strategy = !acc ? getFoldingStrategy(e.residues.length) : null;
          return (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
              <span className={`w-2 h-2 rounded-full ${acc ? 'bg-green-500' : strategy?.color === 'text-red-600' ? 'bg-red-500' : strategy?.color === 'text-amber-600' ? 'bg-amber-500' : 'bg-blue-500'}`} />
              <strong>{e.header.slice(0, 40)}</strong> ({e.residues.length} aa)
              {acc ? <span className="text-green-600">→ AlphaFold DB</span> : (
                <span className={strategy?.color || 'text-gray-600'}>→ {strategy?.strategy || 'ESMFold'}</span>
              )}
              {!acc && strategy && (
                <span className="text-xs text-gray-400 italic">{strategy.description}</span>
              )}
            </div>
          );
        })}

        <button onClick={onSubmit} disabled={loading || (!parsed.length && !isMGYP)}
          className="w-full py-3 rounded-full font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 disabled:opacity-50">
          {loading ? '⏳ Processing…' : isMGYP ? '🌐 Fetch from ESM Atlas' : `🚀 Load (${parsed.length})`}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-bold text-gray-600 mb-2">Quick Demo</h3>
        <div className="flex flex-wrap gap-2">
          {SHOWCASE_PROTEINS.slice(0, 6).map(p => (
            <button key={p.id} onClick={() => onDemo(p.id, p.label)} disabled={loading}
              className="px-3 py-1 rounded-full text-xs bg-gray-100 hover:bg-emerald-100 disabled:opacity-50">
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}