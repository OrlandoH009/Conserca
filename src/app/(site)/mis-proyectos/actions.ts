"use server";

import { revalidatePath } from "next/cache";
import * as DocumentController from "@/controllers/document.controller";
import { run, type R } from "@/lib/action-utils";

// El cliente aprueba un documento (botón) o pide cambios (formulario con comentario).
const review = async (fd: FormData): Promise<R> =>
  run(async () => {
    await DocumentController.review(fd);
    revalidatePath("/mis-proyectos");
    revalidatePath("/app", "layout"); // el equipo ve el aviso y el estado en su panel
  });

export async function reviewDocument(fd: FormData): Promise<R> {
  return review(fd);
}

export async function reviewDocumentForm(_p: R, fd: FormData): Promise<R> {
  return review(fd);
}
