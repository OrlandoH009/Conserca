// Correos con Resend, usando su API HTTP (no hace falta instalar nada).
// Sin RESEND_API_KEY no se envía nada: el correo se muestra en la consola del servidor (sirve para probar en local).

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

/** Envía un correo. Lanza error si Resend lo rechaza; quien llama decide si eso detiene la acción o solo se anota. */
export async function sendEmail(to: string, subject: string, lines: string[], button?: Button) {
  const text = [...lines, button ? `${button.label}: ${button.href}` : ""].filter(Boolean).join("\n\n");
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[correo sin enviar: falta RESEND_API_KEY] Para: ${to}\nAsunto: ${subject}\n${text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    // Sin dominio propio verificado, Resend solo deja enviar desde onboarding@resend.dev y solo al correo de la cuenta de Resend.
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "Conserca <onboarding@resend.dev>", to: [to], subject, html: emailHtml(lines, button), text }),
    signal: AbortSignal.timeout(10_000), // si Resend no responde, la acción no se queda colgada
  });
  if (!res.ok) throw new Error(`Resend respondió ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

export const logMailError = (e: unknown) => console.error("[correo] No se pudo enviar:", e);
