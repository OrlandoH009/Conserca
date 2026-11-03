import { getT } from "@/lib/i18n-server";
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

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Editar usuario") };
}

export default async function EditarUsuario({ params }: PageProps<"/app/usuarios/[id]">) {
  const t = await getT();
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();
  const [u, me] = await Promise.all([UserController.get(n), currentUser()]);
  if (!u) notFound();
  const isMe = me?.id === u.id;

  return (
    <>
      <p className="text-sm text-mute"><Link href="/app/usuarios" className="hover:text-accent">{t("Usuarios y permisos")}</Link> / {u.name}</p>
      <PageHead title={t("Editar usuario")} sub={isMe ? t("Esta es tu cuenta: no puedes cambiar tu propio rol ni eliminarla.") : t("Cambia sus datos, su rol o su contraseña.")} />

      <section className="card max-w-xl">
        <ActionForm action={updateUser} submit={t("Guardar cambios")}>
          <input type="hidden" name="id" value={u.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <F label={t("Nombre")} name="name" defaultValue={u.name} />
            <F label={t("Correo")} name="email" type="email" defaultValue={u.email} />
            <F label={t("Teléfono / WhatsApp")} name="phone" type="tel" defaultValue={u.phone ?? ""} required={false} />
            <F label={t("Rol")} name="role">
              <select id="role" name="role" className="input" defaultValue={u.role} disabled={isMe}>
                {ROLES.map((r) => <option key={r} value={r}>{t(ROLE_LABEL[r])}</option>)}
              </select>
              {isMe && <input type="hidden" name="role" value={u.role} />}
            </F>
            <div className="md:col-span-2">
              <F label={t("Contraseña nueva (opcional, mín. 10)")} name="password" type="password" required={false} />
              <p className="mt-1 text-xs text-mute">{t("Déjala vacía para conservar la actual.")}</p>
            </div>
          </div>
        </ActionForm>
      </section>

      {!isMe && (
        <section className="card mt-6 max-w-xl border-red-200">
          <h2 className="font-bold text-red-700">{t("Eliminar usuario")}</h2>
          <p className="mt-1 text-sm text-mute">{t("Se borra su cuenta y ya no podrá iniciar sesión. Sus proyectos se conservan, pero dejan de estar ligados a él.")}</p>
          <form action={removeUser} className="mt-4">
            <input type="hidden" name="id" value={u.id} />
            <ConfirmButton message={t("¿Eliminar a {name}? Esta acción no se puede deshacer.", { name: u.name })} className="btn bg-red-600 hover:shadow-red-600/30">{t("Eliminar usuario")}</ConfirmButton>
          </form>
        </section>
      )}
    </>
  );
}
