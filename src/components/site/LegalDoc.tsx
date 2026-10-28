import { LEGAL } from "@/lib/legal";
import { BackButton } from "./BackButton";

export type LegalSection = { title: string; body: (string | string[])[] };

/** Documento legal con índice y secciones numeradas; lo comparten los Términos y el Aviso de privacidad. */
export function LegalDoc({ title, sections, children }: { title: string; sections: LegalSection[]; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pb-28 sm:pt-32">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-2 text-xs text-mute sm:mt-3 sm:text-sm">Última actualización: {LEGAL.updated}</p>

      <nav aria-label="Contenido" className="mt-8 rounded-2xl border border-line bg-surface p-5">
        <p className="mb-2 text-sm font-semibold">Contenido</p>
        <ol className="grid list-inside list-decimal gap-x-8 gap-y-1 text-sm text-mute sm:grid-cols-2">
          {sections.map((s, i) => <li key={s.title}><a href={`#s${i + 1}`} className="hover:text-accent">{s.title}</a></li>)}
        </ol>
      </nav>

      <div className="mt-8 space-y-8 text-sm sm:mt-10 sm:space-y-10 sm:text-base">
        {sections.map((s, i) => (
          <section key={s.title} id={`s${i + 1}`} className="scroll-mt-24">
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{i + 1}. {s.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-mute">
              {s.body.map((b, j) => Array.isArray(b)
                ? <ul key={j} className="list-disc space-y-1.5 pl-6">{b.map((li) => <li key={li}>{li}</li>)}</ul>
                : <p key={j}>{b}</p>)}
            </div>
          </section>
        ))}
      </div>
      {children}
    </div>
  );
}
