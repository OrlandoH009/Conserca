"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { R } from "@/lib/action-utils";

/** Marca los avisos como leídos unos segundos después de abrir la página (así se alcanzan a ver cuáles eran nuevos). */
export function MarkRead({ unread, action }: { unread: number; action: () => Promise<R> }) {
  const router = useRouter();
  useEffect(() => {
    if (!unread) return;
    const t = setTimeout(() => { action().then(() => router.refresh()); }, 3000);
    return () => clearTimeout(t);
  }, [unread, action, router]);
  return null;
}
