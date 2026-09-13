import Link from "next/link";

export default function BlogNotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <span className="inline-block rounded-full bg-primary-soft px-4 py-1.5 text-sm font-semibold text-primary-hover">
        Página não encontrada
      </span>
      <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
        Esse artigo não está por aqui
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-secondary">
        O endereço pode ter mudado ou o artigo saiu do ar — nada de errado com
        você. Volte ao blog e continue no seu ritmo.
      </p>
      <Link
        href="/blog"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-hover"
      >
        Voltar ao blog
      </Link>
    </main>
  );
}
