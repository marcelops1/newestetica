"use client";

import { useState } from "react";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { getContactInfo, getTreatmentOptions } from "@/lib/data";
import { submitContactRequest, validateContactFields } from "@/lib/contact";

type Status = "idle" | "sending" | "success" | "error";

export function ContactPage() {
  const [booking, setBooking] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    contact?: string;
    message?: string;
  }>({});

  const sending = status === "sending";
  const contactInfo = getContactInfo();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const contact = String(data.get("contact") ?? "");
    const message = String(data.get("message") ?? "");
    const errors = validateContactFields({ name, contact, message });
    setFieldErrors(errors);
    if (errors.name || errors.contact || errors.message) return;
    setStatus("sending");
    const result = await submitContactRequest({ name, contact, message });
    if (result.ok) {
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
            Contato
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Fale com a gente, do seu jeito
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary sm:text-lg">
            Tem uma dúvida, um pedido ou só quer conversar antes de decidir?
            Deixe sua mensagem com calma — respondemos pelo canal que você
            preferir, sem pressa e sem compromisso.
          </p>
        </div>

        <section
          aria-label="Envio de mensagem para a clínica"
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
                  Mensagem recebida!
                </h2>
                <p className="text-base leading-relaxed text-ink-secondary">
                  Vamos ler com carinho e responder pelo canal que você preferiu
                  — e-mail ou WhatsApp. Sem pressa dos dois lados.
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
                      Sua mensagem foi mantida — confira com calma e tente de
                      novo, sem pressa.
                    </p>
                  </div>
                ) : null}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1 block text-xs font-medium text-ink-secondary"
                    >
                      Nome completo
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ex: Maria Oliveira"
                      autoComplete="name"
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={
                        fieldErrors.name ? "contact-name-error" : undefined
                      }
                      className={inputClassName}
                    />
                    {fieldErrors.name ? (
                      <p
                        id="contact-name-error"
                        role="alert"
                        className="mt-1 text-xs text-danger"
                      >
                        {fieldErrors.name}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-contact"
                      className="mb-1 block text-xs font-medium text-ink-secondary"
                    >
                      E-mail ou WhatsApp
                    </label>
                    <input
                      id="contact-contact"
                      name="contact"
                      type="text"
                      required
                      placeholder="voce@email.com ou (00) 00000-0000"
                      autoComplete="email"
                      aria-invalid={Boolean(fieldErrors.contact)}
                      aria-describedby={
                        fieldErrors.contact
                          ? "contact-contact-error"
                          : undefined
                      }
                      className={inputClassName}
                    />
                    {fieldErrors.contact ? (
                      <p
                        id="contact-contact-error"
                        role="alert"
                        className="mt-1 text-xs text-danger"
                      >
                        {fieldErrors.contact}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-1 block text-xs font-medium text-ink-secondary"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      placeholder="Escreva com suas palavras o que você gostaria de saber..."
                      aria-invalid={Boolean(fieldErrors.message)}
                      aria-describedby={
                        fieldErrors.message
                          ? "contact-message-error"
                          : undefined
                      }
                      className={inputClassName}
                    />
                    {fieldErrors.message ? (
                      <p
                        id="contact-message-error"
                        role="alert"
                        className="mt-1 text-xs text-danger"
                      >
                        {fieldErrors.message}
                      </p>
                    ) : null}
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
                          : "Enviar mensagem"}
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-ink-muted">
                    Suas informações estão protegidas de acordo com a LGPD e
                    usadas apenas para responder a esta mensagem; nada é enviado
                    nesta demonstração.
                  </p>
                </form>
              </>
            )}
          </div>
        </section>

        <section
          aria-label="Informações da clínica"
          className="mx-auto mt-8 max-w-2xl rounded-lg bg-primary-soft p-6 sm:p-8"
        >
          <h2 className="font-display text-2xl text-ink">
            Clínica Newestetica
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">Horários</h3>
              <ul className="mt-2 space-y-1">
                {contactInfo.hours.map((line) => (
                  <li
                    key={line}
                    className="text-sm leading-relaxed text-ink-secondary"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Endereço</h3>
              <ul className="mt-1">
                {contactInfo.address.map((line) => (
                  <li
                    key={line}
                    className="text-sm leading-relaxed text-ink-secondary"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </div>
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
