"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellLink } from "@/components/app/BellLink";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

type NavUser = { name: string; email: string; phone: string | null; staff: boolean; roleLabel: string } | null;

const LINKS = (user: NavUser) => [
  { href: "/", label: "Inicio", hide: true },
  { href: "/servicios", label: "Servicios", hide: true }, // en móvil se llega desde el botón de la portada
  ...(user
    ? []
    : [{ href: "/app/login", label: "Iniciar sesión", hide: true }, { href: "/registro", label: "Registro", hide: true }]),
];

// Enlaces de la barra superior: el de la página actual se marca con color y una línea que se desliza entre secciones.
export function NavLinks({ user, unread }: { user: NavUser; unread: number }) {
  const path = usePathname();
  const here = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <nav className="flex items-center gap-2 text-sm font-medium text-mute sm:gap-7">
      {LINKS(user).map((l) => (
        <Link key={l.href} href={l.href} aria-current={here(l.href) ? "page" : undefined} className={`relative whitespace-nowrap py-1 transition-colors hover:text-ink ${l.hide ? "hidden sm:block" : ""} ${here(l.href) ? "font-semibold text-accent" : ""}`}>
          {l.label}
          {here(l.href) && <motion.span layoutId="nav-active" className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
        </Link>
      ))}
      {/* Celular: el enlace de texto se cambia por un ícono para que quepa la barra */}
      {!user && (
        <Link href="/app/login" aria-label="Iniciar sesión" className="flex h-9 w-9 items-center justify-center rounded-full text-mute transition-colors hover:bg-soft hover:text-accent active:scale-90 sm:hidden">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></svg>
        </Link>
      )}
      <Link
        href="/cotizar"
        aria-current={here("/cotizar") ? "page" : undefined}
        className={`group relative ml-1 inline-flex items-center gap-1.5 overflow-hidden rounded-full px-4 py-1.5 font-bold transition duration-300 sm:px-5 sm:py-2 hover:-translate-y-0.5 hover:scale-105 active:scale-95 sm:ml-3 ${here("/cotizar") ? "bg-surface text-accent shadow-[0_0_0_2px_var(--accent)]" : "bg-gradient-to-r from-accent-solid to-accent-solid-2 text-white shadow-[0_8px_22px_-6px_rgba(11,126,168,0.75)] hover:shadow-[0_12px_28px_-6px_rgba(11,126,168,0.9)]"}`}
      >
        <span aria-hidden className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-surface/30 transition-all duration-700 group-hover:left-[150%]" />
        Cotizar
        <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg>
      </Link>
      {user && <BellLink href={user.staff ? "/app/avisos" : "/avisos"} count={unread} />}
      <ThemeToggle />
      {user && <UserMenu user={user} />}
    </nav>
  );
}
