import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/features/blog/PostDetail";
import { getPostBySlug, getPosts } from "@/lib/data";

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  return {
    title: post ? `${post.title} — Newestetica` : "Artigo não encontrado",
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPostBySlug((await params).slug);
  if (!post) notFound();
  return <PostDetail post={post} />;
}
