"use client";

import { useState } from "react";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { getContactInfo } from "@/lib/data";

const NAV_ITEMS = [
  { href: "/tratamentos", label: "Tratamentos" },
  { href: "/#diferenciais", label: "Diferenciais" },
  { href: "/#resultados", label: "Resultados" },
  { href: "/#depoimentos", label: "Depoimentos" },
  { href: "/sobre", label: "A Clínica" },
];

export function Header({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false);
  const contact = getContactInfo();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Newestetica — início"
          className="flex min-h-[44px] flex-col justify-center"
        >
          <span className="font-display text-2xl font-semibold tracking-wide text-ink sm:text-3xl">
            Newestetica
          </span>
          <span className="-mt-1 text-[10px] font-medium uppercase tracking-widest text-ink-muted">
            Clínica Avançada
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-[44px] items-center text-sm font-medium text-ink-secondary hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 sm:flex">
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-ink-secondary hover:text-ink"
          >
            WhatsApp
          </a>
          <CTAButton onClick={onBook}>Agendar Avaliação</CTAButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-ink-secondary hover:text-ink md:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-b border-border bg-surface px-4 pb-6 pt-3 md:hidden">
          <nav aria-label="Navegação móvel" className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[44px] items-center py-2 text-base font-medium text-ink-secondary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-2">
            <CTAButton
              onClick={() => {
                setOpen(false);
                onBook();
              }}
            >
              Agendar Avaliação
            </CTAButton>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-base font-medium text-ink-secondary"
            >
              Falar via WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
