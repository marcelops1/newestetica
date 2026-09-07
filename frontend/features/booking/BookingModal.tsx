"use client";

import { useEffect, useId, useRef, useState } from "react";
import { resolveTreatment, submitBookingRequest } from "@/lib/booking";

type BookingModalProps = {
  open: boolean;
  treatment?: string;
  treatmentOptions: string[];
  onClose: () => void;
};

type Status = "idle" | "sending" | "success" | "error";

export function BookingModal({
  open,
  treatment = "Avaliação Geral",
  treatmentOptions,
  onClose,
}: BookingModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [selected, setSelected] = useState(() =>
    resolveTreatment(treatment, treatmentOptions),
  );
  const [confirmedTreatment, setConfirmedTreatment] = useState(treatment);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});
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
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
      openerRef.current = null;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sending = status === "sending";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "");
    const digits = phone.replace(/\D/g, "");
    const errors: { name?: string; phone?: string } = {};
    if (name.length < 2) {
      errors.name = "Conte-nos seu nome para podermos te chamar com carinho.";
    }
    if (digits.length < 10) {
      errors.phone =
        "Confira o WhatsApp com DDD, assim conseguimos te retornar.";
    }
    setFieldErrors(errors);
    if (errors.name || errors.phone) return;
    setStatus("sending");
    const result = await submitBookingRequest({
      name,
      phone,
      treatment: selected,
      notes: String(data.get("notes") ?? ""),
    });
    if (result.ok) {
      setConfirmedTreatment(result.treatment);
      setStatus("success");
    } else {
      setErrorMessage(result.message);
      setStatus("error");
    }
  }

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

        {status === "success" ? (
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
              Tratamento solicitado: <strong>{confirmedTreatment}</strong>.
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
        ) : (
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

            {status === "error" ? (
              <div
                role="alert"
                className="mb-4 rounded-md border border-danger/30 bg-danger-soft p-4"
              >
                <p className="text-sm font-medium text-ink">{errorMessage}</p>
                <p className="mt-1 text-xs text-ink-secondary">
                  Seus dados foram mantidos — confira com calma e tente de novo,
                  sem pressa.
                </p>
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="booking-name"
                  className="mb-1 block text-xs font-medium text-ink-secondary"
                >
                  Nome completo
                </label>
                <input
                  id="booking-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ex: Maria Oliveira"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={
                    fieldErrors.name ? "booking-name-error" : undefined
                  }
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
                />
                {fieldErrors.name ? (
                  <p
                    id="booking-name-error"
                    role="alert"
                    className="mt-1 text-xs text-danger"
                  >
                    {fieldErrors.name}
                  </p>
                ) : null}
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
                    name="phone"
                    type="tel"
                    required
                    placeholder="(00) 00000-0000"
                    autoComplete="tel"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    aria-describedby={
                      fieldErrors.phone ? "booking-phone-error" : undefined
                    }
                    className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
                  />
                  {fieldErrors.phone ? (
                    <p
                      id="booking-phone-error"
                      role="alert"
                      className="mt-1 text-xs text-danger"
                    >
                      {fieldErrors.phone}
                    </p>
                  ) : null}
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
                  name="notes"
                  rows={3}
                  placeholder="Descreva brevemente o que gostaria de tratar..."
                  className="w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-70"
                >
                  {sending
                    ? "Enviando com cuidado…"
                    : status === "error"
                      ? "Tentar de novo"
                      : "Enviar solicitação de agendamento"}
                </button>
              </div>
              <p className="text-center text-xs text-ink-muted">
                Seus dados estão protegidos de acordo com a LGPD. Nada é enviado
                — demonstração com dados mockados.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
