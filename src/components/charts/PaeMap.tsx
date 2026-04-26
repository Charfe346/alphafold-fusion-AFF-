import { ExportableChart } from '../ui/ExportableChart';
import { drawXAxis } from '../../helpers/axisHelpers';

export function PaeMap({ matrix }: { matrix: number[][] }) {
  return (
    <ExportableChart w={500} h={420} label="PAE_heatmap" deps={[matrix]}
      style={{ width: '100%', maxWidth: 500 }}
      paint={(ctx, w, h) => {
        const n = matrix.length; if (!n) return;
        const p = { l: 50, r: 55, t: 15, b: 40 },
          pw = w - p.l - p.r, ph = h - p.t - p.b, cap = 30;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const v = Math.min(cap, matrix[i][j] || 0) / cap;
          ctx.fillStyle = `rgb(${Math.round(4 + v * 251)},${Math.round(120 - v * 90)},${Math.round(82 + (1 - v) * 100)})`;
          ctx.fillRect(p.l + (j / n) * pw, p.t + (i / n) * ph,
            Math.ceil(pw / n) + 1, Math.ceil(ph / n) + 1);
        }
        drawXAxis(ctx, p, pw, ph, n, 'Scored Residue');
        const yInterval = n <= 100 ? 20 : n <= 300 ? 50 : 100;
        ctx.fillStyle = '#666'; ctx.font = '9px sans-serif';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let i = 0; i <= n; i += yInterval) {
          if (i === 0) continue;
          const y = p.t + (i / n) * ph;
          ctx.fillText(String(i), p.l - 5, y);
          ctx.beginPath(); ctx.moveTo(p.l - 3, y); ctx.lineTo(p.l, y);
          ctx.strokeStyle = '#999'; ctx.lineWidth = 0.5; ctx.stroke();
        }
        ctx.save(); ctx.translate(10, p.t + ph / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#555'; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Aligned Residue', 0, 0); ctx.restore();
        const cbX = p.l + pw + 8, cbW = 12, cbH = ph;
        for (let y = 0; y < cbH; y++) {
          const v = y / cbH;
          ctx.fillStyle = `rgb(${Math.round(4 + v * 251)},${Math.round(120 - v * 90)},${Math.round(82 + (1 - v) * 100)})`;
          ctx.fillRect(cbX, p.t + y, cbW, 2);
        }
        ctx.fillStyle = '#666'; ctx.font = '8px sans-serif'; ctx.textAlign = 'left';
        ctx.fillText('0 Å', cbX + cbW + 3, p.t + 5);
        ctx.fillText(`${cap} Å`, cbX + cbW + 3, p.t + cbH);
      }}
    />
  );
}