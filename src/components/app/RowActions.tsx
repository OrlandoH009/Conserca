import type { R } from "@/lib/action-utils";
import { ActionButton } from "./ActionButton";
import { EditDialog } from "./EditDialog";

/** "Editar" (abre una ventana con el formulario `edit`) y "Quitar" (con confirmación) para la fila de una tabla. */
export function RowActions({ title, edit, onRemove, removeFields, confirm = "¿Quitar este elemento? Esta acción no se puede deshacer." }: {
  title: string;
  edit: React.ReactNode;
  onRemove: (fd: FormData) => Promise<R>;
  removeFields: Record<string, string | number>;
  confirm?: string;
}) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap text-xs">
      <EditDialog label="Editar" title={title} className="font-semibold text-accent hover:underline">{edit}</EditDialog>
      <ActionButton action={onRemove} fields={removeFields} confirm={confirm} okText="Elemento quitado" className="font-semibold text-red-600 hover:underline">Quitar</ActionButton>
    </div>
  );
}
