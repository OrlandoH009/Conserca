// Fórmulas simplificadas de REFERENCIA. Todo resultado es un estimado que debe validar ingeniería.

export const TR_PER_KW = 3.517;
export const IVA = 0.16;

export type Orientation = "norte" | "sur" | "este" | "oeste";
export type VentKind = "estacionamiento" | "sanitarios" | "escalera" | "bodega";

export const ORIENTATION_FACTOR: Record<Orientation, number> = { norte: 0.9, sur: 1, este: 1.1, oeste: 1.2 };
export const DEFAULT_ACH: Record<VentKind, number> = { estacionamiento: 6, sanitarios: 10, escalera: 0, bodega: 4 };
export const VENT_LABEL: Record<VentKind, string> = {
  estacionamiento: "Estacionamiento",
  sanitarios: "Servicios sanitarios",
  escalera: "Escalera presurizada",
  bodega: "Bodega",
};

const PERSON_W = 130; // sensible + latente por persona
const ENVELOPE_W_M2 = 40; // envolvente base
const INFILTRATION_W_M3 = 1.224; // 0.3 cambios/h × 0.34 W·h/(m³·K) × 12 K
const FRESH_AIR_W_PERSON = 144.9; // 10 L/s por persona, ΔT 12 K
export const DOOR_AREA_M2 = 1.9;
export const PRESSURIZATION_VELOCITY_MS = 0.75;

function positive(n: number, label: string) {
  if (!Number.isFinite(n) || n <= 0) throw new RangeError(`${label} debe ser mayor que 0`);
}
function nonNegative(n: number, label: string) {
  if (!Number.isFinite(n) || n < 0) throw new RangeError(`${label} no puede ser negativo`);
}
export const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export interface LoadInput {
  areaM2: number;
  heightM: number;
  people: number;
  equipmentW: number;
  lightingWm2: number;
  orientation: Orientation;
}

export function coolingLoad(i: LoadInput) {
  positive(i.areaM2, "El área");
  positive(i.heightM, "La altura");
  nonNegative(i.people, "Las personas");
  nonNegative(i.equipmentW, "Los equipos");
  nonNegative(i.lightingWm2, "La iluminación");
  const factor = ORIENTATION_FACTOR[i.orientation];
  if (factor === undefined) throw new RangeError("Orientación no válida");

  const peopleW = i.people * PERSON_W;
  const equipmentLightW = i.equipmentW + i.lightingWm2 * i.areaM2;
  const envelopeW = i.areaM2 * ENVELOPE_W_M2 * factor + i.areaM2 * i.heightM * INFILTRATION_W_M3;
  const freshAirW = i.people * FRESH_AIR_W_PERSON;
  const totalW = peopleW + equipmentLightW + envelopeW + freshAirW;
  const kw = totalW / 1000;
  const pct = (w: number) => Math.round((w / totalW) * 100);
  return {
    kw: round(kw),
    tr: round(kw / TR_PER_KW),
    shares: {
      ocupantes: pct(peopleW),
      equipos: pct(equipmentLightW),
      envolvente: pct(envelopeW),
      ventilacion: pct(freshAirW),
    },
  };
}

export interface VentInput {
  kind: VentKind;
  areaM2?: number;
  heightM?: number;
  ach?: number;
  doors?: number;
}

/** Caudal en m³/h. Escalera: puertas × área × velocidad. Resto: volumen × cambios por hora. */
export function ventFlow(i: VentInput) {
  if (i.kind === "escalera") {
    positive(i.doors ?? NaN, "Las puertas");
    return round(i.doors! * DOOR_AREA_M2 * PRESSURIZATION_VELOCITY_MS * 3600, 0);
  }
  positive(i.areaM2 ?? NaN, "El área");
  positive(i.heightM ?? NaN, "La altura");
  positive(i.ach ?? NaN, "Los cambios por hora");
  return round(i.areaM2! * i.heightM! * i.ach!, 0);
}

export function budgetTotals(items: { quantity: number; unitPrice: number }[]) {
  const subtotal = round(items.reduce((s, x) => s + x.quantity * x.unitPrice, 0));
  const iva = round(subtotal * IVA);
  return { subtotal, iva, total: round(subtotal + iva) };
}

export const money = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
export const num = (n: number) => new Intl.NumberFormat("es-MX").format(n);
