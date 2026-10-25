"use client";

// Alterna la clase "dark" en <html> y la recuerda. No guarda estado: el ícono lo decide el CSS.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const apply = () => {
      const dark = root.classList.toggle("dark");
      try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* sin almacenamiento: solo dura esta visita */ }
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
    if (!document.startViewTransition) {
      // Sin View Transitions: los colores se mezclan despacio (ver .theme-fade en globals.css).
      root.classList.add("theme-fade");
      apply();
      setTimeout(() => root.classList.remove("theme-fade"), 1000);
      return;
    }
    // El tema nuevo se revela desde el botón hacia afuera, con el borde difuminado (máscara en globals.css).
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 220;
    root.style.setProperty("--tx", x + "px");
    root.style.setProperty("--ty", y + "px");
    const t = document.startViewTransition(apply);
    t.ready.then(() => root.animate({ "--tr": ["0px", end + "px"] }, { duration: 1100, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards", pseudoElement: "::view-transition-new(root)" }));
    t.finished.finally(() => { root.style.removeProperty("--tx"); root.style.removeProperty("--ty"); });
  };
  return (
    <button onClick={toggle} aria-label="Cambiar entre modo claro y oscuro" title="Modo claro / oscuro" className={`relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full text-mute transition duration-300 hover:scale-110 hover:bg-soft hover:text-accent active:scale-90 ${className}`}>
      <svg viewBox="0 0 24 24" className="absolute h-5 w-5 transition-all duration-500 ease-out dark:-rotate-90 dark:scale-0 dark:opacity-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
      <svg viewBox="0 0 24 24" className="absolute h-5 w-5 rotate-90 scale-0 opacity-0 transition-all duration-500 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
    </button>
  );
}
