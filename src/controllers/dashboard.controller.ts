import { currentUser, requireAccess } from "@/lib/auth";
import { todayISO } from "@/lib/format";
import { can } from "@/lib/permissions";
import * as DocumentModel from "@/models/document.model";
import * as NotificationModel from "@/models/notification.model";
import * as ProjectModel from "@/models/project.model";
import * as QuoteModel from "@/models/quote.model";
import * as VisitModel from "@/models/visit.model";

/** Cifras y listas del panel general. Las cotizaciones solo cuentan para quien puede verlas. */
export async function summary() {
  const u = await requireAccess("proyectos");
  const [active, toReview, scheduled, newQuotes, recent, upcoming, overdue, byStatus] = await Promise.all([
    ProjectModel.countActive(),
    DocumentModel.countByStatus("en_revision"),
    VisitModel.countScheduled(),
    can(u.role, "clientes") ? QuoteModel.countByStatus("nueva") : Promise.resolve(null),
    ProjectModel.listRecent(5),
    VisitModel.upcoming(5),
    ProjectModel.overdue(todayISO()),
    ProjectModel.statusCounts(),
  ]);
  return { active, toReview, scheduled, newQuotes, recent, upcoming, overdue, byStatus };
}

/** Contadores para la barra lateral del panel: cotizaciones nuevas (si puede verlas) y avisos sin leer. */
export async function badges() {
  const u = await currentUser();
  if (!u) return { newQuotes: null as number | null, unread: 0 };
  const [newQuotes, unread] = await Promise.all([can(u.role, "clientes") ? QuoteModel.countByStatus("nueva") : Promise.resolve(null), NotificationModel.countUnread(u.id)]);
  return { newQuotes, unread };
}
