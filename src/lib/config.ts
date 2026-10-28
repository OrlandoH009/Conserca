// Ajustes regionales del sitio (El Salvador): un solo lugar para idioma, zona horaria, moneda e impuesto.
export const CONFIG = {
  locale: "es-SV",
  timeZone: "America/El_Salvador",
  currency: "USD",
  iva: 0.13, // IVA de El Salvador
  phoneExample: "+503 7000 0000",
  phoneCountryCode: "503", // para armar enlaces de WhatsApp con números locales de 8 dígitos
} as const;
