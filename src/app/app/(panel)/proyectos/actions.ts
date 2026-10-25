"use server";

// Capa de entrada de Next.js: solo llama al controlador y refresca las pantallas afectadas.
import { revalidatePath } from "next/cache";
import * as BudgetController from "@/controllers/budget.controller";
import * as CalcController from "@/controllers/calc.controller";
import * as DocumentController from "@/controllers/document.controller";
import * as ProjectController from "@/controllers/project.controller";
import * as SupervisionController from "@/controllers/supervision.controller";
import { run, type R } from "@/lib/action-utils";

const touch = (projectId: number) => revalidatePath(`/app/proyectos/${projectId}`);

export async function createProject(_p: R, fd: FormData): Promise<R> {
  return run(async () => {
    await ProjectController.create(fd);
    revalidatePath("/app/proyectos");
    revalidatePath("/app");
  });
}

export async function setProjectStatus(fd: FormData) {
  touch(await ProjectController.setStatus(fd));
  revalidatePath("/app/proyectos");
}

export async function setProjectStage(fd: FormData) {
  touch(await ProjectController.setStage(fd));
}

export async function removeRow(fd: FormData) {
  touch(await ProjectController.removeRow(fd));
}

export async function addSpace(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.addSpace(fd)));
}

export async function addAirElement(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.addAirElement(fd)));
}

export async function addVentZone(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await CalcController.addVentZone(fd)));
}

export async function addBudgetItem(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await BudgetController.addItem(fd)));
}

export async function addVisit(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await SupervisionController.addVisit(fd)));
}

export async function markVisitDone(fd: FormData) {
  touch(await SupervisionController.markVisitDone(fd));
  revalidatePath("/app");
}

export async function addObservation(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await SupervisionController.addObservation(fd)));
}

export async function toggleObservation(fd: FormData) {
  touch(await SupervisionController.toggleObservation(fd));
}

export async function createDocument(_p: R, fd: FormData): Promise<R> {
  return run(async () => touch(await DocumentController.create(fd)));
}

export async function setDocumentStatus(fd: FormData) {
  touch(await DocumentController.setStatus(fd));
  revalidatePath("/app");
}
