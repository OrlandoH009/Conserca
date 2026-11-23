import { appUrl, logMailError, sendEmail } from "@/lib/email";
import { can, ROLES, type Area } from "@/lib/permissions";
import * as EventModel from "@/models/event.model";
import * as NotificationModel from "@/models/notification.model";
import * as ProjectModel from "@/models/project.model";
import * as UserModel from "@/models/user.model";

type Options = {
  visibleToClient?: boolean; // por defecto sí
  actorId?: number | null; // quien hizo el cambio (no se le avisa a sí mismo)
  notifyClient?: string; // texto del aviso para la cuenta del cliente; sin texto, no se avisa
};

type Notice = { userId: number; text: string; href: string };

/** Guarda los avisos y además los manda por correo a quien ya confirmó su correo. Si un correo falla, el aviso igual queda en el sistema. */
async function deliver(rows: Notice[]) {
  if (!rows.length) return;
  await NotificationModel.createMany(rows);
  const emails = new Map((await UserModel.verifiedEmails(rows.map((r) => r.userId))).map((u) => [u.id, u.email]));
  await Promise.all(
    rows.map(async (r) => {
      const to = emails.get(r.userId);
      if (to) await sendEmail(to, r.text.slice(0, 120), [r.text], { label: "Ver en Conserca", href: appUrl(r.href) }).catch(logMailError);
    }),
  );
}

/** Aviso para una persona: en su campana y por correo. */
export const notifyUser = (userId: number, text: string, href: string) => deliver([{ userId, text: text.slice(0, 300), href }]);

/** Anota un movimiento del proyecto. Si el cliente puede verlo y se dio texto de aviso, le llega a su cuenta. */
export async function record(projectId: number, type: string, message: string, o: Options = {}) {
  const visible = o.visibleToClient ?? true;
  await EventModel.log({ projectId, type, message: message.slice(0, 300), visibleToClient: visible, createdBy: o.actorId ?? null });
  if (visible && o.notifyClient) {
    const p = await ProjectModel.findById(projectId);
    if (p?.clientUserId && p.clientUserId !== o.actorId) await notifyUser(p.clientUserId, o.notifyClient, "/mis-proyectos");
  }
}

/** Avisa al equipo: a quienes pueden entrar al área indicada (y a `alsoUserIds`), menos a quien hizo el cambio. */
export async function notifyStaff(area: Area, text: string, href: string, o: { need?: "view" | "edit"; exceptUserId?: number | null; alsoUserIds?: (number | null)[] } = {}) {
  const roles = ROLES.filter((r) => r !== "usuario" && can(r, area, o.need ?? "view"));
  const people = await UserModel.listByRoles(roles);
  const ids = new Set<number>(people.map((u) => u.id));
  for (const id of o.alsoUserIds ?? []) if (id) ids.add(id);
  if (o.exceptUserId) ids.delete(o.exceptUserId);
  await deliver([...ids].map((userId) => ({ userId, text: text.slice(0, 300), href })));
}
