import { unlink } from "node:fs/promises";
import path from "node:path";

// Fuera de public/: los PDF solo salen por /api/documentos/[id], que revisa la sesión.
export const DOCS_DIR = path.join(process.cwd(), "storage", "documents");

/** Borra un PDF guardado; si ya no existe no es un error. `basename` impide salirse de la carpeta. */
export async function removeStoredFile(name: string) {
  try {
    await unlink(path.join(DOCS_DIR, path.basename(name)));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
