// Opciones del formulario de cotización: las usa el formulario (cliente) y el controlador (validación).
export const SPACE_TYPES = ["Oficinas", "Estacionamiento", "Plaza comercial", "Bodega o nave", "Hospital o clínica", "Vivienda o residencial", "Otro"] as const;
export const SIZES = ["Menos de 200 m²", "200 a 1,000 m²", "1,000 a 5,000 m²", "Más de 5,000 m²", "No lo sé aún"] as const;
export const STAGES = ["Solo tengo la idea", "Proyecto en diseño", "Obra en curso", "Ya existe un sistema y quiero mejorarlo"] as const;
export const WHEN = ["Lo antes posible", "En 1 a 3 meses", "Más adelante", "Solo estoy explorando"] as const;
export const CONTACTS = ["Llamada o WhatsApp", "Correo electrónico"] as const;
export const TIMES = ["Por la mañana", "Por la tarde", "A cualquier hora"] as const;
export const PLANS = ["Sí, completos", "Tengo algo parcial", "No tengo planos"] as const;
export const DETAIL_MAX = 1500;
