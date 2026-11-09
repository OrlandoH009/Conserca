import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import Link from "next/link";
import * as UserController from "@/controllers/user.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { Badge, PageHead } from "@/components/app/ui";
import { levelOf, ROLE_LABEL, ROLES, type Area, type Level } from "@/lib/permissions";
import { createUser, removeUser, setRole } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Usuarios y permisos") };
}

const AREAS: [Area, string][] = [["proyectos", "Proyectos"], ["calculos", "Cálculos"], ["presupuestos", "Presupuestos"], ["cobros", "Cobros"], ["clientes", "Clientes"], ["usuarios", "Usuarios"]];
// Texto corto para que la matriz quepa; el nombre largo queda para lectores de pantalla.
const LV: Record<Level, [string, string, "g" | "b" | "n"]> = { edit: ["Edita", "Puede ver y editar", "g"], view: ["Ve", "Solo puede consultar", "b"], none: ["—", "Sin acceso", "n"] };

export default async function Usuarios() {
  const t = await getT();
  const { me, users: list } = await UserController.list();
  const admins = list.filter((x) => x.role === "admin").length; // el último administrador no se puede borrar
  return (
    <>
      <PageHead title={t("Usuarios y permisos")} sub={t("Quién tiene cuenta y qué puede hacer cada rol")} />

      <section className="card overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>{t("Usuario")}</th><th>{t("Rol")}</th><th>{t("Acciones")}</th></tr></thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.id}>
                <td><p className="font-medium">{x.name}</p><p className="text-xs text-mute">{x.email}</p></td>
                <td>
                  <form action={setRole} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={x.id} />
                    <select key={x.role} name="role" defaultValue={x.role} className="input h-9 w-44 text-xs" aria-label={t("Rol de {name}", { name: x.name })} disabled={x.id === me.id}>
                      {ROLES.map((r) => <option key={r} value={r}>{t(ROLE_LABEL[r])}</option>)}
                    </select>
                    {x.id !== me.id && <button className="btn-ghost px-3 py-1.5">{t("Guardar")}</button>}
                  </form>
                </td>
                <td>
                  <div className="flex items-center gap-4 whitespace-nowrap text-sm">
                    <Link href={`/app/usuarios/${x.id}`} className="font-semibold text-accent hover:underline">{t("Editar")}</Link>
                    {x.id !== me.id && !(x.role === "admin" && admins <= 1) && (
                      <form action={removeUser}>
                        <input type="hidden" name="id" value={x.id} />
                        <ConfirmButton message={t("¿Eliminar a {name}? Esta acción no se puede deshacer.", { name: x.name })} className="font-semibold text-red-600 hover:underline">{t("Eliminar")}</ConfirmButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card mt-6">
        <h2 className="font-bold">{t("Qué puede hacer cada rol")}</h2>
        <p className="mb-3 mt-1 text-sm text-mute"><b className="text-ink">{t("Edita")}</b>{t(": ver y cambiar ·")} <b className="text-ink">{t("Ve")}</b>{t(": solo consultar ·")} <b className="text-ink">—</b>{t(": sin acceso. Estos permisos están definidos en el código (")}<code>src/lib/permissions.ts</code>).</p>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th scope="col">{t("Rol")}</th>{AREAS.map(([, l]) => <th key={l} scope="col">{t(l)}</th>)}</tr></thead>
            <tbody>
              {ROLES.map((r) => (
                <tr key={r}>
                  <th scope="row" className="px-3 py-3 text-left text-sm font-semibold normal-case tracking-normal text-ink">{t(ROLE_LABEL[r])}</th>
                  {AREAS.map(([a]) => {
                    const [short, long, tone] = LV[levelOf(r, a)];
                    return <td key={a}><Badge tone={tone}><span aria-hidden>{t(short)}</span><span className="sr-only">{t(long)}</span></Badge></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mt-6 max-w-xl">
        <h2 className="mb-3 font-bold">{t("Invitar usuario")}</h2>
        <ActionForm action={createUser} submit={t("Crear usuario")}>
          <div className="grid gap-3 md:grid-cols-2">
            <F label={t("Nombre")} name="name" />
            <F label={t("Correo")} name="email" type="email" />
            <F label={t("Rol")} name="role">
              <select id="role" name="role" className="input" defaultValue="" required>
                <option value="" disabled>{t("Elegir…")}</option>
                {ROLES.map((r) => <option key={r} value={r}>{t(ROLE_LABEL[r])}</option>)}
              </select>
            </F>
            <F label={t("Contraseña inicial (mín. 10)")} name="password" type="password" />
          </div>
        </ActionForm>
      </section>
    </>
  );
}
