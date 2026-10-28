"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Devuelve [ref, visible, seen]:
 * - visible: el elemento está (o casi está) en pantalla; sirve para pausar animaciones en bucle que nadie ve.
 * - seen: ya se vio al menos una vez; sirve para dibujar la entrada recién cuando la persona llega a verla.
 */
export function useVisible<T extends Element>(margin = "160px") {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting) setSeen(true);
    }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, visible, seen] as const;
}
