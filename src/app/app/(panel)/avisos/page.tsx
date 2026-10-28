import type { Metadata } from "next";
import * as NotificationController from "@/controllers/notification.controller";
import { MarkRead } from "@/components/app/MarkRead";
import { NotificationList } from "@/components/app/NotificationList";
import { PageHead } from "@/components/app/ui";
import { markNotificationsRead } from "@/app/(site)/avisos/actions";

export const metadata: Metadata = { title: "Avisos" };

export default async function Avisos() {
  const items = await NotificationController.mine();
  const unread = items.filter((n) => !n.readAt).length;
  return (
    <>
      <PageHead title="Avisos" sub="Cotizaciones nuevas y respuestas de los clientes" />
      <div className="max-w-3xl">
        <NotificationList items={items} />
      </div>
      <MarkRead unread={unread} action={markNotificationsRead} />
    </>
  );
}
