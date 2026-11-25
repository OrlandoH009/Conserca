// Correos desde una cuenta de Gmail, usando la API de Gmail por HTTPS (no hace falta dominio ni instalar nada).
// No se usa SMTP porque Railway lo bloquea fuera del plan Pro.
// Sin GMAIL_REFRESH_TOKEN no se envía nada: el correo se muestra en la consola del servidor (sirve para probar en local).

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Dirección completa de una ruta del sitio, para los enlaces de los correos. */
export const appUrl = (path: string) => `${(process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "")}${path}`;

type Button = { label: string; href: string };

/** HTML del correo: marca, párrafos y un botón. Todo el texto se escapa (puede traer nombres o motivos que escribió alguien). */
export function emailHtml(lines: string[], button?: Button) {
  const ps = lines.map((l) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.5">${esc(l)}</p>`).join("");
  const btn = button
    ? `<p style="margin:24px 0 8px"><a href="${esc(button.href)}" style="display:inline-block;background:#0b55b3;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${esc(button.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f3f7fc;font-family:'Segoe UI',Arial,sans-serif;color:#14233a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #d5e1ef;border-radius:16px"><tr><td style="padding:28px">
<p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#0b55b3">Conserca</p>${ps}${btn}
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:#56687f">Recibes este correo por tu cuenta en el sitio de Conserca.</p>
</td></tr></table></body></html>`;
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const encWord = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);
const CRLF = "\r\n";
const wrap = (s: string) => s.replace(/.{76}/g, `$&${CRLF}`); // líneas cortas, como pide el formato de correo

/** Mensaje MIME (texto + HTML) que pide la API de Gmail. Rechaza saltos de línea en encabezados (evita inyectar destinatarios). */
export function buildMime(to: string, subject: string, text: string, html: string, from?: string) {
  if (/[\r\n]/.test(to + (from ?? ""))) throw new Error("Dirección de correo no válida");
  const named = from?.match(/^(.*?)\s*<([^>]+)>$/);
  const boundary = "conserca-" + Math.random().toString(36).slice(2);
  return [
    ...(from ? [`From: ${named ? `${encWord(named[1].replace(/"/g, ""))} <${named[2]}>` : from}`] : []),
    `To: ${to}`,
    `Subject: ${encWord(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    wrap(b64(text)),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    wrap(b64(html)),
    `--${boundary}--`,
    "",
  ].join(CRLF);
}

let token: { value: string; exp: number } | null = null;

/** Permiso de Google de 1 hora, sacado del refresh token; se reusa hasta que esté por vencer. */
async function accessToken(refreshToken: string) {
  if (token && token.exp > Date.now() + 60_000) return token.value;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID ?? "",
      client_secret: process.env.GMAIL_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Google no dio permiso (${res.status}): ${(await res.text()).slice(0, 200)}`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return token.value;
}

/** Envía un correo. Lanza error si Gmail lo rechaza; quien llama decide si eso detiene la acción o solo se anota. */
export async function sendEmail(to: string, subject: string, lines: string[], button?: Button) {
  const text = [...lines, button ? `${button.label}: ${button.href}` : ""].filter(Boolean).join("\n\n");
  const refresh = process.env.GMAIL_REFRESH_TOKEN;
  if (!refresh) {
    console.info(`[correo sin enviar: falta GMAIL_REFRESH_TOKEN] Para: ${to}\nAsunto: ${subject}\n${text}\n`);
    return;
  }
  const raw = Buffer.from(buildMime(to, subject, text, emailHtml(lines, button), process.env.EMAIL_FROM || undefined)).toString("base64url");
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken(refresh)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
    signal: AbortSignal.timeout(10_000), // si Gmail no responde, la acción no se queda colgada
  });
  if (!res.ok) throw new Error(`Gmail respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

export const logMailError = (e: unknown) => console.error("[correo] No se pudo enviar:", e);
