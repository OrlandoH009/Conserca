// Aparte de Nav.tsx para poder usarlo en componentes de cliente (Nav lee la sesión en el servidor).
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 text-lg font-bold tracking-tight ${className}`}>
      <span className="h-7 w-7 rounded-lg bg-accent" aria-hidden />
      Conserca
    </span>
  );
}
