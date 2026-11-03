import Link from "next/link";
import { fmtDateTime } from "@/lib/format";
import { getT } from "@/lib/i18n-server";

type Item = { id: number; text: string; href: string | null; readAt: Date | null; createdAt: Date };

/** Lista de avisos: los no leídos llevan un punto y el texto en negrita. Compartida por el sitio y el panel. */
export async function NotificationList({ items }: { items: Item[] }) {
  const t = await getT();
  if (items.length === 0) return <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-mute">{t("No tienes avisos todavía. Aquí aparecerán los cambios importantes.")}</p>;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {items.map((n) => {
        const body = (
          <>
            <span aria-hidden className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-accent"}`} />
            <span className="min-w-0">
              <span className={`block ${n.readAt ? "text-mute" : "font-semibold"}`}>{!n.readAt && <span className="sr-only">{t("Sin leer:")} </span>}{t(n.text)}</span>
              <span className="text-xs text-mute">{fmtDateTime(n.createdAt)}</span>
            </span>
          </>
        );
        return (
          <li key={n.id}>
            {n.href ? <Link href={n.href} className="flex gap-3 px-4 py-3.5 transition-colors hover:bg-soft">{body}</Link> : <div className="flex gap-3 px-4 py-3.5">{body}</div>}
          </li>
        );
      })}
    </ul>
  );
}
