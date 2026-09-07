"use client";

import { useState } from "react";
import { CTAButton } from "@/components/CTAButton";
import { SectionHeader } from "@/components/SectionHeader";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { getTreatmentOptions } from "@/lib/data";

const VALUES = [
  {
    title: "Naturalidade antes de tudo",
    description:
      "O melhor resultado é aquele que respeita seus traços e realça o que você já tem.",
  },
  {
    title: "Escuta sem pressa",
    description:
      "Cada plano nasce de uma conversa tranquila sobre o que você deseja — nunca de uma venda.",
  },
  {
    title: "Transparência total",
    description:
      "Você entende cada etapa, cada cuidado e cada valor antes de decidir qualquer coisa.",
  },
];

export function AboutPage() {
  const [booking, setBooking] = useState(false);

  return (
    <>
      <Header onBook={() => setBooking(true)} />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary-hover">
            A Clínica
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Um espaço pensado para você se sentir em casa
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary sm:text-lg">
            A Newestetica nasceu do desejo da Fabiana Rosa de unir estética
            avançada e acolhimento de verdade — sem pressa, sem pressão e sem
            exageros.
          </p>
        </div>

        <section aria-label="História da clínica" className="mx-auto mt-12 max-w-3xl">
          <SectionHeader
            eyebrow="Nossa história"
            title="Cuidado que começa na escuta"
            description="Há mais de uma década, Fabiana Rosa — profissional fictícia desta demonstração — dedica-se a realçar a beleza natural de mulheres maduras, com estudo contínuo e atendimento individual."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {VALUES.map((item) => (
              <div
                key={item.title}
                className="rounded-md border border-border bg-surface p-6 shadow-sm"
              >
                <h3 className="font-display text-xl text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-label="Formação e confiança"
          className="mx-auto mt-12 max-w-3xl rounded-lg bg-primary-soft p-8 text-center sm:p-12"
        >
          <h2 className="font-display text-3xl text-ink">
            Formação e compromisso
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-ink-secondary">
            Formação contínua em estética avançada, protocolos personalizados
            e acompanhamento próximo em cada etapa — do primeiro olhar ao
            resultado.
          </p>
          <div className="mt-8">
            <CTAButton onClick={() => setBooking(true)}>
              Agendar uma conversa
            </CTAButton>
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
