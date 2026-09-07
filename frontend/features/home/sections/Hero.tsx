import { CTAButton } from "@/components/CTAButton";

const METRICS = [
  { value: "+3.500", label: "Pacientes satisfeitas" },
  { value: "100%", label: "Profissionais certificados" },
  { value: "Sutil & Seguro", label: "Sem resultados artificiais" },
];

export function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section
      id="topo"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 text-left sm:space-y-8 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary-hover">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            Estética Avançada e Naturalidade
          </div>

          <h1 className="font-display text-4xl font-normal leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Realce sua beleza natural com cuidados{" "}
            <span className="italic font-light text-primary-hover">
              personalizados
            </span>{" "}
            e seguros.
          </h1>

          <p className="max-w-2xl text-base font-normal leading-relaxed text-ink-secondary sm:text-lg">
            Protocolos faciais e corporais sob medida, pensados para
            rejuvenescer com sutileza, harmonia e transparência. Sem exageros.
          </p>

          <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
            <CTAButton onClick={onBook}>
              Agendar Consulta de Avaliação
            </CTAButton>
            <CTAButton href="#tratamentos" variant="ghost">
              Conhecer Tratamentos
            </CTAButton>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border pt-6 text-left">
            {METRICS.map((metric) => (
              <div key={metric.label}>
                <p className="font-display text-lg font-semibold text-ink sm:text-2xl">
                  {metric.value}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-lg border border-border bg-surface p-3 shadow-md">
              <div
                role="img"
                aria-label="Espaço reservado para foto da clínica"
                className="flex h-[380px] w-full items-center justify-center rounded-md bg-primary-soft sm:h-[440px]"
              >
                <span className="font-display text-2xl text-primary-hover">
                  Newestetica
                </span>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden max-w-[240px] rounded-md border border-border bg-surface p-4 shadow-md sm:-left-6 sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">
                    Consulta Transparente
                  </p>
                  <p className="text-xs text-ink-muted">
                    Plano com previsibilidade total de etapas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
