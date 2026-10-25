"use client";

import { useEffect, useRef } from "react";

/** Líneas suaves que fluyen como el aire por un conducto. Se detiene fuera de pantalla y con movimiento reducido. */
export function Airflow({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true;

    const lines = Array.from({ length: 16 }, (_, i) => ({
      y: (i + 0.5) / 16,
      amp: 14 + Math.random() * 28,
      f: 0.6 + Math.random() * 0.9,
      sp: 0.12 + Math.random() * 0.2,
      ph: Math.random() * 6.28,
      a: 0.22 + Math.random() * 0.3,
      p: Math.random(),
    }));

    const yAt = (l: (typeof lines)[number], nx: number, t: number) =>
      l.y * h + Math.sin(nx * Math.PI * 2 * l.f + l.ph + t * l.sp) * l.amp * (0.55 + 0.45 * Math.sin(nx * 3 + t * 0.1));

    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now() / 1000);
    };

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      for (const l of lines) {
        ctx!.beginPath();
        for (let x = 0; x <= w + 8; x += 8) {
          const y = yAt(l, x / w, t);
          if (x === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `rgba(11,126,168,${l.a})`;
        ctx!.lineWidth = 1.2;
        ctx!.stroke();
        const nx = (l.p + t * l.sp * 0.08) % 1;
        ctx!.beginPath();
        ctx!.arc(nx * w, yAt(l, nx, t), 2.2, 0, 6.283);
        ctx!.fillStyle = "rgba(11,126,168,0.75)";
        ctx!.fill();
      }
    }

    const loop = (ms: number) => {
      if (!visible) { raf = 0; return; }
      draw(ms / 1000);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce && !raf) raf = requestAnimationFrame(loop);
    });
    const ro = new ResizeObserver(resize);
    resize();
    io.observe(c);
    ro.observe(c);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none h-full w-full ${className}`} />;
}
