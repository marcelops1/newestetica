import Link from "next/link";
import { initialsOf } from "@/lib/testimonials";
import type { Testimonial } from "@/lib/types";

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section
      id="depoimentos"
      className="border-y border-border bg-surface py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
            Depoimentos
          </span>
          <h2 className="mt-1 font-display text-3xl font-normal text-ink sm:text-4xl">
            O que nossas pacientes dizem
          </h2>
        </div>
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between rounded-lg border border-border bg-background p-6"
            >
              <div className="space-y-3">
                <div
                  role="img"
                  aria-label="Avaliação: 5 de 5 estrelas"
                  className="flex gap-1 text-warning"
                >
                  ★★★★★
                </div>
                <blockquote className="text-sm italic leading-relaxed text-ink-secondary">
                  “{item.quote}”
                </blockquote>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                  {initialsOf(item.author)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">
                    {item.author}
                  </p>
                  <p className="text-xs text-ink-muted">{item.context}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link
            href="/depoimentos"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-primary-hover underline-offset-4 hover:underline"
          >
            Ver todos os depoimentos
          </Link>
        </div>
      </div>
    </section>
  );
}
