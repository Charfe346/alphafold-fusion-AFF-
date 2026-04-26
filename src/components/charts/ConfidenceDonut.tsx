import { ExportableChart } from '../ui/ExportableChart';
import { binConfidence, CONFIDENCE_TIERS } from '../../forge-engine';

export function ConfidenceDonut({ scores }: { scores: number[] }) {
  const bins = binConfidence(scores);
  const total = scores.length || 1;
  const tiers = Object.entries(CONFIDENCE_TIERS);
  return (
    <ExportableChart w={220} h={220} label="pLDDT_donut" deps={[scores]}
      paint={(ctx, w, h) => {
        const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 20;
        let angle = -Math.PI / 2;
        for (const [name, info] of tiers) {
          const count = bins[name as keyof typeof bins];
          const sweep = (count / total) * 2 * Math.PI;
          if (sweep > 0.001) {
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, angle, angle + sweep);
            ctx.fillStyle = info.hex; ctx.fill();
            if (sweep > 0.15) {
              const mid = angle + sweep / 2;
              ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
              ctx.fillText(`${Math.round(100 * count / total)}%`,
                cx + r * 0.65 * Math.cos(mid), cy + r * 0.65 * Math.sin(mid));
            }
          }
          angle += sweep;
        }
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.45, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.fillStyle = '#333'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('pLDDT', cx, cy - 6);
        ctx.fillText(`${(scores.reduce((a, b) => a + b, 0) / total).toFixed(1)}`, cx, cy + 14);
      }}
    />
  );
}