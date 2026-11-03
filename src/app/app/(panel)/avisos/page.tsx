import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import * as NotificationController from "@/controllers/notification.controller";
import { MarkRead } from "@/components/app/MarkRead";
import { NotificationList } from "@/components/app/NotificationList";
import { PageHead } from "@/components/app/ui";
import { markNotificationsRead } from "@/app/(site)/avisos/actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Avisos") };
}

export default async function Avisos() {
  const t = await getT();
  const items = await NotificationController.mine();
  const unread = items.filter((n) => !n.readAt).length;
  return (
    <>
      <PageHead title={t("Avisos")} sub={t("Cotizaciones nuevas y respuestas de los clientes")} />
      <div className="max-w-3xl">
        <NotificationList items={items} />
      </div>
      <MarkRead unread={unread} action={markNotificationsRead} />
    </>
  );
}
