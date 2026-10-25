"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function CountUp({ to, className = "" }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return;
    const c = animate(0, to, { duration: 2.4, ease: [0.16, 1, 0.3, 1], onUpdate: (l) => setV(Math.round(l)) });
    return () => c.stop();
  }, [inView, to, reduce]);

  return <span ref={ref} className={`tabular-nums ${className}`}>{reduce ? to : v}</span>;
}
