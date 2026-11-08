import { headers } from "next/headers";

// Contador por clave en memoria. shortcut: se reinicia al reiniciar el servidor y no se comparte entre procesos; basta con un solo proceso (pm2, 1 instancia). Si se escala a varios, pasar a la base de datos o a Redis.
const hits = new Map<string, { n: number; reset: number }>();
const MAX_KEYS = 5000;

/** Cuenta un intento. `true` = permitido, `false` = se pasó del límite en esa ventana de tiempo. */
export function hit(key: string, max: number, windowMs: number, now = Date.now()) {
  if (hits.size > MAX_KEYS) {
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
    if (hits.size > MAX_KEYS * 4) hits.clear(); // ataque con muchísimas IPs: mejor perder el conteo que la memoria
  }
  const e = hits.get(key);
  if (!e || e.reset <= now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  e.n++;
  return e.n <= max;
}

/** IP del visitante. Detrás de Cloudflare o Caddy viene en la cabecera; shortcut: sin proxy delante esa cabecera la puede inventar el visitante, así que la app debe publicarse solo detrás de Caddy/Cloudflare. */
export async function clientIp() {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
}

/** `true` si esta IP ya se pasó del límite para esa acción (cuenta el intento). */
export async function limited(scope: string, max: number, windowMs: number) {
  return !hit(`${scope}:${await clientIp()}`, max, windowMs);
}
