import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";
import { Reveal } from "@/components/motion/Reveal";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";

export { Logo };

export async function Nav() {
  const u = await currentUser();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Conserca, inicio"><Logo /></Link>
        <NavLinks user={u ? { name: u.name, email: u.email, phone: u.phone, staff: u.role !== "usuario", roleLabel: ROLE_LABEL[u.role] } : null} />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <Reveal y={30} className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-6 py-10 text-sm text-mute sm:flex-row">
        <div>
          <Logo className="text-ink" />
          <p className="mt-3 max-w-sm">Diseño y supervisión de sistemas de aire acondicionado y ventilación mecánica. No realizamos instalación.</p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col gap-2"><Link href="/servicios">Servicios</Link><Link href="/cotizar">Solicitar cotización</Link></div>
          <div className="flex flex-col gap-2"><Link href="/app/login">Iniciar sesión</Link><Link href="/registro">Registro</Link></div>
        </div>
      </Reveal>
      <div className="border-t border-line py-4 text-center text-xs text-mute">© 2026 Conserca, S.A. de C.V.</div>
    </footer>
  );
}
