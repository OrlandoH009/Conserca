"use server";

// Capa de entrada de Next.js: solo llama al controlador y refresca las pantallas afectadas.
// Las acciones devuelven { ok } o { error }: la interfaz muestra el aviso, sin pantallas de error.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as BudgetController from "@/controllers/budget.controller";
import * as CalcController from "@/controllers/calc.controller";
import * as DocumentController from "@/controllers/document.controller";
import * as ProjectController from "@/controllers/project.controller";
import * as SupervisionController from "@/controllers/supervision.controller";
import { run, type R } from "@/lib/action-utils";

// Refresca la ficha, la lista, el panel general y la vista del cliente.
const touch = (projectId: number) => {
  revalidatePath(`/app/proyectos/${projectId}`);
  revalidatePath("/app/proyectos");
  revalidatePath("/app");
  revalidatePath("/mis-proyectos");
};

export async function createProject(_p: R, fd: FormData): Promise<R> {
  return run(async () => {
    await ProjectController.create(fd);
    revalidatePath("/app/proyectos");
    revalidatePath("/app");
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
    revalidatePath("/app/proyectos");
    revalidatePath("/app");
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

// ---- Supervisión
export async function addVisit(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await SupervisionController.addVisit(fd)));
}
export async function markVisitDone(fd: FormData): Promise<R> {
  return run(async () => touch(await SupervisionController.markVisitDone(fd)));
}
export async function addObservation(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await SupervisionController.addObservation(fd)));
}
export async function toggleObservation(fd: FormData): Promise<R> {
  return run(async () => touch(await SupervisionController.toggleObservation(fd)));
}

// ---- Documentos
export async function createDocument(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await DocumentController.create(fd)));
}
export async function setDocumentStatus(fd: FormData): Promise<R> {
  return run(async () => touch(await DocumentController.setStatus(fd)));
}
export async function removeDocument(fd: FormData): Promise<R> {
  return run(async () => touch(await DocumentController.remove(fd)));
}
