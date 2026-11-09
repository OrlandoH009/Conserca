"use server";

// Capa de entrada de Next.js: solo llama al controlador y refresca las pantallas afectadas.
// Las acciones devuelven { ok } o { error }: la interfaz muestra el aviso, sin pantallas de error.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as BudgetController from "@/controllers/budget.controller";
import * as CalcController from "@/controllers/calc.controller";
import * as PaymentController from "@/controllers/payment.controller";
import * as ProjectController from "@/controllers/project.controller";
import * as ImportController from "@/controllers/import.controller";
import { run, type R } from "@/lib/action-utils";
import type { ImportResult } from "@/lib/project-import";

// Refresca la ficha, la lista, el panel general y la vista del cliente.
const touch = (projectId: number) => {
  revalidatePath(`/app/proyectos/${projectId}`);
  revalidatePath("/app", "layout"); // el aviso de fechas límite vive en el layout del panel
  revalidatePath("/mis-proyectos");
};

export async function createProject(_p: R, fd: FormData): Promise<R> {
  return run(async () => {
    await ProjectController.create(fd);
    revalidatePath("/app", "layout");
  });
}

export async function updateProject(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await ProjectController.update(fd)));
}

export async function setProjectStatus(fd: FormData): Promise<R> {
  return run(async () => touch(await ProjectController.setStatus(fd)));
}

export async function setProjectStage(fd: FormData): Promise<R> {
  return run(async () => touch(await ProjectController.setStage(fd)));
}

export async function setProjectProgress(fd: FormData): Promise<R> {
  return run(async () => touch(await ProjectController.setProgress(fd)));
}

export async function setProjectClientUser(fd: FormData): Promise<R> {
  return run(async () => touch(await ProjectController.setClientUser(fd)));
}

export async function archiveProject(fd: FormData): Promise<R> {
  return run(async () => {
    touch(await ProjectController.archive(fd));
    redirect("/app/proyectos");
  });
}

export async function restoreProject(fd: FormData): Promise<R> {
  return run(async () => {
    const id = await ProjectController.archive(fd);
    touch(id);
    redirect(`/app/proyectos/${id}`);
  });
}

export async function deleteProject(fd: FormData): Promise<R> {
  return run(async () => {
    await ProjectController.remove(fd);
    revalidatePath("/app", "layout");
    redirect("/app/proyectos?archivados=1");
  });
}

export async function removeRow(fd: FormData): Promise<R> {
  return run(async () => touch(await ProjectController.removeRow(fd)));
}

// ---- Cálculos y presupuesto
export async function addSpace(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.addSpace(fd)));
}
export async function updateSpace(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.updateSpace(fd)));
}
export async function addAirElement(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.addAirElement(fd)));
}
export async function updateAirElement(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.updateAirElement(fd)));
}
export async function addVentZone(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.addVentZone(fd)));
}
export async function updateVentZone(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.updateVentZone(fd)));
}
export async function addBudgetItem(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await BudgetController.addItem(fd)));
}
export async function updateBudgetItem(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await BudgetController.updateItem(fd)));
}

// ---- Cobros
export async function createPaymentPlan(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await PaymentController.createPlan(fd)));
}
export async function updatePayment(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await PaymentController.update(fd)));
}
export async function setPaymentStatus(fd: FormData): Promise<R> {
  return run(async () => touch(await PaymentController.setStatus(fd)));
}
export async function invoicePayment(_p: R, fd: FormData): Promise<R> {
  return setPaymentStatus(fd);
}

// ---- Carga de proyectos previos
export async function importProjects(_p: ImportResult, fd: FormData): Promise<ImportResult> {
  let result: ImportResult = {};
  const out = await run(async () => {
    result = await ImportController.importFile(fd);
    if (result.created) revalidatePath("/app", "layout");
  });
  return out.error ? { error: out.error } : result;
}
