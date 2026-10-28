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
export function detailRows(d: QuoteDetails): [string, string][] {
  return [
    ["Tipo de espacio", d.space],
    ["Servicios", d.services.join(", ")],
    ["Tamaño aproximado", d.size],
    ["Etapa", d.stage],
    ["Lo necesita", d.when],
    ...(d.location ? ([["Ubicación", d.location]] as [string, string][]) : []),
    ["¿Tiene planos?", d.plans],
    ["Contacto preferido", `${d.contact}, ${d.time.toLowerCase()}`],
    ...(d.detail ? ([["Detalle", d.detail]] as [string, string][]) : []),
  ];
}
