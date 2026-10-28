import Link from "next/link";

/** Campanita de avisos con contador de los no leídos. Sirve tanto en el sitio como en el panel (no usa nada del servidor). */
export function BellLink({ href, count, className = "" }: { href: string; count: number; className?: string }) {
  return (
    <Link href={href} aria-label={count ? `Avisos: ${count} sin leer` : "Avisos"} className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-mute transition duration-300 hover:scale-110 hover:bg-soft hover:text-accent active:scale-90 ${className}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        <path d="M13.7 20a2 2 0 0 1-3.4 0" />
      </svg>
      {count > 0 && <span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white">{count > 9 ? "9+" : count}</span>}
    </Link>
  );
}
