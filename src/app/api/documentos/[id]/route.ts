import { readFile } from "node:fs/promises";
import type { NextRequest } from "next/server";
import * as DocumentController from "@/controllers/document.controller";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/documentos/[id]">) {
  const { id } = await ctx.params;
  const n = Number(id);
  const f = Number.isInteger(n) && n > 0 ? await DocumentController.fileFor(n) : null;
  const bytes = f && (await readFile(f.path).catch(() => null));
  if (!f || !bytes) return new Response("No encontrado", { status: 404 });
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
