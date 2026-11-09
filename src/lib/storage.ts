import { unlink } from "node:fs/promises";
import path from "node:path";

// PDF de proyectos anteriores: ya no se suben ni se descargan, pero se borran al eliminar su proyecto.
export const DOCS_DIR = path.join(process.cwd(), "storage", "documents");

/** Borra un PDF guardado; si ya no existe no es un error. `basename` impide salirse de la carpeta. */
export async function removeStoredFile(name: string) {
  try {
    await unlink(path.join(DOCS_DIR, path.basename(name)));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
