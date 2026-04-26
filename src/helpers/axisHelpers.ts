export interface AxisConfig {
  l: number; r: number; t: number; b: number;
}

export function drawYAxis(
  ctx: CanvasRenderingContext2D, p: AxisConfig, ph: number,
  yMin: number, yMax: number, steps: number[], label: string,
  formatTick?: (v: number) => string
) {
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 0.5;
  const pw = ctx.canvas.width / (Math.max(window.devicePixelRatio || 1, 2)) - p.l - p.r;
  for (const y of steps) {
    const py = p.t + ph * (1 - (y - yMin) / (yMax - yMin));
    ctx.beginPath(); ctx.moveTo(p.l, py); ctx.lineTo(p.l + pw, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p.l - 3, py); ctx.lineTo(p.l, py);
    ctx.strokeStyle = '#999'; ctx.stroke(); ctx.strokeStyle = '#e5e7eb';
    ctx.fillStyle = '#666'; ctx.font = '9px sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(formatTick ? formatTick(y) : String(y), p.l - 5, py);
  }
  ctx.beginPath(); ctx.moveTo(p.l, p.t); ctx.lineTo(p.l, p.t + ph);
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.stroke();
  if (label) {
    ctx.save(); ctx.translate(10, p.t + ph / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#555'; ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 0); ctx.restore();
  }
}

export function drawXAxis(
  ctx: CanvasRenderingContext2D, p: AxisConfig, pw: number,
  ph: number, dataLen: number, label: string
) {
  ctx.beginPath(); ctx.moveTo(p.l, p.t + ph); ctx.lineTo(p.l + pw, p.t + ph);
  ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.stroke();
  const maxTicks = 8;
  const rawInterval = Math.ceil(dataLen / maxTicks);
  const niceIntervals = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
  let interval = niceIntervals.find(n => n >= rawInterval) || rawInterval;
  if (dataLen <= 20) interval = 2;
  else if (dataLen <= 50) interval = 5;

  const lastTick = dataLen;
  ctx.font = '9px sans-serif';
  const lastLabelW = ctx.measureText(String(lastTick)).width;
  const minPixelGap = lastLabelW + 8;
  const lastX = p.l + pw;

  ctx.fillStyle = '#666'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';

  for (let i = interval; i <= dataLen; i += interval) {
    const x = p.l + ((i - 1) / Math.max(1, dataLen - 1)) * pw;
    if (i !== lastTick && (lastX - x) < minPixelGap) continue;
    ctx.beginPath(); ctx.moveTo(x, p.t + ph); ctx.lineTo(x, p.t + ph + 4);
    ctx.strokeStyle = '#999'; ctx.lineWidth = 0.5; ctx.stroke();
    ctx.fillStyle = '#666';
    ctx.fillText(String(i), x, p.t + ph + 5);
  }

  const firstX = p.l;
  ctx.beginPath(); ctx.moveTo(firstX, p.t + ph); ctx.lineTo(firstX, p.t + ph + 4);
  ctx.strokeStyle = '#999'; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.fillStyle = '#666';
  ctx.fillText('1', firstX, p.t + ph + 5);

  ctx.beginPath(); ctx.moveTo(lastX, p.t + ph); ctx.lineTo(lastX, p.t + ph + 4);
  ctx.strokeStyle = '#999'; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.fillStyle = '#666';
  ctx.textAlign = 'right';
  ctx.fillText(String(lastTick), lastX, p.t + ph + 5);
  ctx.textAlign = 'center';

  if (label) {
    ctx.fillStyle = '#555'; ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(label, p.l + pw / 2, p.t + ph + 18);
  }
}