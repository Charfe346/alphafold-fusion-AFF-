import { useEffect, useRef } from 'react';

export function useCanvas(
  painter: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  deps: unknown[],
  w: number,
  h: number
) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const dpr = Math.max(window.devicePixelRatio || 1, 2);
    el.width = w * dpr; el.height = h * dpr;
    el.style.width = w + 'px'; el.style.height = h + 'px';
    const ctx = el.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr);
    painter(ctx, w, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}