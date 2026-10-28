"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Barra fina arriba que avanza mientras carga la página a la que se acaba de hacer clic (termina sola al cambiar la ruta). */
export function RouteProgress() {
  const path = usePathname();
  const search = useSearchParams().toString();
  const key = `${path}?${search}`;
  const keyRef = useRef(key);
  const [from, setFrom] = useState<string | null>(null);

  useEffect(() => { keyRef.current = key; }, [key]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      if (`${url.pathname}?${url.search.replace(/^\?/, "")}` === keyRef.current) return;
      setFrom(keyRef.current);
      clearTimeout(timer);
      timer = setTimeout(() => setFrom(null), 10_000); // por si la navegación nunca termina
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); clearTimeout(timer); };
  }, []);

  const loading = from !== null && from === key; // al cambiar la ruta, `key` deja de coincidir y la barra termina
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-gradient-to-r from-accent-solid to-cyan-400"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, transition: { duration: 8, ease: [0.1, 0.8, 0.2, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.35 } }}
        />
      )}
    </AnimatePresence>
  );
}
