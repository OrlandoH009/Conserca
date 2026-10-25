"use server";

import { revalidatePath } from "next/cache";
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
