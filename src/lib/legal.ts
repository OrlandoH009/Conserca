// Datos de la empresa que usan los Términos y Condiciones, el Aviso de privacidad y el pie de página.
// Completa `email` antes de publicar: es el canal para que las personas ejerzan sus derechos sobre sus datos
// y para avisos de derechos de autor. Vacío, los textos remiten al formulario de cotización.
export const LEGAL = {
  company: "Conserca, S.A. de C.V.",
  country: "El Salvador",
  email: "", // p. ej. "privacidad@tudominio.com"
  // Se nombran sin número de decreto ni de artículo: confirma con tu abogado la versión vigente de cada una.
  laws: "la Ley de Protección al Consumidor, la Ley de Propiedad Intelectual y la Ley para la Protección de Datos Personales",
  updated: "24 de octubre de 2026", // cambia esta fecha cada vez que cambies los textos legales
};

export const contactVia = (verb: string) =>
  LEGAL.email ? `${verb} a ${LEGAL.email}` : `${verb} por los medios de contacto del sitio (formulario de cotización o el teléfono que te hayamos dado)`;
