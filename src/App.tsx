import { useState, useEffect, useCallback } from 'react';
import {
  type ProteinRecord, type NavigationTab, type RenderMode, type Palette,
  NAV_TABS, readFasta, findAccession, looksLikeMGYP,
  loadProteinRecord, persistSession,
} from './forge-engine';
import { DashboardPage } from './components/pages/DashboardPage';
import { InputPage } from './components/pages/InputPage';
import { QualityPage } from './components/pages/QualityPage';
import { ViewerPage } from './components/pages/ViewerPage';
import { MDLabPage } from './components/pages/MDLabPage';
import { AnalysisPage } from './components/pages/AnalysisPage';
import { AboutPage } from './components/pages/AboutPage';

export default function App() {
  const [tab, setTab] = useState<NavigationTab>('🏠 Dashboard');
  const [proteins, setProteins] = useState<ProteinRecord[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [renderMode, setRenderMode] = useState<RenderMode>('Cartoon');
  const [palette, setPalette] = useState<Palette>('Confidence (4-tier)');
  const [inputText, setInputText] = useState('');
  const active = proteins[activeIdx] || null;

  useEffect(() => { persistSession(proteins); }, [proteins]);

  const addProtein = useCallback(async (input: {
    accession?: string; sequence?: string; label: string; mgypId?: string;
  }) => {
    setLoading(true); setError(''); setStatus('Starting…');
    try {
      const record = await loadProteinRecord(input, setStatus);
      setProteins(prev => {
        const next = [...prev, record];
        setActiveIdx(next.length - 1);
        return next;
      });
      setTab('🔬 Viewer'); setStatus('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally { setLoading(false); }
  }, []);

  const loadShowcase = useCallback((id: string, label: string) => {
    addProtein({ accession: id, label });
  }, [addProtein]);

  const handleSubmit = useCallback(() => {
    const trimmed = inputText.trim();
    if (looksLikeMGYP(trimmed)) {
      addProtein({ mgypId: trimmed, label: `ESM Atlas: ${trimmed}` });
      return;
    }
    const entries = readFasta(inputText);
    if (!entries.length) {
      setError('No valid sequences. Enter a FASTA sequence, UniProt accession, or MGYP ID.');
      return;
    }
    const first = entries[0], acc = findAccession(first.header);
    if (acc) addProtein({ accession: acc, label: first.header, sequence: first.residues });
    else if (first.residues.length > 0) addProtein({ sequence: first.residues, label: first.header || 'Custom' });
    else setError('No valid sequence or accession.');
  }, [inputText, addProtein]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-3 flex items-center gap-4 shadow-lg">
        <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
          <span className="text-2xl">🧬</span> AlphaFold Fusion
        </h1>
        <span className="text-xs opacity-70">v4.1 — Long Sequence Support</span>
        <div className="flex-1" />
        {proteins.length > 0 && (
          <select value={activeIdx}
            onChange={e => { setActiveIdx(Number(e.target.value)); setTab('🔬 Viewer'); }}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm">
            {proteins.map((p, i) => (
              <option key={i} value={i} className="text-gray-800">
                {p.label} ({p.meanConfidence.toFixed(0)})
              </option>
            ))}
          </select>
        )}
      </header>

      <nav className="bg-white border-b border-gray-200 px-6 flex gap-1 overflow-x-auto">
        {NAV_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 overflow-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-wrap">
            {error}
            <button className="ml-2 text-red-500" onClick={() => setError('')}>✕</button>
          </div>
        )}
        {loading && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            {status}
          </div>
        )}

        {tab === '🏠 Dashboard' && <DashboardPage onDemo={loadShowcase} proteins={proteins} />}
        {tab === '🧬 Input' && <InputPage inputText={inputText} setInputText={setInputText} onSubmit={handleSubmit} onDemo={loadShowcase} loading={loading} />}
        {tab === '📊 Quality' && <QualityPage proteins={proteins} active={active} activeIdx={activeIdx} setActiveIdx={setActiveIdx} />}
        {tab === '🔬 Viewer' && <ViewerPage protein={active} renderMode={renderMode} setRenderMode={setRenderMode} palette={palette} setPalette={setPalette} onDemo={loadShowcase} onLoadHit={addProtein} loading={loading} />}
        {tab === '🧪 MD Lab' && <MDLabPage protein={active} onDemo={loadShowcase} />}
        {tab === '📐 Deep Analysis' && <AnalysisPage protein={active} onDemo={loadShowcase} />}
        {tab === '⚙️ About' && <AboutPage proteins={proteins} setProteins={setProteins} />}
      </main>
    </div>
  );
}