import Link from "next/link";
import * as NotificationController from "@/controllers/notification.controller";
import { currentUser } from "@/lib/auth";
import { LEGAL } from "@/lib/legal";
import { ROLE_LABEL } from "@/lib/permissions";
import { Reveal } from "@/components/motion/Reveal";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

export { Logo };

export async function Nav() {
  const u = await currentUser();
  const unread = u ? await NotificationController.unreadCount() : 0;
  const nu = u ? { name: u.name, email: u.email, phone: u.phone, staff: u.role !== "usuario", roleLabel: ROLE_LABEL[u.role] } : null;
  return (
    <>
      {/* Celular: botón flotante con menú; desde sm, la barra de siempre. */}
      <MobileMenu user={nu} unread={unread} />
      <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-black/5 bg-surface/70 backdrop-blur-xl backdrop-saturate-150 sm:block">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Conserca, inicio"><Logo /></Link>
          <NavLinks unread={unread} user={nu} />
        </div>
      </header>
    </>
  );
}

type Links = [string, [string, string][]][];
// Con sesión iniciada no se ofrece iniciar sesión ni registrarse: se lleva a su zona (cliente o panel del equipo).
const footerLinks = (role: string | null): Links => [
  ["Sitio", [["/", "Inicio"], ["/servicios", "Servicios"], ["/cotizar", "Solicitar cotización"]]],
  ["Cuenta", role ? [role === "usuario" ? ["/mis-proyectos", "Mis proyectos"] : ["/app", "Mi panel"]] : [["/app/login", "Iniciar sesión"], ["/registro", "Crear cuenta"]]],
  ["Legal", [["/terminos", "Términos y condiciones"], ["/privacidad", "Aviso de privacidad"]]],
];

export async function Footer() {
  const u = await currentUser();
  return (
    <footer className="border-t border-line bg-surface">
      <Reveal y={30} className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-12 text-sm text-mute md:flex-row">
        <div>
          <Logo className="h-10" />
          <p className="mt-3 max-w-sm">Cálculo, diseño y supervisión de sistemas de aire acondicionado y ventilación mecánica.</p>
        </div>
        <nav aria-label="Pie de página" className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 sm:gap-x-14">
          {footerLinks(u?.role ?? null).map(([title, links]) => (
            <div key={title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink">{title}</p>
              <ul className="space-y-2">
                {links.map(([href, label]) => <li key={href}><Link href={href} className="transition-colors hover:text-accent">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </nav>
      </Reveal>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-4 text-xs text-mute sm:flex-row">
          <p>© {new Date().getFullYear()} {LEGAL.company} Todos los derechos reservados.</p>
          <p className="hidden gap-4 sm:flex"><Link href="/terminos" className="transition-colors hover:text-accent">Términos y condiciones</Link><Link href="/privacidad" className="transition-colors hover:text-accent">Privacidad</Link></p>
        </div>
      </div>
    </footer>
  );
}
