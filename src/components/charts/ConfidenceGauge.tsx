import { ExportableChart } from '../ui/ExportableChart';

export function ConfidenceGauge({ value }: { value: number }) {
  return (
    <ExportableChart w={240} h={140} label="pLDDT_gauge" deps={[value]}
      paint={(ctx, w, h) => {
        const cx = w / 2, cy = h - 20, r = Math.min(w, h) - 40;
        const ranges: [number, number, string][] = [
          [0, 50, '#E65100'], [50, 70, '#FBC02D'],
          [70, 90, '#42A5F5'], [90, 100, '#0D47A1'],
        ];
        for (const [lo, hi, col] of ranges) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, Math.PI + (lo / 100) * Math.PI, Math.PI + (hi / 100) * Math.PI);
          ctx.lineWidth = 18; ctx.strokeStyle = col; ctx.stroke();
        }
        const needle = Math.PI + (Math.min(100, Math.max(0, value)) / 100) * Math.PI;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (r - 10) * Math.cos(needle), cy + (r - 10) * Math.sin(needle));
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#333'; ctx.fill();
        ctx.fillStyle = '#333'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(`${value.toFixed(1)}`, cx, cy - 15);
      }}
    />
  );
}