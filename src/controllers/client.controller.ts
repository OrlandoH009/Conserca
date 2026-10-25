import { z } from "zod";
import { parse } from "@/lib/action-utils";
import { assertAccess, requireAccess } from "@/lib/auth";
import * as ClientModel from "@/models/client.model";
import * as QuoteModel from "@/models/quote.model";

/** Datos de la pantalla "Clientes y cotizaciones". */
export async function overview() {
  await requireAccess("clientes");
  const [quotes, clients] = await Promise.all([QuoteModel.list(), ClientModel.list()]);
  return { quotes, clients };
}

export async function add(fd: FormData) {
  await assertAccess("clientes", "edit");
  const v = parse(
    z.object({
      name: z.string().trim().min(2, "El nombre es obligatorio").max(150),
      contact: z.string().trim().max(150).optional(),
      email: z.union([z.literal(""), z.email("Escribe un correo válido")]).optional(),
      phone: z.string().trim().max(40).optional(),
    }),
    fd,
  );
  await ClientModel.create({ name: v.name, contact: v.contact || null, email: v.email || null, phone: v.phone || null });
}
