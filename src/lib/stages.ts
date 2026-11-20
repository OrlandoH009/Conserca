// Etapas por las que pasa un proyecto, en orden. Las primeras 5 son «En proceso»; llegar a la última es entregarlo.
export const STAGES = ["Oferta de servicios", "Elaboración de documentación", "Cobro de anticipo", "Cobro de estimaciones por avances", "Revisión y documentación final", "Facturación final"] as const;
export type Stage = (typeof STAGES)[number];

/** La última etapa: elegirla marca el proyecto como entregado (y al revés). */
export const DELIVERY_STAGE: Stage = STAGES[STAGES.length - 1];

export const stageIndex = (stage: string) => (STAGES as readonly string[]).indexOf(stage);

/** Estado que corresponde a una etapa: solo la última es «entregado». */
export const statusForStage = (stage: string) => (stage === DELIVERY_STAGE ? "entregado" : "en_proceso");

/** Avance por etapa: 0 % en la primera, 100 % en la última (entregado); `null` si la etapa no está en la lista. */
export function suggestedProgress(stage: string) {
  const i = stageIndex(stage);
  return i < 0 ? null : Math.round((i / (STAGES.length - 1)) * 100);
}
