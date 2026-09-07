const DIFFERENTIALS = [
  {
    title: "Atendimento Individualizado",
    description:
      "Não usamos receitas prontas. Cada rosto e corpo é estudado para criar um plano exclusivo.",
  },
  {
    title: "Produtos Premium",
    description:
      "Trabalhamos exclusivamente com marcas registradas e reconhecidas.",
  },
  {
    title: "Conforto e Segurança",
    description:
      "Ambiente acolhedor e protocolo rigoroso de acompanhamento pós-procedimento.",
  },
  {
    title: "Transparência Total",
    description:
      "Orientação franca sobre o que é possível alcançar, sem promessas irrealistas.",
  },
];

export function Differentials() {
  return (
    <section
      id="diferenciais"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
          Nossa Ética
        </span>
        <h2 className="mt-1 font-display text-3xl font-normal text-ink sm:text-4xl">
          Por que escolher a Newestetica?
        </h2>
      </div>
      <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {DIFFERENTIALS.map((item, index) => (
          <li
            key={item.title}
            className="space-y-3 rounded-lg border border-border bg-surface p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-soft font-medium text-primary">
              {String(index + 1).padStart(2, "0")}
            </div>
            <h3 className="font-display text-xl text-ink">{item.title}</h3>
            <p className="text-xs leading-relaxed text-ink-secondary">
              {item.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
