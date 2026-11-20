"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellLink } from "@/components/app/BellLink";
import { LangToggle } from "./LangToggle";
import { useT } from "./LocaleProvider";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

type NavUser = { name: string; email: string; phone: string | null; staff: boolean; roleLabel: string } | null;

const LINKS = (user: NavUser) => [
  { href: "/", label: "Inicio", hide: true },
  { href: "/servicios", label: "Servicios", hide: true }, // en móvil se llega desde el botón de la portada
  ...(user ? [] : [{ href: "/registro", label: "Crear cuenta", hide: true }]),
];

const LOCK = <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;

// Enlaces de la barra superior: el de la página actual se marca con color y una línea que se desliza entre secciones.
export function NavLinks({ user, unread }: { user: NavUser; unread: number }) {
  const path = usePathname();
  const t = useT();
  const here = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <nav className="flex items-center gap-2 text-sm font-medium text-mute sm:gap-7">
      {LINKS(user).map((l) => (
        <Link key={l.href} href={l.href} aria-current={here(l.href) ? "page" : undefined} className={`relative whitespace-nowrap py-1 transition-colors hover:text-ink ${l.hide ? "hidden lg:block" : ""} ${here(l.href) ? "font-semibold text-accent" : ""}`}>
          {t(l.label)}
          {/* Línea que crece al entrar. (Antes se deslizaba con layoutId, pero la barra es fija y al cambiar de página con scroll rebotaba desde abajo.) */}
          {here(l.href) && <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-center animate-[bar-grow_.3s_ease-out] rounded-full bg-accent motion-reduce:animate-none" />}
        </Link>
      ))}
      {/* Entrada al portal (equipo y clientes). En celular queda solo el candado para que quepa la barra. */}
      {!user && (
        <Link href="/app/login" title={t("Iniciar sesión")} aria-label={t("Portal de proyectos · Iniciar sesión")} className="flex h-9 w-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-mute ring-1 ring-line transition-colors hover:bg-soft hover:text-accent active:scale-90 lg:h-auto lg:w-auto lg:px-3.5 lg:py-1.5">
          {LOCK}<span className="hidden lg:inline">{t("Portal de proyectos")}</span>
        </Link>
      )}
      <Link
        href="/cotizar"
        aria-current={here("/cotizar") ? "page" : undefined}
        className={`group relative ml-1 inline-flex items-center gap-1.5 overflow-hidden rounded-full px-4 py-1.5 font-bold transition duration-300 sm:px-5 sm:py-2 hover:-translate-y-0.5 hover:scale-105 active:scale-95 sm:ml-3 ${here("/cotizar") ? "bg-surface text-accent shadow-[0_0_0_2px_var(--accent)]" : "bg-gradient-to-r from-accent-solid to-accent-solid-2 text-white shadow-[0_8px_22px_-6px_rgba(11,126,168,0.75)] hover:shadow-[0_12px_28px_-6px_rgba(11,126,168,0.9)]"}`}
      >
        <span aria-hidden className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-surface/30 transition-all duration-700 group-hover:left-[150%]" />
        {t("Cotizar")}
        <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg>
      </Link>
      {user && <BellLink href={user.staff ? "/app/avisos" : "/avisos"} count={unread} />}
      <LangToggle />
      <ThemeToggle />
      {user && <UserMenu user={user} />}
    </nav>
  );
}
