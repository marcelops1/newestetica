"use client";

import { useState } from "react";
import { CategoryFilter, type CategoryFilterValue } from "@/components/CategoryFilter";
import { TreatmentCard } from "@/components/TreatmentCard";
import { getProceduresByCategory } from "@/lib/data";
import type { Procedure } from "@/lib/types";

type TreatmentsProps = {
  items: Procedure[];
  onBook: (treatment?: string) => void;
};

export function Treatments({ items, onBook }: TreatmentsProps) {
  const [filter, setFilter] = useState<CategoryFilterValue>("todos");
  const visible =
    filter === "todos" ? items : getProceduresByCategory(filter);

  return (
    <section
      id="tratamentos"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
          Nossos Tratamentos
        </span>
        <h2 className="mt-1 font-display text-3xl font-normal text-ink sm:text-4xl">
          Cuidados desenhados para a sua pele
        </h2>
        <p className="mt-3 text-sm text-ink-secondary sm:text-base">
          Todos os tratamentos iniciam com uma análise completa para garantir
          indicação segura e alinhada às suas expectativas.
        </p>
      </div>

      <CategoryFilter
        value={filter}
        onChange={setFilter}
        label="Filtrar tratamentos por categoria"
      />

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <TreatmentCard key={item.id} item={item} onBook={onBook} />
        ))}
      </ul>
    </section>
  );
}
