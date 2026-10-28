"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";
import { EASE } from "@/lib/motion";

type Item = { id: number; kind: "ok" | "error"; text: string };

// Almacén mínimo fuera de React: cualquier acción puede llamar a `toast.ok(...)` sin pasar propiedades.
let items: Item[] = [];
let next = 0;
const subs = new Set<() => void>();
const EMPTY: Item[] = [];
const emit = () => subs.forEach((f) => f());

function push(kind: Item["kind"], text: string) {
  const id = ++next;
  items = [...items, { id, kind, text }].slice(-4);
  emit();
  setTimeout(() => { items = items.filter((t) => t.id !== id); emit(); }, kind === "error" ? 6500 : 3200);
}

export const toast = { ok: (text: string) => push("ok", text), error: (text: string) => push("error", text) };

/** Avisos breves en la esquina: éxito en azul, error en rojo. Se anuncian a lectores de pantalla. */
export function Toaster() {
  const list = useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => items, () => EMPTY);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[130] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      <AnimatePresence initial={false}>
        {list.map((t) => (
          <motion.div
            key={t.id}
            layout
            role={t.kind === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_18px_40px_-16px_rgba(0,0,0,0.45)] ${t.kind === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-line bg-surface text-ink"}`}
          >
            <span aria-hidden className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${t.kind === "error" ? "bg-red-600 text-white" : "bg-accent-solid text-white"}`}>{t.kind === "error" ? "!" : "✓"}</span>
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
