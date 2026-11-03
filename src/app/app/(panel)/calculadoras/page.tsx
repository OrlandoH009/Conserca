import { getT } from "@/lib/i18n-server";
import type { Metadata } from "next";
import * as ProjectController from "@/controllers/project.controller";
import { Calculators } from "@/components/app/Calculators";
import { PageHead } from "@/components/app/ui";
import { can } from "@/lib/permissions";
import { currentUser, requireAccess } from "@/lib/auth";
import { saveCalcSpace, saveCalcZone } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Calculadoras") };
}

export default async function Calculadoras() {
  const t = await getT();
  await requireAccess("calculos");
  const u = await currentUser();
  // Solo quien puede editar cálculos ve la opción de guardar en un proyecto.
  const projects = u && can(u.role, "calculos", "edit") ? await ProjectController.projectOptions() : [];
  return (
    <>
      <PageHead title={t("Calculadoras")} sub={t("Cálculos rápidos sin abrir un proyecto. Si quieres conservarlos, guárdalos en un proyecto.")} />
      <Calculators projects={projects} saveSpace={saveCalcSpace} saveZone={saveCalcZone} />
    </>
  );
}
