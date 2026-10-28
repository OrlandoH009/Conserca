"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as ClientController from "@/controllers/client.controller";
import * as QuoteController from "@/controllers/quote.controller";
import { run, type R } from "@/lib/action-utils";

// El contador de "nuevas" vive en la barra lateral (layout del panel), por eso se refresca el layout completo.
const touch = () => {
  revalidatePath("/app/clientes");
  revalidatePath("/app", "layout");
};

export async function addClient(_p: R, fd: FormData): Promise<R> {
  return run(async () => { await ClientController.add(fd); touch(); });
}

export async function updateClient(_p: R, fd: FormData): Promise<R> {
  return run(async () => { await ClientController.update(fd); touch(); });
}

export async function removeClient(fd: FormData): Promise<R> {
  return run(async () => { await ClientController.remove(fd); touch(); });
}

export async function setQuoteStatus(fd: FormData): Promise<R> {
  return run(async () => { await QuoteController.setStatus(fd); touch(); });
}

export async function removeQuote(fd: FormData): Promise<R> {
  return run(async () => { await QuoteController.remove(fd); touch(); });
}

/** Crea el proyecto desde la cotización y abre su ficha. */
export async function convertQuote(_p: R, fd: FormData): Promise<R> {
  return run(async () => {
    const projectId = await QuoteController.convertToProject(fd);
    touch();
    revalidatePath("/app/proyectos");
    redirect(`/app/proyectos/${projectId}`);
  });
}
