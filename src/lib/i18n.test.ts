import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EN } from "./i18n-en";
import { translate } from "./i18n";
import { CONTACTS, PLANS, SIZES, SPACE_TYPES, STAGES as QUOTE_STAGES, TIMES, WHEN } from "./quote-options";
import { ROLE_LABEL } from "./permissions";
import { SERVICES } from "./services";
import { STAGES } from "./stages";

const src = join(__dirname, "..");
const files: string[] = [];
(function walk(d: string) {
  for (const f of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(f.name) && !/i18n|\.test\./.test(f.name)) files.push(p);
  }
})(src);

// Todo texto literal que se pasa a t(...) o a los títulos/pistas del formulario de cotización.
const used = new Set<string>();
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/(?:\bt|\(await getT\(\)\))\(\s*"((?:[^"\\]|\\.)*)"/g)) used.add(JSON.parse(`"${m[1]}"`));
  if (f.endsWith("CotizarForm.tsx")) for (const m of s.matchAll(/(?:title|hint)="([^"]+)"/g)) used.add(m[1]);
}
used.delete("Texto en español"); // ejemplo en un comentario de código

// Constantes con textos que se muestran por variable (t(label)): se revisan sus literales de texto.
const NAMES = "QS|KIND|STATUS|REVIEW|AREAS|LV|TABS|ITEMS|PROJECT_STATUS|STATUS_LABEL|DOC_STATUS|DOC_KIND|QUOTE_STATUS|STEPS|PROJECTS|NUMBERS|COPY|CARDS|VENT_LABEL|LINKS|footerLinks";
const constRe = new RegExp(`^(?:export )?const (?:${NAMES})\\b[\\s\\S]*?;\\n`, "gm");
const cssish = /(^|\s)(text|bg|px|py|border|rounded|flex|inline|hover|ring)-/;
const constants = new Set<string>();
for (const f of files) {
  for (const m of readFileSync(f, "utf8").matchAll(constRe))
    for (const q of m[0].matchAll(/"((?:[^"\\]|\\.)*)"/g))
      if (/^[A-ZÁÉÍÓÚÑ¿¡]|[áéíóúñ]| /.test(q[1]) && !cssish.test(q[1]) && !/^\/|^https?:/.test(q[1])) constants.add(q[1]);
}

const lists = [
  ...SERVICES.flatMap((s) => [s.title, s.short, ...s.points]),
  ...SPACE_TYPES, ...SIZES, ...QUOTE_STAGES, ...WHEN, ...CONTACTS, ...TIMES, ...PLANS,
  ...STAGES, ...Object.values(ROLE_LABEL),
];

describe("traducciones al inglés", () => {
  it("todo texto de t() tiene traducción", () => {
    expect([...used].filter((k) => !(k in EN))).toEqual([]);
  });
  it("las listas de datos (servicios, opciones, etapas, roles) tienen traducción", () => {
    expect(lists.filter((k) => !(k in EN))).toEqual([]);
  });
  it("los textos de las constantes (estados, pestañas, menús…) tienen traducción", () => {
    expect([...constants].filter((k) => !(k in EN))).toEqual([]);
  });
  it("los mensajes que arma el servidor se reconocen como patrón", () => {
    expect(translate("en", "El nombre es obligatorio")).toBe("Name is required");
    expect(translate("en", "El caudal debe ser mayor que 0")).toBe("Airflow must be greater than 0");
    expect(translate("en", "Ese archivo pesa 12 MB y el máximo es 10 MB.")).toBe("That file weighs 12 MB and the maximum is 10 MB.");
    expect(translate("en", "Documento «Memoria A»: En revisión")).toBe("Document “Memoria A”: Under review");
    expect(translate("en", "Estado: Entregado")).toBe("Status: Delivered");
    expect(translate("en", "Este cliente tiene 2 proyectos. Cámbialos de cliente antes de eliminarlo.")).toBe("This client has 2 projects. Move them to another client before deleting.");
    expect(translate("es", "El nombre es obligatorio")).toBe("El nombre es obligatorio");
  });
  it("las traducciones conservan los {marcadores}", () => {
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    expect(Object.entries(EN).filter(([es, en]) => ph(es) !== ph(en)).map(([es]) => es)).toEqual([]);
  });
  it("translate: reemplaza marcadores y cae al español si falta la clave", () => {
    expect(translate("en", "Falta 1 día")).toBe("1 day left");
    expect(translate("en", "Faltan {n} días", { n: 3 })).toBe("3 days left");
    expect(translate("es", "Faltan {n} días", { n: 3 })).toBe("Faltan 3 días");
    expect(translate("en", "texto sin traducir")).toBe("texto sin traducir");
  });
});
