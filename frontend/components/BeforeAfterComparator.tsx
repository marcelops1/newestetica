"use client";

import { useRef, useState } from "react";

type BeforeAfterComparatorProps = {
  title: string;
};

/** Comparador antes/depois operável por mouse, toque e teclado (blocos locais, sem fotos externas). */
export function BeforeAfterComparator({ title }: BeforeAfterComparatorProps) {
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
