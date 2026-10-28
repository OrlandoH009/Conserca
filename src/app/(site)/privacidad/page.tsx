import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, type LegalSection } from "@/components/site/LegalDoc";
import { contactVia, LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Aviso de privacidad", description: "Cómo Conserca trata tus datos personales." };

const SECTIONS: LegalSection[] = [
  {
    title: "Quién es el responsable",
    body: [
      `${LEGAL.company}, con operación en ${LEGAL.country}, es la responsable del tratamiento de los datos personales que recibe por este sitio (en adelante, «Conserca»).`,
      `Puedes comunicarte con nosotros para cualquier tema de tus datos ${contactVia("escribiéndonos")}.`,
    ],
  },
  {
    title: "Qué datos recopilamos",
    body: [
      "Solo los datos que tú nos das o que se generan al usar el sitio:",
      [
        "Cuenta: nombre, correo electrónico, teléfono o WhatsApp y contraseña (esta última se guarda cifrada, nunca en texto legible).",
        "Cotización rápida: nombre, teléfono y el texto que escribas sobre lo que necesitas.",
        "Cotización personalizada: tipo de espacio, servicios, tamaño, etapa y plazo de tu proyecto, y el detalle opcional que agregues.",
        "Proyecto: el nombre, avance, etapa, fechas, visitas de supervisión y documentos (PDF) que el equipo prepara o gestiona para ti.",
        "Técnicos: una cookie de sesión para mantenerte conectado y tu preferencia de tema claro u oscuro, guardada en tu navegador.",
      ],
      "No pedimos datos de pago ni datos personales sensibles (salud, religión, ideología, origen u otros semejantes) y te pedimos que no los incluyas en los textos libres.",
    ],
  },
  {
    title: "Para qué los usamos",
    body: [
      "Usamos tus datos únicamente para lo necesario para atenderte:",
      [
        "crear y administrar tu cuenta y verificar tu identidad al iniciar sesión;",
        "responder tus solicitudes de cotización y contactarte por el teléfono o correo que nos diste;",
        "prestar y documentar el servicio contratado, y mostrarte el avance y los documentos de tus proyectos;",
        "mantener la seguridad del sitio y prevenir abusos o fraudes;",
        "cumplir obligaciones legales y atender requerimientos de autoridad competente.",
      ],
      "No usamos tus datos para publicidad ni los vendemos. Si en el futuro quisiéramos usarlos para otra finalidad, te lo informaremos y, cuando la ley lo exija, te pediremos tu consentimiento.",
    ],
  },
  {
    title: "Por qué podemos tratarlos",
    body: [
      "Tratamos tus datos con base en tu consentimiento (por ejemplo, al aceptar los términos al crear tu cuenta o al enviarnos una cotización), en la necesidad de atender tu solicitud o de ejecutar el servicio que contrates, y en el cumplimiento de obligaciones legales. Puedes retirar tu consentimiento cuando quieras; hacerlo puede impedir que sigamos prestándote el servicio.",
    ],
  },
  {
    title: "Con quién los compartimos",
    body: [
      [
        "Equipo de Conserca: solo quienes lo necesitan para su trabajo, con permisos distintos según su función (ingeniería, presupuestos, supervisión o administración).",
        "Proveedores técnicos que nos prestan infraestructura (por ejemplo, alojamiento del sitio y de la base de datos), que solo pueden tratar los datos para ese fin.",
        "Autoridades, cuando una ley o una orden válida lo exija.",
      ],
      `Si algún proveedor trata datos fuera de ${LEGAL.country}, lo haremos con garantías de protección razonablemente equivalentes. Otros clientes no pueden ver tus proyectos ni tus documentos.`,
    ],
  },
  {
    title: "Cuánto tiempo los conservamos",
    body: [
      "Mientras tengas una cuenta activa o sean necesarios para atender tu solicitud o el servicio contratado. Después los eliminamos o los dejamos sin posibilidad de identificarte, salvo los que una ley o un contrato nos obligue a conservar por más tiempo (por ejemplo, documentación técnica y de facturación del proyecto).",
    ],
  },
  {
    title: "Cómo los protegemos",
    body: [
      "Aplicamos medidas técnicas y organizativas razonables: contraseñas cifradas, sesión protegida con una cookie que los scripts del navegador no pueden leer, permisos por rol para el equipo y descarga de documentos solo para el cliente dueño del proyecto y el equipo autorizado.",
      "Ningún sistema es infalible. Si ocurriera un incidente que afecte tus datos, te lo informaremos y avisaremos a la autoridad cuando corresponda.",
    ],
  },
  {
    title: "Tus derechos",
    body: [
      "Como titular de tus datos puedes pedir en cualquier momento, sin costo:",
      [
        "acceso: saber qué datos tuyos tenemos y cómo los usamos;",
        "rectificación: corregir datos inexactos o incompletos (el nombre y el teléfono también puedes editarlos tú en «Editar perfil»);",
        "cancelación o supresión: que eliminemos tus datos cuando ya no sean necesarios o retires tu consentimiento;",
        "oposición y limitación: oponerte a un uso de tus datos o pedir que lo restrinjamos;",
        "portabilidad: recibir tus datos en un formato de uso común, cuando aplique;",
        "olvido: que dejemos de tratar tus datos y no sigan disponibles cuando proceda legalmente.",
      ],
      `Para ejercerlos, ${contactVia("escríbenos")}, indicando tu nombre, el correo de tu cuenta y qué derecho quieres ejercer. Te responderemos dentro de los plazos que fija la ley. Si consideras que no atendimos tu solicitud como corresponde, puedes acudir ante la autoridad competente en materia de protección de datos personales en ${LEGAL.country}.`,
    ],
  },
  {
    title: "Cookies y almacenamiento en tu navegador",
    body: [
      [
        "Cookie de sesión («session»): necesaria para mantenerte conectado; dura 7 días o hasta que cierres sesión.",
        "Preferencia de tema («theme»): se guarda solo en tu navegador para recordar si prefieres el modo claro u oscuro.",
      ],
      "No usamos cookies de publicidad ni de seguimiento de terceros.",
    ],
  },
  {
    title: "Menores de edad",
    body: ["El sitio no está dirigido a menores de edad y no recopilamos datos de menores a sabiendas. Si crees que un menor nos dio sus datos, avísanos para eliminarlos."],
  },
  {
    title: "Cambios a este aviso",
    body: [`Podemos actualizar este aviso. La versión vigente es la publicada aquí, con su fecha (${LEGAL.updated}). Si el cambio es importante, lo avisaremos en el sitio o por correo.`],
  },
  {
    title: "Contacto",
    body: [`Para dudas sobre este aviso o sobre tus datos, ${contactVia("escríbenos")}.`],
  },
];

export default function Privacidad() {
  return (
    <LegalDoc title="Aviso de privacidad" sections={SECTIONS}>
      <p className="mt-12 text-sm text-mute">Consulta también nuestros <Link href="/terminos" className="font-semibold text-accent hover:underline">Términos y condiciones</Link>.</p>
    </LegalDoc>
  );
}
