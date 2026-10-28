"use server";

import { revalidatePath } from "next/cache";
import * as NotificationController from "@/controllers/notification.controller";
import type { R } from "@/lib/action-utils";

/** Marca todos los avisos de la persona como leídos y refresca el contador de la campanita (sitio y panel). */
export async function markNotificationsRead(): Promise<R> {
  await NotificationController.markAllRead();
  revalidatePath("/", "layout");
  return { ok: true };
}
