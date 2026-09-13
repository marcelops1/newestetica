import type { Metadata } from "next";
import { BlogPage } from "@/features/blog/BlogPage";

export const metadata: Metadata = {
  title: "Blog — Newestetica",
  description:
    "Conteúdo leve e honesto sobre cuidados, avaliação e expectativas — para decidir com confiança e sem pressa.",
};

export default function BlogPageRoute() {
  return <BlogPage />;
}
