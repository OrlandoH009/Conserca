// Etapas por las que pasa un proyecto, en orden. La etapa actual la elige el equipo y el cliente la ve como línea de pasos.
export const STAGES = ["Cargas térmicas", "Distribución de aire", "Ventilación mecánica", "Memorias y presupuesto", "Supervisión de obra", "Entrega"] as const;

export const stageIndex = (stage: string) => (STAGES as readonly string[]).indexOf(stage);

/** Avance sugerido por la etapa (0 % en la primera, 100 % en la última); `null` si la etapa no está en la lista. */
export function suggestedProgress(stage: string) {
  const i = stageIndex(stage);
  return i < 0 ? null : Math.round((i / (STAGES.length - 1)) * 100);
}
