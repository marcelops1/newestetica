"use client";

import { useState } from "react";
import { CTAButton } from "@/components/CTAButton";
import { getQuizGoals, getRecommendation } from "@/lib/data";

export function QuizTeaser({
  onBook,
}: {
  onBook: (treatment?: string) => void;
}) {
  const goals = getQuizGoals();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const recommendation = selectedId ? getRecommendation(selectedId) : undefined;

  return (
    <section
      id="objetivos"
      className="border-y border-border bg-surface py-12 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-background p-6 shadow-sm sm:p-10">
          <div className="mb-8 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-hover">
              Simulador de Atendimento
            </span>
            <h2 className="mt-1 font-display text-2xl font-normal text-ink sm:text-3xl">
              Qual é a sua principal prioridade hoje?
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Selecione seu objetivo para ver a recomendação personalizada da
              nossa equipe.
            </p>
          </div>

          <div
            role="group"
            aria-label="Objetivos do simulador"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {goals.map((goal) => {
              const active = goal.id === selectedId;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedId(goal.id)}
                  aria-pressed={active}
                  className={`rounded-md border bg-surface p-4 text-left transition-colors focus:outline-none ${
                    active
                      ? "border-primary bg-primary-soft/30"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="mb-3 inline-block rounded-sm bg-primary-soft p-2 text-primary">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-ink">
                    {goal.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-muted">{goal.short}</p>
                </button>
              );
            })}
          </div>

          {recommendation ? (
            <div className="mt-6 rounded-md border border-primary/20 bg-primary-soft/60 p-5">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-hover">
                    Protocolo Indicado
                  </span>
                  <h4 className="mt-0.5 font-display text-xl font-semibold text-ink">
                    {recommendation.protocol}
                  </h4>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {recommendation.description}
                  </p>
                </div>
                <CTAButton onClick={() => onBook(recommendation.protocol)}>
                  Agendar este protocolo
                </CTAButton>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
