import type { ZodType } from "zod";

export type R = { ok?: boolean; error?: string };

/** Error pensado para mostrarse tal cual a la persona usuaria. */
export class UserError extends Error {}

/** Ejecuta una acción y convierte errores de validación en un mensaje; lo demás se relanza. */
export async function run(fn: () => Promise<void>): Promise<R> {
  try {
    await fn();
    return { ok: true };
  } catch (e) {
    if (e instanceof UserError || e instanceof RangeError) return { error: e.message };
    throw e;
  }
}

/** Valida un FormData con zod; el primer error se muestra tal cual. */
export function parse<T>(schema: ZodType<T>, fd: FormData): T {
  const obj: Record<string, FormDataEntryValue> = {};
  fd.forEach((v, k) => { obj[k] = v; });
  const r = schema.safeParse(obj);
  if (!r.success) throw new UserError(r.error.issues[0].message);
  return r.data;
}
