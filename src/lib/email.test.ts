import { describe, expect, it } from "vitest";
import { buildMime, emailHtml } from "./email";

describe("correo HTML", () => {
  it("escapa lo que escribió la gente (nombres, motivos)", () => {
    const html = emailHtml(['Motivo: <script>alert("x")</script> & más'], { label: "Ver", href: 'https://x.test/?a=1&b="2"' });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&#60;script&#62;");
    expect(html).toContain('href="https://x.test/?a=1&#38;b=&#34;2&#34;"');
  });
});

describe("mensaje para Gmail", () => {
  const b64 = (s: string) => Buffer.from(s).toString("base64");

  it("codifica asunto con tildes y lleva texto y HTML", () => {
    const m = buildMime("ana@x.test", "Confirma tu cuenta en Conserca ñ", "hola", "<p>hola</p>", "Conserca <avisos@gmail.com>");
    expect(m).toContain(`Subject: =?UTF-8?B?${b64("Confirma tu cuenta en Conserca ñ")}?=`);
    expect(m).toContain("From: Conserca <avisos@gmail.com>");
    expect(m).toContain("To: ana@x.test");
    expect(m).toContain(b64("hola"));
    expect(m).toContain(b64("<p>hola</p>"));
  });

  it("no deja meter destinatarios con saltos de línea", () => {
    expect(() => buildMime("ana@x.test\r\nBcc: otro@x.test", "a", "b", "c")).toThrow();
  });

  it("parte el contenido en líneas de 76 caracteres", () => {
    const m = buildMime("ana@x.test", "a", "x".repeat(500), "y");
    expect(m.split("\r\n").every((l) => l.length <= 998)).toBe(true);
    expect(m).toContain(b64("x".repeat(500)).slice(0, 76) + "\r\n");
  });
});
