"use server";

import { revalidatePath } from "next/cache";
import * as CatalogController from "@/controllers/catalog.controller";
import { run, type R } from "@/lib/action-utils";

export async function addEquipment(_p: R, fd: FormData): Promise<R> {
  return run(async () => {
    await CatalogController.add(fd);
    revalidatePath("/app/catalogo");
  });
}

export async function removeEquipment(fd: FormData) {
  await CatalogController.remove(fd);
  revalidatePath("/app/catalogo");
}
