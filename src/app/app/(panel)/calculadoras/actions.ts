"use server";

import { revalidatePath } from "next/cache";
import * as CalcController from "@/controllers/calc.controller";
import { run, type R } from "@/lib/action-utils";

// Guardan un cálculo rápido como espacio o zona de un proyecto (las mismas reglas que el formulario del proyecto).
export async function saveCalcSpace(fd: FormData): Promise<R> {
  return run(async () => {
    const projectId = await CalcController.addSpace(fd);
    revalidatePath(`/app/proyectos/${projectId}`);
  });
}

export async function saveCalcZone(fd: FormData): Promise<R> {
  return run(async () => {
    const projectId = await CalcController.addVentZone(fd);
    revalidatePath(`/app/proyectos/${projectId}`);
  });
}
