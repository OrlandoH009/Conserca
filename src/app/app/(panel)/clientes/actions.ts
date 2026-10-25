"use server";

import { revalidatePath } from "next/cache";
import * as ClientController from "@/controllers/client.controller";
import * as QuoteController from "@/controllers/quote.controller";
import { run, type R } from "@/lib/action-utils";

export async function addClient(_p: R, fd: FormData): Promise<R> {
  return run(async () => {
    await ClientController.add(fd);
    revalidatePath("/app/clientes");
  });
}

export async function setQuoteStatus(fd: FormData) {
  await QuoteController.setStatus(fd);
  revalidatePath("/app/clientes");
  revalidatePath("/app");
}
