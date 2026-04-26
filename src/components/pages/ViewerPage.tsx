import { useState, useEffect, useCallback } from 'react';
import {
  type ProteinRecord, type RenderMode, type Palette, type Annotation,
  CONFIDENCE_TIERS, SHOWCASE_PROTEINS, ANNOTATION_PALETTE,
  looksLikeAccession, searchMSA, fetchInterProAnnotations,
  parseUniProtAnnotations, decomposePaeDomains,
} from '../../forge-engine';
import { exportAnnotationLegend } from '../../helpers/exportHelpers';
import { MoleculeViewer } from '../viewer/MoleculeViewer';
import { ConfidenceDonut } from '../charts/ConfidenceDonut';
import { ConfidenceGauge } from '../charts/ConfidenceGauge';
import { ConfidenceTrace } from '../charts/ConfidenceTrace';
import { PaeMap } from '../charts/PaeMap';
import { AnnotationStrip } from '../charts/AnnotationStrip';
import { ChunkInfoBanner } from '../ui/ChunkInfoBanner';

export function ViewerPage({ protein, renderMode, setRenderMode, palette, setPalette, onDemo, onLoadHit, loading: globalLoading }: {
  protein: ProteinRecord | null; renderMode: RenderMode; setRenderMode: (s: RenderMode) => void;
  palette: Palette; setPalette: (s: Palette) => void;
  onDemo: (id: string, label: string) => void;
  onLoadHit: (input: { accession?: string; sequence?: string; label: string }) => Promise<void>;
  loading: boolean;
}) {
  const [annotSrc, setAnnotSrc] = useState<'UniProt' | 'InterPro' | 'PAE'>('UniProt');
  const [displayAnnot, setDisplayAnnot] = useState<Annotation[]>([]);
  const [annotLoading, setAnnotLoading] = useState(false);
  const [annotMsg, setAnnotMsg] = useState('');
  const [msaData, setMsaData] = useState<{
    totalSeqs: number;
    homologs: { id: string; seqIdentity: number; expectValue?: number; queryCoverage?: number }[];
  } | null>(null);
  const [msaLoading, setMsaLoading] = useState(false);

  const doFetchAnnot = useCallback(async () => {
    if (!protein) return;
    setAnnotLoading(true); setAnnotMsg('');
    try {
      if (annotSrc === 'UniProt') {
        const ua = protein.annotations.filter(d => d.provider === 'UniProt');
        if (ua.length) { setDisplayAnnot(ua); setAnnotMsg(`${ua.length} UniProt annotation(s)`); }
        else if (protein.uniprotId && looksLikeAccession(protein.uniprotId)) {
          const r = await fetch(`https://rest.uniprot.org/uniprotkb/${protein.uniprotId}.json`);
          if (r.ok) {
            const d = parseUniProtAnnotations(await r.json());
            setDisplayAnnot(d); setAnnotMsg(d.length ? `${d.length} found` : 'None');
          } else setAnnotMsg('Fetch failed');
        } else setAnnotMsg('No accession');
      } else if (annotSrc === 'InterPro') {
        if (protein.uniprotId && looksLikeAccession(protein.uniprotId)) {
          const d = await fetchInterProAnnotations(protein.uniprotId);
          setDisplayAnnot(d); setAnnotMsg(d.length ? `${d.length} found` : 'None');
        } else setAnnotMsg('No accession');
      } else if (annotSrc === 'PAE') {
        if (protein.paeMatrix) {
          const { domains } = decomposePaeDomains(protein.paeMatrix);
          setDisplayAnnot(domains.map(dd => ({
            from: dd.startRes, to: dd.endRes,
            name: `Domain ${dd.domainId} (${dd.internalPae.toFixed(1)}Å)`,
            category: 'PAE', provider: 'PAE',
          })));
          setAnnotMsg(`${domains.length} PAE domain(s)`);
        } else setAnnotMsg('No PAE data');
      }
    } catch (e: unknown) {
      setAnnotMsg(`Error: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally { setAnnotLoading(false); }
  }, [protein, annotSrc]);

  useEffect(() => { if (protein) doFetchAnnot(); }, [protein?.label, annotSrc, doFetchAnnot]);

  const doFetchMSA = useCallback(async () => {
    if (!protein?.chain) return;
    setMsaLoading(true);
    try {
      const r = await searchMSA(protein.chain, setAnnotMsg);
      if (r) { setMsaData({ totalSeqs: r.totalSeqs, homologs: r.homologs }); setAnnotMsg(`MSA: ${r.totalSeqs} sequences`); }
      else setAnnotMsg('No results');
    } catch { setAnnotMsg('MSA failed'); }
    finally { setMsaLoading(false); }
  }, [protein]);

  if (!protein) return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">🔬 3D Viewer</h2>
      <p className="text-gray-500">No structure loaded.</p>
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

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-emerald-800 border-b-2 border-teal-400 pb-2">
        🔬 {protein.label}
      </h2>

      {protein.chunkInfo && <ChunkInfoBanner protein={protein} />}
      {protein.origin === 'esm-atlas' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700">
          🌐 <strong>ESM Metagenomic Atlas</strong> — Pre-computed structure from the 772M protein database
        </div>
      )}

      <div className="flex gap-3 flex-wrap items-center">
        <select value={renderMode} onChange={e => setRenderMode(e.target.value as RenderMode)}
          className="px-3 py-1.5 rounded-lg border text-sm">
          {(['Cartoon', 'Stick', 'Sphere', 'Line'] as RenderMode[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={palette} onChange={e => setPalette(e.target.value as Palette)}
          className="px-3 py-1.5 rounded-lg border text-sm">
          {(['Confidence (4-tier)', 'Blue-Orange', 'B-factor gradient', 'Rainbow', 'Per-chain'] as Palette[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <a href={`data:chemical/x-pdb;charset=utf-8,${encodeURIComponent(protein.pdbText)}`}
          download={`${protein.label}.pdb`}
          className="px-3 py-1.5 rounded-lg border text-sm bg-gray-50 hover:bg-gray-100">📥 PDB</a>
        <span className={`text-xs px-2 py-1 rounded-full ${
          protein.origin === 'alphafold-db' ? 'bg-green-100 text-green-700' :
          protein.origin === 'esmfold-chunked' ? 'bg-amber-100 text-amber-700' :
          protein.origin === 'esm-atlas' ? 'bg-purple-100 text-purple-700' :
          'bg-blue-100 text-blue-700'
        }`}>{protein.chain.length} aa • {
          protein.origin === 'alphafold-db' ? 'AlphaFold DB' :
          protein.origin === 'esmfold-chunked' ? `Chunked (${protein.chunkInfo?.totalChunks} frags)` :
          protein.origin === 'esm-atlas' ? 'ESM Atlas' : 'ESMFold'
        }</span>
      </div>

      <MoleculeViewer pdb={protein.pdbText} renderMode={renderMode} palette={palette} />
      <div className="flex flex-wrap gap-3 bg-white rounded-lg p-3 shadow">
        {Object.entries(CONFIDENCE_TIERS).map(([n, i]) => (
          <span key={n} className="flex items-center gap-1 text-xs">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: i.hex }} />{n}
          </span>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-sm">
          pLDDT ({protein.confidenceScores.length} res, avg {protein.meanConfidence.toFixed(1)})
        </h3>
        <div className="flex flex-wrap gap-4 items-start">
          <ConfidenceDonut scores={protein.confidenceScores} />
          <ConfidenceGauge value={protein.meanConfidence} />
        </div>
        <ConfidenceTrace scores={protein.confidenceScores} />
      </div>

      {protein.paeMatrix && (
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="font-bold text-sm">PAE Heatmap</h3>
          <PaeMap matrix={protein.paeMatrix} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold text-sm">🎨 Annotation & Domain Coloring</h3>
          {displayAnnot.length > 0 && (
            <button onClick={() => exportAnnotationLegend(displayAnnot, `Annotation_Domain_${annotSrc}`)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300">
              📥 Download Legend
            </button>
          )}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {(['UniProt', 'InterPro', 'PAE'] as const).map(src => (
            <button key={src} onClick={() => setAnnotSrc(src)}
              className={`px-3 py-1 rounded-full text-xs border ${annotSrc === src ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300'}`}>
              {src}
            </button>
          ))}
          <button onClick={doFetchAnnot} disabled={annotLoading}
            className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 disabled:opacity-50">
            {annotLoading ? '⏳' : '🔄'}
          </button>
        </div>
        {annotMsg && <p className="text-xs text-gray-500">{annotMsg}</p>}
        {displayAnnot.length > 0 ? (
          <>
            <MoleculeViewer pdb={protein.pdbText} renderMode={renderMode} palette={palette} annotations={displayAnnot} />
            <AnnotationStrip items={displayAnnot} seqLen={protein.chain.length} showDownload={false} />
          </>
        ) : !annotLoading && (
          <p className="text-xs text-gray-400">No annotations loaded. Select a source above and click 🔄.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <h3 className="font-bold text-sm">🧬 MSA Search</h3>
        {!msaData ? (
          <button onClick={doFetchMSA} disabled={msaLoading}
            className="px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-50">
            {msaLoading ? '⏳ Searching…' : '🔍 Run MSA'}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="bg-emerald-50 rounded-lg p-3 text-center inline-block">
              <div className="text-xs text-gray-500">Sequences</div>
              <div className="text-lg font-bold text-emerald-700">{msaData.totalSeqs}</div>
            </div>
            {msaData.homologs.length > 0 && (
              <div className="max-h-80 overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-1 text-left">Accession</th>
                      <th className="p-1">Identity</th><th className="p-1">E-value</th>
                      <th className="p-1">Coverage</th><th className="p-1">3D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {msaData.homologs.slice(0, 50).map((h, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-1 font-mono">{h.id?.slice(0, 20)}</td>
                        <td className="p-1 text-center">{h.seqIdentity}%</td>
                        <td className="p-1 text-center">
                          {h.expectValue != null ? h.expectValue.toExponential(1) : '—'}
                        </td>
                        <td className="p-1 text-center">
                          {h.queryCoverage != null ? `${h.queryCoverage}%` : '—'}
                        </td>
                        <td className="p-1 text-center">
                          {looksLikeAccession(h.id) ? (
                            <button onClick={() => onLoadHit({ accession: h.id, label: h.id })}
                              disabled={globalLoading}
                              className="text-emerald-600 hover:text-emerald-800 disabled:opacity-50">
                              👁️
                            </button>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {protein.uniprotMeta && (
        <div className="bg-white rounded-xl shadow p-4 text-sm space-y-1">
          <h3 className="font-bold">UniProt</h3>
          <p><strong>Name:</strong> {protein.uniprotMeta.proteinName}</p>
          <p><strong>Gene:</strong> {protein.uniprotMeta.geneName}</p>
          <p><strong>Species:</strong> {protein.uniprotMeta.species}</p>
        </div>
      )}
    </div>
  );
}