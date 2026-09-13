"use client";

import { useState } from "react";
import Link from "next/link";
import { CTAButton } from "@/components/CTAButton";
import { Header } from "@/features/home/sections/Header";
import { Footer } from "@/features/home/sections/Footer";
import { BookingModal } from "@/features/booking/BookingModal";
import { getTreatmentOptions } from "@/lib/data";
import { formatDateBR } from "@/lib/blog";
import type { Post } from "@/lib/types";

export function PostDetail({ post }: { post: Post }) {
  const [booking, setBooking] = useState(false);

  return (
    <>
      <Header onBook={() => setBooking(true)} />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-primary-hover"
        >
          ← Voltar ao blog
        </Link>
        <article className="mt-4 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-10">
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-hover">
            {post.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-normal text-ink sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {formatDateBR(post.publishedAt)}
          </p>
          <div className="mt-6 space-y-4">
            {post.content.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-relaxed text-ink-secondary"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 rounded-lg bg-primary-soft p-6 text-center">
            <p className="text-sm font-medium text-ink">
              Gostou do tema? Uma avaliação sem compromisso é o melhor caminho
              para tirar suas dúvidas.
            </p>
            <div className="mt-4">
              <CTAButton onClick={() => setBooking(true)}>
                Agendar uma conversa
              </CTAButton>
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <BookingModal
        key={`${booking}-${post.id}`}
        open={booking}
        treatmentOptions={getTreatmentOptions()}
        onClose={() => setBooking(false)}
      />
    </>
  );
}
