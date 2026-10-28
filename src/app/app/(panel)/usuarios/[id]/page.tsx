import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as UserController from "@/controllers/user.controller";
import { ActionForm, F } from "@/components/app/ActionForm";
import { ConfirmButton } from "@/components/app/ConfirmButton";
import { PageHead } from "@/components/app/ui";
import { currentUser } from "@/lib/auth";
import { ROLE_LABEL, ROLES } from "@/lib/permissions";
import { removeUser, updateUser } from "../actions";

export const metadata: Metadata = { title: "Editar usuario" };

export default async function EditarUsuario({ params }: PageProps<"/app/usuarios/[id]">) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();
  const [u, me] = await Promise.all([UserController.get(n), currentUser()]);
  if (!u) notFound();
  const isMe = me?.id === u.id;

  return (
    <>
      <p className="text-sm text-mute"><Link href="/app/usuarios" className="hover:text-accent">Usuarios y permisos</Link> / {u.name}</p>
      <PageHead title="Editar usuario" sub={isMe ? "Esta es tu cuenta: no puedes cambiar tu propio rol ni eliminarla." : "Cambia sus datos, su rol o su contraseña."} />

      <section className="card max-w-xl">
        <ActionForm action={updateUser} submit="Guardar cambios">
          <input type="hidden" name="id" value={u.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <F label="Nombre" name="name" defaultValue={u.name} />
            <F label="Correo" name="email" type="email" defaultValue={u.email} />
            <F label="Teléfono / WhatsApp" name="phone" type="tel" defaultValue={u.phone ?? ""} required={false} />
            <F label="Rol" name="role">
              <select id="role" name="role" className="input" defaultValue={u.role} disabled={isMe}>
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              {isMe && <input type="hidden" name="role" value={u.role} />}
            </F>
            <div className="md:col-span-2">
              <F label="Contraseña nueva (opcional, mín. 10)" name="password" type="password" required={false} />
              <p className="mt-1 text-xs text-mute">Déjala vacía para conservar la actual.</p>
            </div>
          </div>
        </ActionForm>
      </section>

      {!isMe && (
        <section className="card mt-6 max-w-xl border-red-200">
          <h2 className="font-bold text-red-700">Eliminar usuario</h2>
          <p className="mt-1 text-sm text-mute">Se borra su cuenta y ya no podrá iniciar sesión. Sus proyectos se conservan, pero dejan de estar ligados a él.</p>
          <form action={removeUser} className="mt-4">
            <input type="hidden" name="id" value={u.id} />
            <ConfirmButton message={`¿Eliminar a ${u.name}? Esta acción no se puede deshacer.`} className="btn bg-red-600 hover:shadow-red-600/30">Eliminar usuario</ConfirmButton>
          </form>
        </section>
      )}
    </>
  );
}
