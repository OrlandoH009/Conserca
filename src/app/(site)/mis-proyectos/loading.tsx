// Esqueleto de "Mis proyectos" mientras se cargan los datos del cliente.
export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 sm:px-6 sm:pb-28 sm:pt-32" aria-busy="true">
      <span className="sr-only" role="status">Cargando tus proyectos…</span>
      <div className="skeleton h-12 w-72 max-w-full" />
      <div className="skeleton mt-4 h-4 w-96 max-w-full" />
      <div className="skeleton mt-8 h-96 rounded-3xl" />
    </div>
  );
}
