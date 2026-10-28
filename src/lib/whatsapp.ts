import { CONFIG } from "./config";

/** Enlace que abre WhatsApp con el mensaje listo. Un número de 8 dígitos se toma como local y se le pone el código del país. */
export function whatsappLink(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 8) digits = CONFIG.phoneCountryCode + digits;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
