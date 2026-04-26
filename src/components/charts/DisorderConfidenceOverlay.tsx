import { ExportableChart } from '../ui/ExportableChart';
import { drawYAxis, drawXAxis } from '../../helpers/axisHelpers';

export function DisorderConfidenceOverlay({ scores, disorder }: {
  scores: number[]; disorder: number[];
}) {
  return (
    <ExportableChart w={660} h={230} label="disorder_confidence_overlay"
      deps={[scores, disorder]} style={{ width: '100%', maxWidth: 660 }}
      paint={(ctx, w, h) => {
        if (!scores.length) return;
        const p = { l: 55, r: 15, t: 20, b: 35 }, pw = w - p.l - p.r, ph = h - p.t - p.b;
        const n = scores.length;
        const ySteps = [0, 20, 40, 60, 80, 100];
        drawYAxis(ctx, p, ph, 0, 100, ySteps, 'Score');
        drawXAxis(ctx, p, pw, ph, n, 'Residue Number');
        for (let i = 0; i < n; i++) {
          const ds = i < disorder.length ? disorder[i] : 0;
          if (ds > 0.6 && scores[i] < 70) {
            const x = p.l + (i / Math.max(1, n - 1)) * pw;
            ctx.fillStyle = 'rgba(234,88,12,0.12)';
            ctx.fillRect(x - 1, p.t, 3, ph);
          }
        }
        ctx.beginPath(); ctx.strokeStyle = '#059669'; ctx.lineWidth = 1.8;
        for (let i = 0; i < n; i++) {
          const x = p.l + (i / Math.max(1, n - 1)) * pw;
          const y = p.t + ph * (1 - scores[i] / 100);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (disorder.length) {
          ctx.beginPath(); ctx.strokeStyle = '#EA580C'; ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 3]);
          for (let i = 0; i < disorder.length; i++) {
            const x = p.l + (i / Math.max(1, disorder.length - 1)) * pw;
            const y = p.t + ph * (1 - disorder[i] * 100 / 100);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.strokeStyle = 'rgba(234,88,12,0.4)'; ctx.lineWidth = 1;
        ctx.setLineDash([6, 4]);
        const thrY = p.t + ph * (1 - 60 / 100);
        ctx.beginPath(); ctx.moveTo(p.l, thrY); ctx.lineTo(p.l + pw, thrY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#EA580C'; ctx.font = '8px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('IDR threshold', p.l + 4, thrY - 4);
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'right';
        ctx.fillStyle = '#059669'; ctx.fillText('— pLDDT', p.l + pw, p.t + 12);
        ctx.fillStyle = '#EA580C'; ctx.fillText('- - Disorder', p.l + pw, p.t + 25);
      }}
    />
  );
}