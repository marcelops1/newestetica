"use client";

import { useState } from "react";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { getTreatmentOptions } from "@/lib/data";
import {
  DEFAULT_PROCEDURE,
  submitQuoteRequest,
  validateQuoteFields,
} from "@/lib/quote";

type Status = "idle" | "sending" | "success" | "error";

export function QuotePage() {
  const [booking, setBooking] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [selected, setSelected] = useState(DEFAULT_PROCEDURE);
  const [confirmedProcedure, setConfirmedProcedure] =
    useState(DEFAULT_PROCEDURE);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  const sending = status === "sending";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const phone = String(data.get("phone") ?? "");
    const message = String(data.get("message") ?? "");
    const errors = validateQuoteFields({ name, phone });
    setFieldErrors(errors);
    if (errors.name || errors.phone) return;
    setStatus("sending");
    const result = await submitQuoteRequest({
      name,
      phone,
      procedure: selected,
      message,
    });
    if (result.ok) {
      setConfirmedProcedure(result.procedure);
      setStatus("success");
    } else {
      setErrorMessage(result.message);
      setStatus("error");
    }
  }

  const inputClassName =
    "w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-base text-ink focus:border-primary focus:outline-none";

  return (
    <>
      <Header onBook={() => setBooking(true)} />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary-hover">
            Orçamento
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Um orçamento claro, no seu ritmo
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary sm:text-lg">
            Conte o que você gostaria de cuidar. A Fabiana prepara um orçamento
            personalizado para você — sem compromisso, sem pressa e sem surpresa
            no valor.
          </p>
        </div>

        <section
          aria-label="Solicitação de orçamento"
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
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
                <h2 className="font-display text-3xl text-ink">
                  Recebemos seu pedido!
                </h2>
                <p className="text-base leading-relaxed text-ink-secondary">
                  Procedimento de interesse:{" "}
                  <strong>{confirmedProcedure}</strong>. Vamos preparar seu
                  orçamento com carinho — nossa recepção entra em contato pelo
                  WhatsApp para conversar sobre valores e possibilidades, sem
                  compromisso.
                </p>
              </div>
            ) : (
              <>
                {status === "error" ? (
                  <div
                    role="alert"
                    className="mb-4 rounded-md border border-danger/30 bg-danger-soft p-4"
                  >
                    <p className="text-sm font-medium text-ink">
                      {errorMessage}
                    </p>
                    <p className="mt-1 text-xs text-ink-secondary">
                      Seus dados foram mantidos — confira com calma e tente de
                      novo, sem pressa.
                    </p>
                  </div>
                ) : null}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="quote-name"
                      className="mb-1 block text-xs font-medium text-ink-secondary"
                    >
                      Nome completo
                    </label>
                    <input
                      id="quote-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ex: Maria Oliveira"
                      autoComplete="name"
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={
                        fieldErrors.name ? "quote-name-error" : undefined
                      }
                      className={inputClassName}
                    />
                    {fieldErrors.name ? (
                      <p
                        id="quote-name-error"
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
                        htmlFor="quote-phone"
                        className="mb-1 block text-xs font-medium text-ink-secondary"
                      >
                        Telefone / WhatsApp
                      </label>
                      <input
                        id="quote-phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="(00) 00000-0000"
                        autoComplete="tel"
                        aria-invalid={Boolean(fieldErrors.phone)}
                        aria-describedby={
                          fieldErrors.phone ? "quote-phone-error" : undefined
                        }
                        className={inputClassName}
                      />
                      {fieldErrors.phone ? (
                        <p
                          id="quote-phone-error"
                          role="alert"
                          className="mt-1 text-xs text-danger"
                        >
                          {fieldErrors.phone}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label
                        htmlFor="quote-procedure"
                        className="mb-1 block text-xs font-medium text-ink-secondary"
                      >
                        Procedimento de interesse
                      </label>
                      <select
                        id="quote-procedure"
                        value={selected}
                        onChange={(event) => setSelected(event.target.value)}
                        className={inputClassName}
                      >
                        {getTreatmentOptions().map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quote-message"
                      className="mb-1 block text-xs font-medium text-ink-secondary"
                    >
                      Mensagem ou dúvida (opcional)
                    </label>
                    <textarea
                      id="quote-message"
                      name="message"
                      rows={3}
                      placeholder="Descreva brevemente o que você gostaria de tratar..."
                      className={inputClassName}
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
                          : "Pedir meu orçamento"}
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    Você recebe um orçamento personalizado antes de qualquer
                    decisão — nenhum valor é fechado aqui. Seus dados estão
                    protegidos de acordo com a LGPD; nada é enviado nesta
                    demonstração.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <BookingModal
        key={`${booking}`}
        open={booking}
        treatmentOptions={getTreatmentOptions()}
        onClose={() => setBooking(false)}
      />
    </>
  );
}
