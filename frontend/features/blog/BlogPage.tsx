"use client";

import { useState } from "react";
import Link from "next/link";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { searchPosts, formatDateBR } from "@/lib/blog";
import { getPostCategories, getPosts, getTreatmentOptions } from "@/lib/data";

export function BlogPage() {
  const [filter, setFilter] = useState<string>("todos");
  const [query, setQuery] = useState("");
  const [booking, setBooking] = useState(false);
  const items = searchPosts(getPosts(), query, filter);

  return (
    <>
      <Header onBook={() => setBooking(true)} />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-hover">
            Blog
          </span>
          <h1 className="mt-1 font-display text-3xl font-normal text-ink sm:text-4xl">
            Conteúdo para decidir com confiança
          </h1>
          <p className="mt-3 text-sm text-ink-secondary sm:text-base">
            Artigos leves e honestos sobre cuidados, avaliação e expectativas —
            sem pressa e sem promessas milagrosas.
          </p>
        </div>

        <div className="mx-auto mb-6 max-w-xl">
          <label
            htmlFor="blog-busca"
            className="mb-1 block text-xs font-medium text-ink-secondary"
          >
            Buscar por título ou tema
          </label>
          <input
            id="blog-busca"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ex: hidratação, avaliação…"
            className="min-h-[44px] w-full rounded-md border border-border bg-surface px-4 py-2.5 text-base text-ink focus:border-primary focus:outline-none"
          />
        </div>

        <CategoryFilter
          value={filter}
          onChange={setFilter}
          label="Filtrar artigos por categoria"
          options={["todos", ...getPostCategories()]}
        />

        {items.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <li
                key={post.id}
                className="flex flex-col rounded-lg border border-border bg-surface p-6 shadow-sm"
              >
                <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-hover">
                  {post.category}
                </span>
                <h2 className="mt-3 font-display text-xl text-ink">
                  <Link
                    href={`/blog/${post.id}`}
                    className="transition-colors hover:text-primary-hover"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-xs text-ink-muted">
                  {formatDateBR(post.publishedAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-auto max-w-xl rounded-md border border-border bg-surface p-8 text-center text-base text-ink-secondary">
            Não encontramos artigos com esse filtro — que tal tentar outra
            palavra? Novos textos chegam sempre.
          </p>
        )}
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
