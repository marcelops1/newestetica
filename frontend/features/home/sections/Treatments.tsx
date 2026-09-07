"use client";

import { useState } from "react";
import { TREATMENT_CATEGORIES, getProceduresByCategory } from "@/lib/data";
import type { Procedure, TreatmentCategory } from "@/lib/types";

const CATEGORY_LABELS: Record<TreatmentCategory, string> = {
  facial: "Facial",
  corporal: "Corporal",
  rejuvenescimento: "Rejuvenescimento",
};

type TreatmentsProps = {
  items: Procedure[];
  onBook: (treatment?: string) => void;
};

export function Treatments({ items, onBook }: TreatmentsProps) {
  const [filter, setFilter] = useState<TreatmentCategory | "todos">("todos");
  const visible = filter === "todos" ? items : getProceduresByCategory(filter);

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

      <div
        role="group"
        aria-label="Filtrar tratamentos por categoria"
        className="mb-10 flex flex-wrap justify-center gap-2"
      >
        {(["todos", ...TREATMENT_CATEGORIES] as const).map((category) => {
          const active = filter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              aria-pressed={active}
              className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-ink-secondary hover:bg-primary-soft"
              }`}
            >
              {category === "todos" ? "Todos" : CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <li
            key={item.id}
            className="flex flex-col justify-between rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-md"
          >
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-hover">
                  {CATEGORY_LABELS[item.categories[0]]}
                </span>
                <span className="text-xs font-medium text-ink-muted">
                  {item.duration}
                </span>
              </div>
              <h3 className="font-display text-2xl font-normal text-ink">
                {item.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {item.description}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-ink-muted">
                Avaliação prévia inclusa
              </span>
              <button
                type="button"
                onClick={() => onBook(item.name)}
                className="inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-primary-hover hover:text-primary"
              >
                Agendar
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
