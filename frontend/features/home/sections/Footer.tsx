import { getContactInfo } from "@/lib/data";

export function Footer() {
  const contact = getContactInfo();
  return (
    <footer className="border-t border-border bg-surface pb-8 pt-12 text-xs text-ink-secondary">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 border-b border-border pb-12 md:grid-cols-4">
          <div className="space-y-3">
            <span className="font-display text-2xl font-semibold text-ink">
              Newestetica
            </span>
            <p className="leading-relaxed text-ink-muted">
              Clínica de estética avançada focada em resultados naturais,
              previsibilidade e bem-estar.
            </p>
          </div>
          <nav aria-label="Navegação do rodapé">
            <h4 className="mb-3 text-sm font-semibold text-ink">Navegação</h4>
            <ul className="space-y-2">
              {[
                ["#tratamentos", "Tratamentos"],
                ["#resultados", "Resultados"],
                ["#depoimentos", "Depoimentos"],
                ["#diferenciais", "Diferenciais"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="inline-flex min-h-[44px] items-center hover:text-primary"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink">Horários</h4>
            {contact.hours.map((line) => (
              <p key={line} className="mt-1 text-ink-muted">
                {line}
              </p>
            ))}
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-ink">Endereço</h4>
            {contact.address.map((line) => (
              <p key={line} className="leading-relaxed text-ink-muted">
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-ink-muted sm:flex-row">
          <p>© 2026 Newestetica. Todos os direitos reservados.</p>
          <p>Dados e contatos desta página são fictícios (demonstração).</p>
        </div>
      </div>
    </footer>
  );
}
