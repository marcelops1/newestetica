"use client";

import { useRef, useState } from "react";
import { CTAButton } from "@/components/CTAButton";
import type { BeforeAfter } from "@/lib/types";

type ResultsProps = {
  items: BeforeAfter[];
  onBook: (treatment?: string) => void;
};

function Comparator({ title }: { title: string }) {
  const [position, setPosition] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);

  const moveTo = (clientX: number) => {
    const box = boxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    let value = ((clientX - rect.left) / rect.width) * 100;
    value = Math.min(95, Math.max(5, value));
    setPosition(Math.round(value));
  };

  return (
    <div>
      <div
        ref={boxRef}
        role="slider"
        tabIndex={0}
        aria-label={`Comparador antes e depois: ${title}`}
        aria-valuemin={5}
        aria-valuemax={95}
        aria-valuenow={position}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setPosition((v) => Math.max(5, v - 5));
          if (event.key === "ArrowRight")
            setPosition((v) => Math.min(95, v + 5));
        }}
        onPointerDown={(event) => {
          (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
          moveTo(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.buttons > 0) moveTo(event.clientX);
        }}
        className="relative h-[320px] w-full cursor-ew-resize overflow-hidden rounded-md border border-border sm:h-[420px]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-primary-soft"
        >
          <span className="font-display text-xl text-primary-hover">
            Depois
          </span>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden border-r-2 border-white bg-surface"
          style={{ width: `${position}%` }}
        >
          <span className="font-display text-xl text-ink-muted">Antes</span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-lg"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-xs text-ink-secondary shadow-md">
            ↔
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-muted">
        Arraste para o lado — ou use as setas do teclado — para comparar
      </p>
    </div>
  );
}

export function Results({ items, onBook }: ResultsProps) {
  const visible = items.filter((item) => item.hasConsent);
  const featured = visible[0];
  if (!featured) return null;

  return (
    <section
      id="resultados"
      className="border-y border-border bg-surface py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
              Resultados Reais
            </span>
            <h2 className="mt-1 font-display text-3xl font-normal text-ink sm:text-4xl">
              Transformações sutis e autênticas
            </h2>
          </div>
          <div className="inline-flex max-w-md items-center gap-2 rounded-md border border-border bg-background p-3 text-xs text-ink-secondary">
            <svg
              className="h-5 w-5 flex-shrink-0 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>
              Imagens divulgadas com{" "}
              <strong>consentimento prévio e expresso</strong> da paciente. Os
              resultados podem variar de acordo com o organismo.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-8 rounded-lg border border-border bg-background p-6 shadow-sm sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Comparator title={featured.title} />
          </div>
          <div className="space-y-4 lg:col-span-5">
            <span className="inline-block rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-hover">
              Caso ilustrativo
            </span>
            <h3 className="font-display text-2xl text-ink sm:text-3xl">
              {featured.title}
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary">
              {featured.summary}
            </p>
            <div className="space-y-2 border-t border-border pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Sessões realizadas:</span>
                <span className="font-medium text-ink">
                  {featured.sessions}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Tempo de recuperação:</span>
                <span className="font-medium text-ink">
                  {featured.recovery}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted">Objetivo principal:</span>
                <span className="font-medium text-ink">{featured.goal}</span>
              </div>
            </div>
            <div className="pt-4">
              <CTAButton onClick={() => onBook(featured.title)}>
                Quero uma avaliação semelhante
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
