import type { Metadata } from "next";
import { redirect } from "next/navigation";
import * as NotificationController from "@/controllers/notification.controller";
import { MarkRead } from "@/components/app/MarkRead";
import { NotificationList } from "@/components/app/NotificationList";
import { BackButton } from "@/components/site/BackButton";
import { currentUser } from "@/lib/auth";
import { markNotificationsRead } from "./actions";

export const metadata: Metadata = { title: "Avisos" };

export default async function Avisos() {
  if (!(await currentUser())) redirect("/app/login");
  const items = await NotificationController.mine();
  const unread = items.filter((n) => !n.readAt).length;
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pb-28 sm:pt-32">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Avisos</h1>
      <p className="mb-6 mt-2 text-sm text-mute sm:mb-8 sm:mt-3 sm:text-base">Los cambios en tus proyectos: avances, documentos nuevos y visitas.</p>
      <NotificationList items={items} />
      <MarkRead unread={unread} action={markNotificationsRead} />
    </div>
  );
}
