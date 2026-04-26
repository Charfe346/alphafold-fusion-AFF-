import { ExportableChart } from '../ui/ExportableChart';
import { drawYAxis, drawXAxis } from '../../helpers/axisHelpers';
import { contactDensityFromPAE } from '../../forge-engine';

export function ContactDensityChart({ pae }: { pae: number[][] }) {
  const density = contactDensityFromPAE(pae);
  return (
    <ExportableChart w={660} h={220} label="contact_density" deps={[pae]}
      style={{ width: '100%', maxWidth: 660 }}
      paint={(ctx, w, h) => {
        if (!density.length) return;
        const p = { l: 60, r: 15, t: 20, b: 40 }, pw = w - p.l - p.r, ph = h - p.t - p.b;
        const maxD = Math.max(...density, 1);
        const niceSteps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
        const rawStep = maxD / 5;
        const stepSize = niceSteps.find(s => s >= rawStep) || Math.ceil(rawStep);
        const yMax = Math.ceil(maxD / stepSize) * stepSize || stepSize;
        const ySteps: number[] = [];
        for (let v = 0; v <= yMax; v += stepSize) ySteps.push(v);
        drawYAxis(ctx, p, ph, 0, yMax, ySteps, 'Contacts (PAE<8Å)');
        drawXAxis(ctx, p, pw, ph, density.length, 'Residue Number');
        ctx.beginPath();
        for (let i = 0; i < density.length; i++) {
          const x = p.l + (i / Math.max(1, density.length - 1)) * pw;
          const y = p.t + ph * (1 - density[i] / yMax);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(p.l + pw, p.t + ph);
        ctx.lineTo(p.l, p.t + ph);
        ctx.closePath();
        ctx.fillStyle = 'rgba(124, 58, 237, 0.08)';
        ctx.fill();
        ctx.beginPath(); ctx.strokeStyle = '#7C3AED'; ctx.lineWidth = 1.8;
        for (let i = 0; i < density.length; i++) {
          const x = p.l + (i / Math.max(1, density.length - 1)) * pw;
          const y = p.t + ph * (1 - density[i] / yMax);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }}
    />
  );
}