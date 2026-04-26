import { ExportableChart } from '../ui/ExportableChart';
import { drawYAxis, drawXAxis } from '../../helpers/axisHelpers';

export function ConfidenceTrace({ scores }: { scores: number[] }) {
  return (
    <ExportableChart w={660} h={220} label="pLDDT_trace" deps={[scores]}
      style={{ width: '100%', maxWidth: 660 }}
      paint={(ctx, _w, _h) => {
        if (!scores.length) return;
        const w = _w, h = _h;
        const p = { l: 55, r: 15, t: 15, b: 35 }, pw = w - p.l - p.r, ph = h - p.t - p.b;
        const ySteps = [0, 20, 40, 60, 80, 100];
        drawYAxis(ctx, p, ph, 0, 100, ySteps, 'pLDDT Score');
        drawXAxis(ctx, p, pw, ph, scores.length, 'Residue Number');
        const tierBands: [number, number, string][] = [
          [0, 50, 'rgba(230,81,0,0.06)'], [50, 70, 'rgba(251,192,45,0.06)'],
          [70, 90, 'rgba(66,165,245,0.06)'], [90, 100, 'rgba(13,71,161,0.06)'],
        ];
        for (const [lo, hi, col] of tierBands) {
          const y1 = p.t + ph * (1 - hi / 100), y2 = p.t + ph * (1 - lo / 100);
          ctx.fillStyle = col; ctx.fillRect(p.l, y1, pw, y2 - y1);
        }
        ctx.beginPath(); ctx.strokeStyle = '#059669'; ctx.lineWidth = 1.8;
        for (let i = 0; i < scores.length; i++) {
          const x = p.l + (i / Math.max(1, scores.length - 1)) * pw;
          const y = p.t + ph * (1 - scores[i] / 100);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }}
    />
  );
}