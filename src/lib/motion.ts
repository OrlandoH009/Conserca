// Valores de movimiento compartidos: así todas las animaciones del sitio se sienten parte de lo mismo.
export const EASE = [0.22, 1, 0.36, 1] as const; // entradas: arranca rápido y frena suave
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const; // movimientos largos (paneles que se deslizan)
export const DUR = { fast: 0.25, base: 0.45, slow: 0.8 } as const;

/** Entrada "sube y aparece" con retraso escalonado por posición. */
export const rise = (i = 0, y = 24) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.slow, delay: i * 0.1, ease: EASE },
});
