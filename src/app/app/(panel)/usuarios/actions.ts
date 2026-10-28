"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as UserController from "@/controllers/user.controller";
import { run, type R } from "@/lib/action-utils";

export async function createUser(_p: R, fd: FormData): Promise<R> {
  return run(async () => {
    await UserController.create(fd);
    revalidatePath("/app/usuarios");
  });
}

export async function setRole(fd: FormData) {
  await UserController.setRole(fd);
  revalidatePath("/app/usuarios");
}

export async function updateUser(_p: R, fd: FormData): Promise<R> {
  const r = await run(async () => {
    await UserController.update(fd);
    revalidatePath("/app/usuarios");
  });
  if (r.ok) redirect("/app/usuarios");
  return r;
}

export async function removeUser(fd: FormData) {
  await UserController.remove(fd);
  revalidatePath("/app/usuarios");
  redirect("/app/usuarios");
}
