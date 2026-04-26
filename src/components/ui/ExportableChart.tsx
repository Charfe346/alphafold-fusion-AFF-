import { useCallback, useRef } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { DpiExportBtn } from './DpiExportBtn';

export function ExportableChart({ paint, deps, w, h, label, style }: {
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  deps: unknown[]; w: number; h: number; label: string;
  style?: React.CSSProperties;
}) {
  const ref = useCanvas(paint, deps, w, h);
  const paintRef = useRef(paint);
  paintRef.current = paint;
  const handleExport = useCallback((dpi: number) => {
    const scale = dpi / 96;
    const c = document.createElement('canvas');
    c.width = Math.round(w * scale); c.height = Math.round(h * scale);
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.scale(scale, scale);
    paintRef.current(ctx, w, h);
    const a = document.createElement('a');
    a.download = `${label.replace(/\s+/g, '_')}_${dpi}dpi.png`;
    a.href = c.toDataURL('image/png'); a.click();
  }, [w, h, label]);
  return (
    <div className="inline-block">
      <canvas ref={ref} style={style} />
      <DpiExportBtn onExport={handleExport} />
    </div>
  );
}