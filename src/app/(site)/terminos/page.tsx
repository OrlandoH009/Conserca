import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, type LegalSection } from "@/components/site/LegalDoc";
import { contactVia, LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Términos y condiciones", description: "Condiciones de uso del sitio y de los servicios de Conserca." };

const { company, country, email } = LEGAL;

const SECTIONS: LegalSection[] = [
  {
    title: "Quiénes somos y aceptación",
    body: [
      `Este sitio es operado por ${company} (en adelante, «Conserca»), empresa dedicada al cálculo, diseño y supervisión de sistemas de aire acondicionado y ventilación mecánica.`,
      "Al navegar por el sitio, crear una cuenta, enviar una cotización o usar cualquiera de sus herramientas, aceptas estos Términos y Condiciones. Si no estás de acuerdo, no uses el sitio.",
    ],
  },
  {
    title: "Qué ofrece el sitio",
    body: [
      "El sitio presenta nuestros servicios, recibe solicitudes de cotización y, para quienes tienen cuenta, permite consultar el avance de sus proyectos y descargar los documentos que se les entregan.",
      "Nuestros servicios son de cálculo, diseño técnico y supervisión. La ejecución material de obras o instalaciones no forma parte de ellos, salvo que se pacte por escrito.",
    ],
  },
  {
    title: "Cuentas de usuario",
    body: [
      "Para crear una cuenta debes tener capacidad legal para obligarte y dar datos verdaderos, completos y actualizados (nombre, correo y teléfono).",
      "Eres responsable de la confidencialidad de tu contraseña y de lo que se haga con tu cuenta. Avísanos de inmediato si sospechas un uso no autorizado.",
      "Podemos suspender o cancelar cuentas con datos falsos, usadas para fines ilícitos o que incumplan estos Términos.",
    ],
  },
  {
    title: "Cotizaciones y contratación",
    body: [
      "Enviar una solicitud de cotización no crea ningún contrato ni obligación de contratar para ninguna de las partes. Las cifras y alcances que te demos antes de firmar son estimaciones.",
      "El servicio se contrata solo mediante una propuesta o contrato que ambas partes acepten por escrito, donde se fijan alcance, precio, plazos y forma de pago. Si hay diferencia entre estos Términos y ese documento, prevalece el documento firmado en lo que trate del proyecto.",
    ],
  },
  {
    title: "Herramientas de cálculo y documentos técnicos",
    body: [
      "Las calculadoras, cifras de ejemplo y estimaciones que aparecen en el sitio son orientativas y usan fórmulas simplificadas. No sustituyen un proyecto de ingeniería ni deben usarse para construir, comprar equipos o tomar decisiones de seguridad.",
      "Los documentos técnicos de un proyecto (memorias, especificaciones, presupuestos) se emiten dentro del contrato correspondiente y su validez depende de la revisión y firma del profesional responsable.",
    ],
  },
  {
    title: "Propiedad intelectual y derechos de autor",
    body: [
      `Los textos, imágenes, ilustraciones, logotipos, nombre y marca «Conserca», diseño gráfico, código fuente, bases de datos, plantillas, métodos de cálculo y documentos publicados en el sitio son de Conserca o de quienes nos licencian su uso, y están protegidos por las leyes de propiedad intelectual y derechos de autor de ${country} y los tratados internacionales aplicables. Todos los derechos están reservados.`,
      "Te damos una licencia personal, limitada, revocable, no exclusiva e intransferible para ver el sitio y usarlo según estos Términos. No puedes, sin autorización previa y por escrito de Conserca:",
      [
        "copiar, reproducir, modificar, traducir, publicar o distribuir el contenido del sitio, total o parcialmente;",
        "usar nuestro nombre, marca o logotipos, o dar a entender que tienes relación con Conserca;",
        "extraer datos de forma automatizada (scraping), descompilar o intentar obtener el código fuente;",
        "vender, sublicenciar o explotar comercialmente el contenido, las herramientas o los documentos.",
      ],
      "Documentos de proyecto. Los planos, memorias, especificaciones, presupuestos y demás entregables que Conserca elabore para ti son obra de Conserca, que conserva su autoría y los derechos que la ley no permita transferir. Una vez pagado lo pactado, recibes una licencia no exclusiva e intransferible para usarlos en el proyecto y la ubicación para los que se elaboraron. No puedes reutilizarlos en otros proyectos, venderlos, publicarlos ni entregarlos a terceros para otro fin sin autorización escrita de Conserca. La cesión de derechos patrimoniales solo existe si se pacta expresamente por escrito.",
      "Tu material. La información, planos y documentos que nos entregues siguen siendo tuyos. Nos autorizas a usarlos únicamente para prestarte el servicio, y declaras que tienes derecho a compartirlos con nosotros.",
      `Si crees que algún contenido del sitio infringe tus derechos, ${contactVia("avísanos")}, con la descripción de la obra, dónde aparece y tus datos de contacto, y lo revisaremos con prontitud.`,
    ],
  },
  {
    title: "Uso aceptable",
    body: [
      "Te comprometes a no usar el sitio para fines ilegales, a no intentar acceder a cuentas, documentos o sistemas que no te correspondan, a no subir archivos con virus o código dañino, y a no interferir con su funcionamiento ni sobrecargarlo.",
      "Al subir o enviar contenido (por ejemplo, el texto de una cotización) declaras que es lícito y que no vulnera derechos de terceros.",
    ],
  },
  {
    title: "Datos personales",
    body: [
      "Tratamos los datos que nos das (nombre, correo, teléfono, contraseña, el contenido de tus cotizaciones y los documentos de tus proyectos) para crear y mantener tu cuenta, responder cotizaciones, prestar y documentar los servicios, mostrarte el avance de tus proyectos y cumplir obligaciones legales.",
      "No vendemos tus datos. Solo los compartimos con quien sea necesario para prestarte el servicio o cuando una autoridad competente lo exija. Tu contraseña se guarda cifrada y los documentos de tu proyecto solo pueden verlos tú y el equipo de Conserca que trabaja en él.",
      "Usamos una cookie de sesión, necesaria para que permanezcas conectado, y guardamos en tu navegador tu preferencia de tema claro u oscuro. No usamos cookies de publicidad.",
      `Conservamos tus datos mientras tengas cuenta o sean necesarios para el servicio y las obligaciones legales. Puedes pedir acceso, corrección o eliminación de tus datos, u oponerte a su uso, ${contactVia("escribiéndonos")}. Todo el detalle está en nuestro Aviso de privacidad (/privacidad). Algunos datos podrán conservarse si una ley o un contrato lo exige.`,
    ],
  },
  {
    title: "Disponibilidad y limitación de responsabilidad",
    body: [
      "Procuramos que el sitio funcione de forma continua y segura, pero se ofrece «tal cual»: puede haber interrupciones por mantenimiento o por causas ajenas a nosotros, y no garantizamos que esté libre de errores.",
      "En la medida que la ley lo permita, Conserca no responde por daños indirectos, lucro cesante o pérdida de datos derivados del uso del sitio, ni por decisiones tomadas con base en las estimaciones o herramientas de cálculo del sitio. En lo que se refiere a un servicio contratado, nuestra responsabilidad se rige por el contrato respectivo y, salvo dolo o lo que la ley no permita limitar, se limita al monto pagado por ese servicio.",
      "Nada de lo anterior excluye derechos que la ley te reconozca como consumidor o usuario y que no puedan limitarse por contrato.",
    ],
  },
  {
    title: "Cambios en estos términos",
    body: [
      `Podemos actualizar estos Términos. La versión vigente es la publicada en esta página, con su fecha de última actualización (${LEGAL.updated}). Si el cambio es importante, lo avisaremos en el sitio o por correo. Seguir usando el sitio después del cambio significa que lo aceptas.`,
    ],
  },
  {
    title: "Ley aplicable y jurisdicción",
    body: [
      country
        ? `Estos Términos se rigen por las leyes de ${country}. Para cualquier controversia, las partes se someten a los tribunales competentes de ${country}, sin perjuicio de los derechos que la ley te dé como consumidor, incluidos los que te reconocen ${LEGAL.laws}.`
        : "Estos Términos se rigen por las leyes del país donde Conserca tiene su domicilio legal y, para cualquier controversia, las partes se someten a los tribunales competentes de ese lugar, sin perjuicio de los derechos que la ley te dé como consumidor.",
      "Si alguna cláusula resulta inválida, las demás siguen vigentes.",
    ],
  },
  {
    title: "Contacto",
    body: [
      email
        ? `Para dudas sobre estos Términos, tus datos o derechos de autor, escríbenos a ${email}.`
        : "Para dudas sobre estos Términos, tus datos o derechos de autor, usa el formulario de cotización del sitio o los datos de contacto que te hayamos dado.",
    ],
  },
];

export default function Terminos() {
  return (
    <LegalDoc title="Términos y condiciones" sections={SECTIONS}>
      <p className="mt-12 text-sm text-mute">Consulta también nuestro <Link href="/privacidad" className="font-semibold text-accent hover:underline">Aviso de privacidad</Link>. ¿Listo para empezar? <Link href="/cotizar" className="font-semibold text-accent hover:underline">Solicita tu cotización</Link>.</p>
    </LegalDoc>
  );
}
