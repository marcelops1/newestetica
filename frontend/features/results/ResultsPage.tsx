"use client";

import { useState } from "react";
import { BeforeAfterComparator } from "@/components/BeforeAfterComparator";
import { CTAButton } from "@/components/CTAButton";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { getBeforeAfterPageCases } from "@/lib/before-after";
import { getTreatmentOptions } from "@/lib/data";

export function ResultsPage() {
  const [booking, setBooking] = useState<{ open: boolean; treatment?: string }>(
    {
      open: false,
    },
  );
  const cases = getBeforeAfterPageCases();

  return (
    <>
      <Header onBook={() => setBooking({ open: true })} />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
            Antes e Depois
          </span>
          <h1 className="mt-1 font-display text-3xl font-normal text-ink sm:text-4xl">
            Resultados reais, com consentimento
          </h1>
          <p className="mt-3 text-base text-ink-secondary">
            Cada caso abaixo foi divulgado com o consentimento prévio e expresso
            da paciente — no seu ritmo, sem pressa.
          </p>
        </div>

        {cases.length > 0 ? (
          <ul className="space-y-8">
            {cases.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-1 items-center gap-8 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8 lg:grid-cols-12"
              >
                <div className="lg:col-span-7">
                  <BeforeAfterComparator title={item.title} />
                </div>
                <div className="space-y-4 lg:col-span-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Consentimento registrado
                  </span>
                  <h2 className="font-display text-2xl text-ink sm:text-3xl">
                    {item.title}
                  </h2>
                  <p className="text-base leading-relaxed text-ink-secondary">
                    {item.summary}
                  </p>
                  <div className="space-y-2 border-t border-border pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-muted">
                        Sessões realizadas:
                      </span>
                      <span className="font-medium text-ink">
                        {item.sessions}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-muted">
                        Tempo de recuperação:
                      </span>
                      <span className="font-medium text-ink">
                        {item.recovery}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-muted">
                        Objetivo principal:
                      </span>
                      <span className="font-medium text-ink">{item.goal}</span>
                    </div>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Os resultados podem variar de acordo com o organismo.
                  </p>
                  <div className="pt-2">
                    <CTAButton
                      onClick={() =>
                        setBooking({ open: true, treatment: item.title })
                      }
                    >
                      Quero uma avaliação semelhante
                    </CTAButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p
            role="status"
            className="mx-auto max-w-xl rounded-md border border-border bg-surface p-8 text-center text-base text-ink-secondary"
          >
            Estamos preparando novos casos com consentimento para mostrar aqui —
            volte em breve, será um prazer receber você.
          </p>
        )}
      </main>
      <Footer />
      <BookingModal
        key={`${booking.open}-${booking.treatment ?? "geral"}`}
        open={booking.open}
        treatment={booking.treatment}
        treatmentOptions={getTreatmentOptions()}
        onClose={() => setBooking({ open: false })}
      />
    </>
  );
}
