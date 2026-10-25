import { z } from "zod";
import { parse } from "@/lib/action-utils";
import { assertAccess, currentUser, requireAccess } from "@/lib/auth";
import { DETAIL_MAX, SIZES, SPACE_TYPES, STAGES, WHEN } from "@/lib/quote-options";
import { SERVICES } from "@/lib/services";
import * as QuoteModel from "@/models/quote.model";

export type PublicQuoteResult = { ok?: boolean; error?: string };

const one = <T extends readonly [string, ...string[]]>(opts: T, msg: string) => z.enum(opts, { error: msg });
const QuoteSchema = z.object({
  space: one(SPACE_TYPES, "Elige el tipo de espacio"),
  services: z.array(one(SERVICES.map((x) => x.title) as [string, ...string[]], "Servicio no válido")).min(1, "Elige al menos un servicio"),
  size: one(SIZES, "Elige el tamaño aproximado"),
  stage: one(STAGES, "Elige en qué etapa va tu proyecto"),
  when: one(WHEN, "Elige para cuándo lo necesitas"),
  detail: z.string().trim().max(DETAIL_MAX, "El detalle es muy largo").optional(),
});

/** Solicitud de cotización: solo con cuenta. Nombre, correo y teléfono salen de la cuenta; el formulario es de opciones. */
export async function submitPublic(fd: FormData): Promise<PublicQuoteResult> {
  const me = await currentUser();
  if (!me) return { error: "Inicia sesión o regístrate para cotizar" };

  const parsed = QuoteSchema.safeParse({
    space: fd.get("space") ?? undefined,
    services: fd.getAll("services").map(String),
    size: fd.get("size") ?? undefined,
    stage: fd.get("stage") ?? undefined,
    when: fd.get("when") ?? undefined,
    detail: String(fd.get("detail") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const v = parsed.data;
  const message = [
    `Tipo de espacio: ${v.space}`,
    `Servicios: ${v.services.join(", ")}`,
    `Tamaño aproximado: ${v.size}`,
    `Etapa: ${v.stage}`,
    `Cuándo lo necesita: ${v.when}`,
    ...(v.detail ? ["", `Detalle: ${v.detail}`] : []),
  ].join("\n");
  await QuoteModel.create({ name: me.name, contactMethod: me.phone ? "telefono" : "correo", email: me.email, phone: me.phone, message });
  return { ok: true };
}

export async function list() {
  await requireAccess("clientes");
  return QuoteModel.list();
}

export async function setStatus(fd: FormData) {
  await assertAccess("clientes", "edit");
  const v = parse(z.object({ id: z.coerce.number().int().positive(), status: z.enum(["nueva", "en_proceso", "respondida"]) }), fd);
  await QuoteModel.setStatus(v.id, v.status);
}
