import type { Metadata } from "next";
import * as UserController from "@/controllers/user.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { Badge, PageHead } from "@/components/app/ui";
import { levelOf, ROLE_LABEL, ROLES, type Area, type Level } from "@/lib/permissions";
import { createUser, setRole } from "./actions";

export const metadata: Metadata = { title: "Usuarios y permisos" };

const AREAS: [Area, string][] = [["proyectos", "Proyectos"], ["calculos", "Cálculos"], ["presupuestos", "Presupuestos"], ["supervision", "Supervisión"], ["clientes", "Clientes"], ["catalogo", "Catálogo"]];
const LV: Record<Level, [string, "g" | "b" | "n"]> = { edit: ["Edita", "g"], view: ["Ve", "b"], none: ["Sin acceso", "n"] };

export default async function Usuarios() {
  const { me, users: list } = await UserController.list();
  return (
    <>
      <PageHead title="Usuarios y permisos" sub="Quién puede ver y editar cada parte" />
      <section className="card overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Usuario</th><th>Rol</th>{AREAS.map(([, l]) => <th key={l}>{l}</th>)}</tr></thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.id}>
                <td><p className="font-medium">{x.name}</p><p className="text-xs text-mute">{x.email}</p></td>
                <td>
                  <form action={setRole} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={x.id} />
                    <select name="role" defaultValue={x.role} className="input h-9 w-40 text-xs" aria-label={`Rol de ${x.name}`} disabled={x.id === me.id}>
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                    </select>
                    {x.id !== me.id && <button className="btn-ghost px-3 py-1.5">Guardar</button>}
                  </form>
                </td>
                {AREAS.map(([a]) => { const [l, t] = LV[levelOf(x.role, a)]; return <td key={a}><Badge tone={t}>{l}</Badge></td>; })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card mt-6 max-w-xl">
        <h2 className="mb-3 font-bold">Invitar usuario</h2>
        <ActionForm action={createUser} submit="Crear usuario">
          <div className="grid gap-3 md:grid-cols-2">
            <F label="Nombre" name="name" />
            <F label="Correo" name="email" type="email" />
            <F label="Rol" name="role">
              <select id="role" name="role" className="input" defaultValue="" required>
                <option value="" disabled>Elegir…</option>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </F>
            <F label="Contraseña inicial (mín. 10)" name="password" type="password" />
          </div>
        </ActionForm>
      </section>
    </>
  );
}
