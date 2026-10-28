"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Flecha discreta abajo de la pantalla: solo aparece al llegar a una página con bastante por bajar
// (más de media pantalla) y se oculta en cuanto la persona empieza a bajar.
export function ScrollDown() {
  const [show, setShow] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const check = () => {
      const left = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      setShow(window.scrollY < 60 && left > window.innerHeight * 0.5);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    const ro = new ResizeObserver(check); // la página puede crecer después de cargar
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      ro.disconnect();
    };
  }, [path]);

  return (
    <button
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
      aria-label="Seguir bajando"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-4 left-1/2 z-40 -translate-x-1/2 cursor-pointer text-accent transition-opacity duration-500 ${show ? "opacity-60 hover:opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 motion-safe:animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
