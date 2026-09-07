"use client";

import { useState } from "react";
import {
  CategoryFilter,
  type CategoryFilterValue,
} from "@/components/CategoryFilter";
import { TreatmentCard } from "@/components/TreatmentCard";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { searchProcedures } from "@/lib/catalog";
import { getProcedures, getTreatmentOptions } from "@/lib/data";

export function CatalogPage() {
  const [filter, setFilter] = useState<CategoryFilterValue>("todos");
  const [query, setQuery] = useState("");
  const [booking, setBooking] = useState<{ open: boolean; treatment?: string }>(
    {
      open: false,
    },
  );
  const items = searchProcedures(getProcedures(), query, filter);

  return (
    <>
      <Header onBook={() => setBooking({ open: true })} />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
            Catálogo
          </span>
          <h1 className="mt-1 font-display text-3xl font-normal text-ink sm:text-4xl">
            Tratamentos com explicação clara
          </h1>
          <p className="mt-3 text-sm text-ink-secondary sm:text-base">
            Busque pelo nome ou filtre por categoria — sem pressa, no seu ritmo.
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-xl">
          <label
            htmlFor="catalogo-busca"
            className="mb-1 block text-xs font-medium text-ink-secondary"
          >
            Buscar por nome
          </label>
          <input
            id="catalogo-busca"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: limpeza, toxina…"
            className="min-h-[44px] w-full rounded-md border border-border bg-surface px-4 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
          />
        </div>

        <CategoryFilter
          value={filter}
          onChange={setFilter}
          label="Filtrar tratamentos por categoria"
        />

        {items.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <TreatmentCard
                key={item.id}
                item={item}
                onBook={(treatment) => setBooking({ open: true, treatment })}
              />
            ))}
          </ul>
        ) : (
          <p className="mx-auto max-w-xl rounded-md border border-border bg-surface p-8 text-center text-base text-ink-secondary">
            Não encontramos nada com esse filtro — que tal tentar outra palavra
            ou falar com a gente? Será um prazer ajudar.
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
