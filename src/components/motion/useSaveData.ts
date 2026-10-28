"use client";

import { useSyncExternalStore } from "react";

type Conn = { saveData?: boolean; addEventListener?: (t: string, f: () => void) => void; removeEventListener?: (t: string, f: () => void) => void };
const conn = () => (typeof navigator === "undefined" ? undefined : (navigator as Navigator & { connection?: Conn }).connection);

/** `true` si la persona activó el "ahorro de datos" del navegador: se omiten los efectos largos. */
export function useSaveData() {
  return useSyncExternalStore(
    (cb) => { const c = conn(); c?.addEventListener?.("change", cb); return () => c?.removeEventListener?.("change", cb); },
    () => !!conn()?.saveData,
    () => false,
  );
}
