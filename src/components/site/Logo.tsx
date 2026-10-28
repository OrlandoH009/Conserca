import Image from "next/image";
import light from "../../../public/brand/logo.png";
import dark from "../../../public/brand/logo-dark.png";
import white from "../../../public/brand/logo-white.png";

// Aparte de Nav.tsx para poder usarlo en componentes de cliente (Nav lee la sesión en el servidor).
// El tamaño se da con la altura (h-*); el ancho sale solo. Fuentes en public/brand/ (logo de 2026).
// Claro/oscuro: dos imágenes, la visible la decide globals.css (.logo-light / .logo-dark; en impresión siempre la clara).
// `onAccent`: para fondos de color de marca (login): versión blanca.
export function Logo({ className = "h-8", onAccent = false }: { className?: string; onAccent?: boolean }) {
  const img = "w-auto h-full object-contain";
  return (
    <span className={`group relative flex shrink-0 transition duration-300 active:scale-95 motion-safe:hover:scale-[1.03] ${className}`}>
      <span className="sr-only">Conserca</span>
      {onAccent ? (
        <Image src={white} alt="" sizes="240px" className={img} />
      ) : (
        <>
          <Image src={light} alt="" sizes="240px" className={`logo-light ${img}`} />
          <Image src={dark} alt="" sizes="240px" className={`logo-dark ${img}`} />
        </>
      )}
    </span>
  );
}
