// Esqueleto que se ve al instante mientras carga cualquier pantalla del panel.
export default function Loading() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">Cargando…</span>
      <div className="skeleton h-8 w-64" />
      <div className="skeleton mt-3 h-4 w-80 max-w-full" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-[2fr_1fr]">
        <div className="skeleton h-72" />
        <div className="skeleton h-72" />
      </div>
    </div>
  );
}
