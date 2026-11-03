/** Opciones que eligió la persona en la cotización personalizada, guardadas ordenadas (columna `quotes.details`). */
export type QuoteDetails = {
  space: string;
  services: string[];
  size: string;
  stage: string;
  when: string;
  location?: string;
  plans: string;
  contact: string;
  time: string;
  detail?: string;
};

/** Pares (etiqueta, valor) para mostrar los detalles en el panel y en "Mis cotizaciones". */
export function detailRows(d: QuoteDetails, t: (es: string) => string = (s) => s): [string, string][] {
  return [
    [t("Tipo de espacio"), t(d.space)],
    [t("Servicios"), d.services.map((s) => t(s)).join(", ")],
    [t("Tamaño aproximado"), t(d.size)],
    [t("Etapa"), t(d.stage)],
    [t("Lo necesita"), t(d.when)],
    ...(d.location ? ([[t("Ubicación"), d.location]] as [string, string][]) : []),
    [t("¿Tiene planos?"), t(d.plans)],
    [t("Contacto preferido"), `${t(d.contact)}, ${t(d.time).toLowerCase()}`],
    ...(d.detail ? ([[t("Detalle"), d.detail]] as [string, string][]) : []),
  ];
}
