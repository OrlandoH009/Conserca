import type { Metadata } from "next";
import { Calculators } from "@/components/app/Calculators";
import { PageHead } from "@/components/app/ui";
import { requireAccess } from "@/lib/auth";

export const metadata: Metadata = { title: "Calculadoras" };

export default async function Calculadoras() {
  await requireAccess("calculos");
  return (
    <>
      <PageHead title="Calculadoras" sub="Cálculos rápidos sin abrir un proyecto. No se guardan." />
      <Calculators />
    </>
  );
}
