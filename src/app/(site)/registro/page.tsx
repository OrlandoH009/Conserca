import { redirect } from "next/navigation";

// El registro vive en la misma pantalla que el login (se desliza al lado).
export default function Registro() {
  redirect("/app/login?registro=1");
}
