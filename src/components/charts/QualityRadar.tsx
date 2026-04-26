import { ExportableChart } from '../ui/ExportableChart';
import {
  type ProteinRecord, computePrecisionMetrics, detectFlexibleRegions,
  sequenceEntropy,
} from '../../forge-engine';

export function QualityRadar({ protein }: { protein: ProteinRecord }) {
  const precision = computePrecisionMetrics(protein.confidenceScores);
  const flex = detectFlexibleRegions(protein.confidenceScores);
  const idrFrac = protein.restraintProfile.filter(r => r.isIDR).length / (protein.chain.length || 1);
  const entropy = sequenceEntropy(protein.chain);
  const avgEntropy = entropy.length > 0
    ? entropy.reduce((a, b) => a + b, 0) / entropy.length : 0;
  const axes = [
    { label: 'pLDDT', value: protein.meanConfidence / 100, raw: `${protein.meanConfidence.toFixed(0)}%` },
    { label: 'Resolution', value: Math.max(0, 1 - precision.effectiveResolution / 10), raw: `${precision.effectiveResolution.toFixed(1)} Å` },
    { label: 'Order', value: 1 - flex.flexibleFraction, raw: `${((1 - flex.flexibleFraction) * 100).toFixed(0)}%` },
    { label: 'Low IDR', value: 1 - idrFrac, raw: `${((1 - idrFrac) * 100).toFixed(0)}%` },
    { label: 'Complexity', value: avgEntropy, raw: `${(avgEntropy * 100).toFixed(0)}%` },
  ];
  const W = 460, H = 440;
  return (
    <div style={{ maxWidth: W }}>
      <ExportableChart w={W} h={H} label="quality_radar" deps={[protein]}
        paint={(ctx, w, h) => {
          const cx = w / 2, cy = h / 2 - 5, R = 130;
          const n = axes.length;
          for (const frac of [0.25, 0.5, 0.75, 1.0]) {
            ctx.beginPath();
            for (let i = 0; i <= n; i++) {
              const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
              const x = cx + R * frac * Math.cos(angle),
                y = cy + R * frac * Math.sin(angle);
              i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 0.5; ctx.stroke();
            ctx.fillStyle = '#ccc'; ctx.font = '9px sans-serif'; ctx.textAlign = 'left';
            ctx.fillText(`${(frac * 100).toFixed(0)}`, cx + 3, cy - R * frac + 3);
          }
          for (let i = 0; i < n; i++) {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const cosA = Math.cos(angle), sinA = Math.sin(angle);
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.lineTo(cx + R * cosA, cy + R * sinA);
            ctx.strokeStyle = '#d1d5db'; ctx.lineWidth = 0.5; ctx.stroke();
            const pad = 30;
            const lx = cx + (R + pad) * cosA;
            const ly = cy + (R + pad) * sinA;
            ctx.textBaseline = 'middle';
            if (cosA < -0.3) ctx.textAlign = 'right';
            else if (cosA > 0.3) ctx.textAlign = 'left';
            else ctx.textAlign = 'center';
            let lyAdj = ly;
            if (sinA < -0.5) lyAdj -= 8;
            if (sinA > 0.5) lyAdj += 8;
            ctx.fillStyle = '#1f2937'; ctx.font = 'bold 13px sans-serif';
            ctx.fillText(axes[i].label, lx, lyAdj);
            ctx.fillStyle = '#6b7280'; ctx.font = '11px sans-serif';
            ctx.fillText(axes[i].raw, lx, lyAdj + 16);
          }
          ctx.beginPath();
          for (let i = 0; i <= n; i++) {
            const idx = i % n;
            const angle = (idx / n) * 2 * Math.PI - Math.PI / 2;
            const v = Math.max(0, Math.min(1, axes[idx].value));
            const x = cx + R * v * Math.cos(angle),
              y = cy + R * v * Math.sin(angle);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.fillStyle = 'rgba(5,150,105,0.18)'; ctx.fill();
          ctx.strokeStyle = '#059669'; ctx.lineWidth = 2; ctx.stroke();
          for (let i = 0; i < n; i++) {
            const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
            const v = Math.max(0, Math.min(1, axes[i].value));
            ctx.beginPath();
            ctx.arc(cx + R * v * Math.cos(angle),
              cy + R * v * Math.sin(angle), 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#059669'; ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
          }
        }}
      />
    </div>
  );
}