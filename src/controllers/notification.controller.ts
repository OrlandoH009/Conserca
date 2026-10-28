import { currentUser } from "@/lib/auth";
import * as NotificationModel from "@/models/notification.model";

/** Avisos de la persona con sesión (los más recientes primero). */
export async function mine() {
  const u = await currentUser();
  return u ? NotificationModel.listFor(u.id) : [];
}

/** Cuántos avisos sin leer tiene; 0 si no hay sesión. */
export async function unreadCount() {
  const u = await currentUser();
  return u ? NotificationModel.countUnread(u.id) : 0;
}

export async function markAllRead() {
  const u = await currentUser();
  if (u) await NotificationModel.markAllRead(u.id);
}
