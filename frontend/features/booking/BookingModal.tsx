"use client";

import { useEffect, useId, useRef, useState } from "react";

type BookingModalProps = {
  open: boolean;
  treatment?: string;
  treatmentOptions: string[];
  onClose: () => void;
};

export function BookingModal({
  open,
  treatment = "Avaliação Geral",
  treatmentOptions,
  onClose,
}: BookingModalProps) {
  const [sent, setSent] = useState(false);
  const [selected, setSelected] = useState(treatment);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    if (!openerRef.current && document.activeElement instanceof HTMLElement) {
      openerRef.current = document.activeElement;
    }
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
      openerRef.current = null;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="relative my-auto w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-md sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar agendamento"
          className="absolute right-4 top-4 inline-flex min-h-[44px] min-w-[44px] items-center justify-center p-1 text-ink-muted hover:text-ink"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {!sent ? (
          <>
            <div className="mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-hover">
                Agendamento Online
              </span>
              <h3
                id={titleId}
                className="mt-0.5 font-display text-2xl text-ink"
              >
                Solicitar Consulta de Avaliação
              </h3>
              <p className="mt-1 text-xs text-ink-muted">
                Preencha seus dados para receber o contato de confirmação da
                nossa equipe.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <div>
                <label
                  htmlFor="booking-name"
                  className="mb-1 block text-xs font-medium text-ink-secondary"
                >
                  Nome completo
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  placeholder="Ex: Maria Oliveira"
                  autoComplete="name"
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="booking-phone"
                    className="mb-1 block text-xs font-medium text-ink-secondary"
                  >
                    Telefone / WhatsApp
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                    className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="booking-treatment"
                    className="mb-1 block text-xs font-medium text-ink-secondary"
                  >
                    Tratamento de interesse
                  </label>
                  <select
                    id="booking-treatment"
                    value={selected}
                    onChange={(event) => setSelected(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
                  >
                    {treatmentOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-notes"
                  className="mb-1 block text-xs font-medium text-ink-secondary"
                >
                  Mensagem ou dúvida (opcional)
                </label>
                <textarea
                  id="booking-notes"
                  rows={3}
                  placeholder="Descreva brevemente o que gostaria de tratar..."
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-hover"
                >
                  Enviar solicitação de agendamento
                </button>
              </div>
              <p className="text-center text-xs text-ink-muted">
                Seus dados estão protegidos de acordo com a LGPD. Nada é enviado
                — demonstração com dados mockados.
              </p>
            </form>
          </>
        ) : (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 id={titleId} className="font-display text-2xl text-ink">
              Solicitação Recebida!
            </h4>
            <p className="text-sm leading-relaxed text-ink-secondary">
              Agradecemos o contato. Nossa recepção entrará em contato via
              WhatsApp em até 2 horas úteis para confirmar a data.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-border bg-background px-6 py-2.5 text-base font-medium text-ink"
            >
              Fechar Janela
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
