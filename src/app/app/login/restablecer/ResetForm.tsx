"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { requestReset, resetPassword, type LoginState } from "../actions";
import { PasswordInput } from "../PasswordInput";

export function ResetForm({ token }: { token?: string }) {
  const t = useT();
  const [state, action, pending] = useActionState<LoginState, FormData>(token ? resetPassword : requestReset, {});

  if (state.sent) return <p role="status" className="rounded-xl bg-soft px-4 py-3 text-sm">{t("Si hay una cuenta con {email}, te enviamos un enlace. Revisa tu correo (también la carpeta de spam).", { email: state.sent })}</p>;

  return (
    <form action={action} className="space-y-4">
      {token ? (
        <>
          <input type="hidden" name="t" value={token} />
          <div>
            <label className="label" htmlFor="password">{t("Contraseña nueva")}</label>
            <PasswordInput id="password" name="password" autoComplete="new-password" minLength={10} placeholder={t("Mín. 10 caracteres")} required />
          </div>
          <div>
            <label className="label" htmlFor="confirm">{t("Repítela")}</label>
            <PasswordInput id="confirm" name="confirm" autoComplete="new-password" required />
          </div>
        </>
      ) : (
        <div>
          <label className="label" htmlFor="email">{t("Correo")}</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" required />
        </div>
      )}
      {state.error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <p>{t(state.error)}</p>
          {token && state.error.startsWith("El enlace") && <Link href="/app/login/restablecer" className="mt-2 inline-flex rounded-full border border-red-300 bg-surface px-3 py-1.5 font-semibold text-red-700 active:scale-95">{t("Pedir otro enlace")}</Link>}
        </div>
      )}
      <button className="btn w-full py-3" disabled={pending}>{pending ? t("Enviando…") : token ? t("Guardar contraseña") : t("Enviar enlace")}</button>
    </form>
  );
}
