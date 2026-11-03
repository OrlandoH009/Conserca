import { getT } from "@/lib/i18n-server";
import type { R } from "@/lib/action-utils";
import { ActionButton } from "./ActionButton";
import { EditDialog } from "./EditDialog";

/** "Editar" (abre una ventana con el formulario `edit`) y "Quitar" (con confirmación) para la fila de una tabla. */
export async function RowActions({ title, edit, onRemove, removeFields, confirm }: {
  title: string;
  edit: React.ReactNode;
  onRemove: (fd: FormData) => Promise<R>;
  removeFields: Record<string, string | number>;
  confirm?: string;
}) {
  const t = await getT();
  return (
    <div className="flex items-center gap-3 whitespace-nowrap text-xs">
      <EditDialog label={t("Editar")} title={title} className="font-semibold text-accent hover:underline">{edit}</EditDialog>
      <ActionButton action={onRemove} fields={removeFields} confirm={confirm ?? t("¿Quitar este elemento? Esta acción no se puede deshacer.")} okText={t("Elemento quitado")} className="font-semibold text-red-600 hover:underline">{t("Quitar")}</ActionButton>
    </div>
  );
}
