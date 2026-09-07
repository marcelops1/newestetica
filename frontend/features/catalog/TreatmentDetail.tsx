"use client";

import { useState } from "react";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { getTreatmentOptions } from "@/lib/data";
import type { Procedure } from "@/lib/types";
import { CATEGORY_LABELS } from "@/components/CategoryFilter";

export function TreatmentDetail({ item }: { item: Procedure }) {
  const [booking, setBooking] = useState(false);

  return (
    <>
      <Header onBook={() => setBooking(true)} />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/tratamentos"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-primary-hover"
        >
          ← Voltar ao catálogo
        </Link>
        <div className="mt-4 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-10">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-hover">
            {item.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
          </span>
          <h1 className="mt-3 font-display text-3xl font-normal text-ink sm:text-4xl">
            {item.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            {item.description}
          </p>
          <p className="mt-3 text-sm font-semibold text-primary-hover">
            {item.duration} · Avaliação prévia inclusa
          </p>
          <div className="mt-8">
            <CTAButton onClick={() => setBooking(true)}>
              Agendar {item.name}
            </CTAButton>
          </div>
        </div>
      </main>
      <Footer />
      <BookingModal
        key={`${booking}-${item.id}`}
        open={booking}
        treatment={item.name}
        treatmentOptions={getTreatmentOptions()}
        onClose={() => setBooking(false)}
      />
    </>
  );
}
