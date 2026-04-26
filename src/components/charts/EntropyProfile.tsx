import { ExportableChart } from '../ui/ExportableChart';
import { drawYAxis, drawXAxis } from '../../helpers/axisHelpers';
import { sequenceEntropy } from '../../forge-engine';

export function EntropyProfile({ sequence }: { sequence: string }) {
  const ent = sequenceEntropy(sequence);
  return (
    <ExportableChart w={660} h={200} label="shannon_entropy" deps={[sequence]}
      style={{ width: '100%', maxWidth: 660 }}
      paint={(ctx, w, h) => {
        if (!ent.length) return;
        const p = { l: 55, r: 15, t: 15, b: 35 }, pw = w - p.l - p.r, ph = h - p.t - p.b;
        const ySteps = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
        drawYAxis(ctx, p, ph, 0, 1, ySteps, 'Shannon Entropy (norm)',
          v => v.toFixed(1));
        drawXAxis(ctx, p, pw, ph, ent.length, 'Residue Number');
        ctx.beginPath(); ctx.strokeStyle = '#9333EA'; ctx.lineWidth = 1.8;
        for (let i = 0; i < ent.length; i++) {
          const x = p.l + (i / Math.max(1, ent.length - 1)) * pw;
          const y = p.t + ph * (1 - ent[i]);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }}
    />
  );
}