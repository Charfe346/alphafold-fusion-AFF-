import { type Annotation, ANNOTATION_PALETTE } from '../forge-engine';

export function exportAnnotationLegend(items: Annotation[], title: string) {
  const lineH = 22, pad = 15, swatchW = 14;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d'); if (!ctx) return;
  ctx.font = '12px sans-serif';
  const maxTextW = Math.max(
    200,
    ...items.map(d => ctx.measureText(`${d.name} (${d.from}–${d.to})`).width + swatchW + 20)
  );
  c.width = Math.round((maxTextW + pad * 2) * 2);
  c.height = Math.round((lineH * items.length + pad * 2 + 24) * 2);
  ctx.scale(2, 2);
  const cw = maxTextW + pad * 2, ch = lineH * items.length + pad * 2 + 24;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = '#1f2937'; ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(title, pad, pad);
  for (let i = 0; i < items.length; i++) {
    const y = pad + 24 + i * lineH;
    const col = ANNOTATION_PALETTE[i % ANNOTATION_PALETTE.length];
    ctx.fillStyle = col;
    ctx.fillRect(pad, y + 2, swatchW, swatchW);
    ctx.fillStyle = '#333'; ctx.font = '12px sans-serif';
    ctx.fillText(`${items[i].name} (${items[i].from}–${items[i].to})`, pad + swatchW + 8, y + 2);
  }
  const a = document.createElement('a');
  a.download = `${title.replace(/\s+/g, '_')}_legend.png`;
  a.href = c.toDataURL('image/png'); a.click();
}