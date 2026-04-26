import { useEffect, useRef, useCallback } from 'react';
import { type RenderMode, type Palette, type Annotation, ANNOTATION_PALETTE } from '../../forge-engine';
import { DpiExportBtn } from '../ui/DpiExportBtn';

declare const $3Dmol: any;

function applyPalette(v: any, mode: RenderMode, pal: Palette) {
  const s = mode.toLowerCase();
  if (pal === 'Confidence (4-tier)') {
    const colorfunc = (atom: { b?: number }) => {
      const b = atom.b ?? 50;
      return b >= 90 ? '#0D47A1' : b >= 70 ? '#42A5F5' : b >= 50 ? '#FBC02D' : '#E65100';
    };
    v.setStyle({}, { [s]: { colorfunc, ...(s === 'stick' ? { radius: 0.3 } : s === 'sphere' ? { radius: 1.0 } : {}) } });
  } else if (pal === 'Rainbow') {
    if (s === 'cartoon') v.setStyle({}, { cartoon: { color: 'spectrum' } });
    else v.setStyle({}, { [s]: { colorscheme: 'spectrum' } });
  } else if (pal === 'Per-chain') {
    v.setStyle({}, { [s]: { colorscheme: 'chain' } });
  } else {
    const cs = { prop: 'b', gradient: 'roygb', min: 0, max: 100 };
    v.setStyle({}, { [s]: { colorscheme: cs, ...(s === 'stick' ? { radius: 0.3 } : s === 'sphere' ? { radius: 1.0 } : {}) } });
  }
}

export function MoleculeViewer({ pdb, renderMode, palette, annotations }: {
  pdb: string; renderMode: RenderMode; palette: Palette; annotations?: Annotation[];
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!boxRef.current || !pdb || typeof $3Dmol === 'undefined') return;
    boxRef.current.innerHTML = '';
    try {
      const v = $3Dmol.createViewer(boxRef.current, { backgroundColor: 'white' });
      viewerRef.current = v;
      v.addModel(pdb, 'pdb');
      if (annotations && annotations.length > 0) {
        const sty = renderMode.toLowerCase();
        const grey = sty === 'stick' ? { stick: { color: '#DDD', radius: 0.3 } }
          : sty === 'sphere' ? { sphere: { color: '#DDD', radius: 1.0 } }
          : sty === 'line' ? { line: { color: '#DDD' } }
          : { cartoon: { color: '#DDD' } };
        v.setStyle({}, grey);
        for (let i = 0; i < annotations.length; i++) {
          const a = annotations[i],
            col = ANNOTATION_PALETTE[i % ANNOTATION_PALETTE.length];
          const resi: number[] = [];
          for (let r = a.from; r <= a.to; r++) resi.push(r);
          const ds = sty === 'stick' ? { stick: { color: col, radius: 0.3 } }
            : sty === 'sphere' ? { sphere: { color: col, radius: 1.0 } }
            : sty === 'line' ? { line: { color: col } }
            : { cartoon: { color: col } };
          v.setStyle({ resi }, ds);
        }
      } else {
        applyPalette(v, renderMode, palette);
      }
      v.zoomTo(); v.render();
    } catch (e) { console.error('3Dmol:', e); }
    return () => {
      if (viewerRef.current) try { viewerRef.current.clear(); } catch { /* ok */ }
    };
  }, [pdb, renderMode, palette, annotations]);

  const exportViewer = useCallback((dpi: number) => {
    const canvas = boxRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `structure_3D_${dpi}dpi.png`;
    a.href = canvas.toDataURL('image/png'); a.click();
  }, []);

  return (
    <div>
      <div style={{
        position: 'relative', width: '100%', height: '400px',
        border: '1px solid #d1d5db', borderRadius: '12px', overflow: 'hidden',
        contain: 'strict', isolation: 'isolate',
      }}>
        <div ref={boxRef} style={{ position: 'absolute', inset: 0 }} />
      </div>
      <DpiExportBtn onExport={exportViewer} />
    </div>
  );
}