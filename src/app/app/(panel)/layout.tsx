import Link from "next/link";
import { redirect } from "next/navigation";
import { SideNav } from "@/components/app/SideNav";
import { Logo } from "@/components/site/Nav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { currentUser } from "@/lib/auth";
import { can, ROLE_LABEL, type Area } from "@/lib/permissions";
import { logout } from "../login/actions";

const ITEMS: { href: string; label: string; area?: Area }[] = [
  { href: "/app", label: "Panel general" },
  { href: "/app/proyectos", label: "Proyectos", area: "proyectos" },
  { href: "/app/calculadoras", label: "Calculadoras", area: "calculos" },
  { href: "/app/catalogo", label: "Catálogo de equipos", area: "catalogo" },
  { href: "/app/clientes", label: "Clientes y cotizaciones", area: "clientes" },
  { href: "/app/usuarios", label: "Usuarios y permisos", area: "usuarios" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  if (!u) redirect("/app/login");
  if (u.role === "usuario") redirect("/"); // cuentas del sitio: sin panel interno
  const items = ITEMS.filter((i) => !i.area || can(u.role, i.area));
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-white p-4 print:hidden">
        <div className="flex items-center justify-between px-2 pb-6 pt-1"><Logo /><ThemeToggle /></div>
        <SideNav items={items} />
        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate px-2 text-sm font-semibold">{u.name}</p>
          <p className="px-2 pb-3 text-xs text-mute">{ROLE_LABEL[u.role]}</p>
          <Link href="/" className="btn mb-2 w-full py-2">← Ir al sitio</Link>
          <form action={logout}><button className="btn-ghost w-full py-2">Cerrar sesión</button></form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8 print:p-0">{children}</main>
    </div>
  );
}
