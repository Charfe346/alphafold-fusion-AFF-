import { ExportableChart } from '../ui/ExportableChart';
import { drawYAxis, drawXAxis } from '../../helpers/axisHelpers';

export function ErrorTrace({ errors }: { errors: number[] }) {
  return (
    <ExportableChart w={660} h={200} label="positional_error" deps={[errors]}
      style={{ width: '100%', maxWidth: 660 }}
      paint={(ctx, w, h) => {
        if (!errors.length) return;
        const p = { l: 55, r: 15, t: 15, b: 35 }, pw = w - p.l - p.r, ph = h - p.t - p.b;
        const maxE = Math.max(...errors, 2);
        const rawStep = maxE / 5;
        const niceStep = [0.5, 1, 2, 5, 10, 15, 20].find(s => s >= rawStep) || rawStep;
        const ySteps: number[] = [];
        for (let v = 0; v <= maxE * 1.05; v += niceStep)
          ySteps.push(Math.round(v * 10) / 10);
        if (ySteps[ySteps.length - 1] < maxE)
          ySteps.push(Math.round((ySteps[ySteps.length - 1] + niceStep) * 10) / 10);
        const yMax = ySteps[ySteps.length - 1];
        drawYAxis(ctx, p, ph, 0, yMax, ySteps, 'Error (Å)',
          v => v.toFixed(v % 1 === 0 ? 0 : 1));
        drawXAxis(ctx, p, pw, ph, errors.length, 'Residue Number');
        ctx.beginPath(); ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 1.8;
        for (let i = 0; i < errors.length; i++) {
          const x = p.l + (i / Math.max(1, errors.length - 1)) * pw;
          const y = p.t + ph * (1 - errors[i] / yMax);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }}
    />
  );
}