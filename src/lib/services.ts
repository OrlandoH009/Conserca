export const SERVICES = [
  {
    id: "cargas",
    title: "Cálculo de cargas térmicas",
    short: "Cuánto frío o calor necesita cada espacio.",
    points: ["Ocupantes, equipos e iluminación", "Orientación y envolvente del espacio", "Resultado en kW y toneladas de refrigeración"],
  },
  {
    id: "distribucion",
    title: "Distribución de aire",
    short: "Conductos, rejillas y difusores bien dimensionados.",
    points: ["Cálculo del sistema de conductos", "Selección de rejillas y difusores", "Caudales por ramal"],
  },
  {
    id: "ventilacion",
    title: "Ventilación mecánica",
    short: "Aire limpio donde más importa.",
    points: ["Estacionamientos", "Servicios sanitarios", "Presurización de escaleras de emergencia", "Bodegas"],
  },
  {
    id: "documentos",
    title: "Memorias, especificaciones y presupuestos",
    short: "Todo lo técnico, por escrito y ordenado.",
    points: ["Memorias de cálculo", "Especificaciones técnicas de equipos y materiales", "Presupuestos estimados de obra"],
  },
  {
    id: "supervision",
    title: "Supervisión",
    short: "Revisamos que la obra siga el diseño.",
    points: ["Visitas programadas", "Bitácora y observaciones", "Seguimiento hasta cerrar cada pendiente"],
  },
] as const;
