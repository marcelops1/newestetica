import { CTAButton } from "@/components/CTAButton";
import { getContactInfo } from "@/lib/data";

export function FinalCta({ onBook }: { onBook: () => void }) {
  const contact = getContactInfo();
  return (
    <section
      id="sobre"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border border-primary/20 bg-primary-soft p-8 text-center sm:p-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
          Agendamento Simplificado
        </span>
        <h2 className="mt-2 font-display text-3xl font-normal text-ink sm:text-5xl">
          Dê o primeiro passo para o seu cuidado
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-secondary sm:text-base">
          Agende sua consulta inicial. Vamos conversar sobre suas queixas e
          alinhar um plano de tratamento personalizado.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <CTAButton onClick={onBook}>Agendar Consulta Agora</CTAButton>
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border bg-surface px-8 py-3.5 text-base font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            Falar com Recepção
          </a>
        </div>
      </div>
    </section>
  );
}
