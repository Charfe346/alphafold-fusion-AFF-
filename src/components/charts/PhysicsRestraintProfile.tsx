import { ExportableChart } from '../ui/ExportableChart';
import { drawYAxis, drawXAxis } from '../../helpers/axisHelpers';
import { type ProteinRecord } from '../../forge-engine';

export function PhysicsRestraintProfile({ protein }: { protein: ProteinRecord }) {
  return (
    <ExportableChart w={660} h={220} label="physics_restraint_profile"
      deps={[protein.restraintProfile]} style={{ width: '100%', maxWidth: 660 }}
      paint={(ctx, w, h) => {
        const rp = protein.restraintProfile;
        if (!rp.length) return;
        const p = { l: 60, r: 15, t: 15, b: 35 }, pw = w - p.l - p.r, ph = h - p.t - p.b;
        const kMax = Math.max(100, ...rp.map(r => r.kValue)) * 1.1;
        const rawStep = kMax / 5;
        const niceStep = [100, 200, 500, 1000, 2000, 5000].find(s => s >= rawStep) || rawStep;
        const ySteps: number[] = [];
        for (let v = 0; v <= kMax; v += niceStep) ySteps.push(Math.round(v));
        drawYAxis(ctx, p, ph, 0, kMax, ySteps, 'k (kJ/mol/nm²)');
        drawXAxis(ctx, p, pw, ph, rp.length, 'Residue Number');
        for (let i = 0; i < rp.length; i++) {
          if (rp[i].isIDR) {
            const x = p.l + (i / Math.max(1, rp.length - 1)) * pw;
            ctx.fillStyle = 'rgba(234,88,12,0.15)';
            ctx.fillRect(x - 1, p.t, 3, ph);
          }
        }
        ctx.beginPath(); ctx.strokeStyle = '#059669'; ctx.lineWidth = 2;
        for (let i = 0; i < rp.length; i++) {
          const x = p.l + (i / Math.max(1, rp.length - 1)) * pw;
          const y = p.t + ph * (1 - rp[i].kValue / kMax);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'right';
        ctx.fillStyle = '#059669'; ctx.fillText('k = 3kBT/σ²', p.l + pw, p.t + 10);
        ctx.fillStyle = '#EA580C'; ctx.fillText('■ = IDR (k=0)', p.l + pw, p.t + 22);
      }}
    />
  );
}