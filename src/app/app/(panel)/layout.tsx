import { getT } from "@/lib/i18n-server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellLink } from "@/components/app/BellLink";
import { DeadlineAlert } from "@/components/app/DeadlineAlert";
import { MobileNav } from "@/components/app/MobileNav";
import * as DashboardController from "@/controllers/dashboard.controller";
import { SideNav } from "@/components/app/SideNav";
import { Logo } from "@/components/site/Nav";
import { SkipLink } from "@/components/site/SkipLink";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { currentUser } from "@/lib/auth";
import { can, ROLE_LABEL, type Area } from "@/lib/permissions";
import { logout } from "../login/actions";

type Item = { href: string; label: string; area?: Area; badge?: number };
const ITEMS: Item[] = [
  { href: "/app", label: "Panel general" },
  { href: "/app/proyectos", label: "Proyectos", area: "proyectos" },
  { href: "/app/calculadoras", label: "Calculadoras", area: "calculos" },
  { href: "/app/clientes", label: "Clientes y cotizaciones", area: "clientes" },
  { href: "/app/usuarios", label: "Usuarios y permisos", area: "usuarios" },
  { href: "/app/avisos", label: "Avisos" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  const u = await currentUser();
  if (!u) redirect("/app/login");
  if (u.role === "usuario") redirect("/"); // cuentas del sitio: sin panel interno
  const [badges, deadlines] = await Promise.all([DashboardController.badges(), DashboardController.deadlines()]);
  const items: Item[] = ITEMS.filter((i) => !i.area || can(u.role, i.area)).map((i) => ({ ...i, badge: (i.href === "/app/clientes" ? badges.newQuotes : i.href === "/app/avisos" ? badges.unread : 0) || undefined }));
  return (
    <div className="min-h-screen lg:flex">
      <SkipLink />
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col lg:flex border-r border-line bg-surface p-4 print:hidden">
        <div className="flex items-center justify-between px-2 pb-6 pt-1"><Logo className="h-6" /><div className="flex items-center gap-1"><BellLink href="/app/avisos" count={badges.unread} /><ThemeToggle /></div></div>
        <SideNav items={items} />
        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate px-2 text-sm font-semibold">{u.name}</p>
          <p className="px-2 pb-3 text-xs text-mute">{t(ROLE_LABEL[u.role])}</p>
          <Link href="/" className="btn btn-dark mb-2 w-full py-2">{t("← Ir al sitio")}</Link>
          <form action={logout}><button className="btn-ghost btn-line w-full py-2">{t("Cerrar sesión")}</button></form>
        </div>
      </aside>
      <MobileNav items={items} name={u.name} role={t(ROLE_LABEL[u.role])} unread={badges.unread} logout={logout} />
      <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 outline-none p-4 pt-[4.5rem] sm:p-6 sm:pt-[4.5rem] lg:p-8 print:p-0">{deadlines.length > 0 && <DeadlineAlert rows={deadlines} />}{children}</main>
    </div>
  );
}
