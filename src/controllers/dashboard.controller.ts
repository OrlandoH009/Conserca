import { currentUser, requireAccess } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import { can } from "@/lib/permissions";
import { addDays, daysUntil } from "@/lib/project";
import * as PaymentController from "./payment.controller";
import * as NotificationModel from "@/models/notification.model";
import * as ProjectModel from "@/models/project.model";
import * as QuoteModel from "@/models/quote.model";

const WARN_DAYS = 7;

/** Cifras y listas del panel general. Las cotizaciones solo cuentan para quien puede verlas. */
export async function summary() {
  const u = await requireAccess("proyectos");
  const [active, newQuotes, recent, overdue, byStatus, payments] = await Promise.all([
    ProjectModel.countActive(),
    can(u.role, "clientes") ? QuoteModel.countByStatus("nueva") : Promise.resolve(null),
    ProjectModel.listRecent(5),
    ProjectModel.overdue(todayISO()),
    ProjectModel.statusCounts(),
    can(u.role, "cobros") ? PaymentController.attention() : Promise.resolve(null),
  ]);
  return { active, newQuotes, recent, overdue, byStatus, payments };
}

/** Proyectos sin entregar que vencen pronto o ya vencieron: el aviso fijo del panel de los trabajadores. */
export async function deadlines() {
  await requireAccess("proyectos");
  const rows = await ProjectModel.dueSoon(addDays(todayISO(), WARN_DAYS));
  return rows.map((p) => ({ ...p, days: daysUntil(p.dueDate!) }));
}

/** Contadores para la barra lateral del panel: cotizaciones nuevas (si puede verlas) y avisos sin leer. */
export async function badges() {
  const u = await currentUser();
  if (!u) return { newQuotes: null as number | null, unread: 0 };
  const [newQuotes, unread] = await Promise.all([can(u.role, "clientes") ? QuoteModel.countByStatus("nueva") : Promise.resolve(null), NotificationModel.countUnread(u.id)]);
  return { newQuotes, unread };
}
