import { requireAccess } from "@/lib/auth";
import { can } from "@/lib/permissions";
import * as DocumentModel from "@/models/document.model";
import * as ProjectModel from "@/models/project.model";
import * as QuoteModel from "@/models/quote.model";
import * as VisitModel from "@/models/visit.model";

/** Cifras y listas del panel general. Las cotizaciones solo cuentan para quien puede verlas. */
export async function summary() {
  const u = await requireAccess("proyectos");
  const [active, toReview, scheduled, newQuotes, recent, upcoming] = await Promise.all([
    ProjectModel.countActive(),
    DocumentModel.countByStatus("en_revision"),
    VisitModel.countScheduled(),
    can(u.role, "clientes") ? QuoteModel.countByStatus("nueva") : Promise.resolve(null),
    ProjectModel.listRecent(5),
    VisitModel.upcoming(4),
  ]);
  return { active, toReview, scheduled, newQuotes, recent, upcoming };
}
