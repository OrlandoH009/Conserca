"use client";

import { useActionState } from "react";
import { useT } from "@/components/site/LocaleProvider";
import { resendVerification, type LoginState } from "./actions";

/** Botón para volver a mandar el correo de confirmación (es un formulario aparte: no puede ir dentro de otro). */
export function ResendVerification({ email }: { email: string }) {
  const t = useT();
  const [state, action, pending] = useActionState<LoginState, FormData>(resendVerification, {});
  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      {state.sent ? (
        <p role="status" className="rounded-xl bg-soft px-4 py-2.5 text-sm">{t("Listo: si falta confirmar la cuenta, te enviamos un correo nuevo.")}</p>
      ) : (
        <button className="btn-ghost btn-line w-full py-2.5" disabled={pending}>{pending ? t("Enviando…") : t("Reenviar correo de confirmación")}</button>
      )}
      {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{t(state.error)}</p>}
    </form>
  );
}
