import { describe, expect, it } from "vitest";
import { emailHtml } from "./email";

describe("correo HTML", () => {
  it("escapa lo que escribió la gente (nombres, motivos)", () => {
    const html = emailHtml(['Motivo: <script>alert("x")</script> & más'], { label: "Ver", href: 'https://x.test/?a=1&b="2"' });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&#60;script&#62;");
    expect(html).toContain('href="https://x.test/?a=1&#38;b=&#34;2&#34;"');
  });
});
