"use client";

import { useEffect, useState } from "react";

// Flecha fija abajo de la pantalla; baja una pantalla y se oculta al llegar al final.
export function ScrollDown() {
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const check = () => setAtEnd(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <button
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
      aria-label="Seguir bajando"
      className={`fixed bottom-5 left-1/2 z-40 -translate-x-1/2 cursor-pointer text-accent transition-opacity duration-300 ${atEnd ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <svg viewBox="0 0 24 24" className="h-9 w-9 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
